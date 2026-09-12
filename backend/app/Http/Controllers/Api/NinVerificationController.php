<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\SystemSetting;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Verification;
use App\Services\KhadVerifyService;
use App\Support\PricingCatalog;
use App\Support\Api\CurrencyPayload;
use App\Support\Api\TransactionPayload;
use App\Support\Api\UserPayload;
use App\Support\Api\VerificationPayload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class NinVerificationController extends Controller
{
    public function __construct(private readonly KhadVerifyService $khadVerify)
    {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nin' => ['required', 'digits:11'],
            'consent' => ['required', 'accepted'],
        ]);

        $user = $request->user();
        $settings = SystemSetting::query()->first();
        $amount = PricingCatalog::amount($settings, 'nin', 'premium', (float) ($settings?->default_nin_price ?? 150));

        if ((float) $user->wallet_balance < $amount) {
            return response()->json([
                'message' => 'Your wallet balance is below the NIN verification price.',
            ], 422);
        }

        try {
            $record = $this->transformRecord(
                $this->khadVerify->verifyNin($data['nin'], true),
                $data['nin']
            );
        } catch (RuntimeException $exception) {
            $message = $exception->getMessage();
            $status = str_contains($message, 'configured') ? 500 : 422;

            return response()->json([
                'message' => $message,
            ], $status);
        }

        [$verification, $transaction, $updatedUser] = DB::transaction(function () use ($amount, $record, $user): array {
            $freshUser = User::query()->findOrFail($user->id);

            if ((float) $freshUser->wallet_balance < $amount) {
                throw ValidationException::withMessages([
                    'wallet' => 'Your wallet balance is below the NIN verification price.',
                ]);
            }

            $freshUser->wallet_balance = (float) $freshUser->wallet_balance - $amount;
            $freshUser->nin = $record['nin'] ?: $freshUser->nin;
            $freshUser->save();

            $verification = Verification::query()->create([
                'user_id' => $freshUser->id,
                'reference' => 'NIN-'.Str::upper(Str::random(8)),
                'channel' => 'NIN Verification',
                'identifier' => $record['nin'],
                'amount' => $amount,
                'status' => 'Completed',
                'result' => $record,
                'requested_at' => now(),
                'completed_at' => now(),
            ]);

            $transaction = Transaction::query()->create([
                'user_id' => $freshUser->id,
                'verification_id' => $verification->id,
                'reference' => 'TXN-'.Str::upper(Str::random(10)),
                'type' => 'NIN Verification',
                'direction' => 'debit',
                'amount' => $amount,
                'status' => 'Completed',
                'description' => 'NIN verification charge',
                'metadata' => ['verificationReference' => $verification->reference],
                'processed_at' => now(),
            ]);

            AuditLog::query()->create([
                'actor_user_id' => $freshUser->id,
                'target_user_id' => $freshUser->id,
                'actor' => $freshUser->name,
                'actor_role' => $freshUser->role,
                'target' => $verification->reference,
                'action' => 'NIN Verification Completed',
                'status' => 'Completed',
                'timestamp' => now(),
                'metadata' => [
                    'transactionReference' => $transaction->reference,
                    'walletBalance' => (float) $freshUser->wallet_balance,
                ],
            ]);

            return [$verification->load('user'), $transaction, $freshUser->fresh()];
        });

        return response()->json([
            'message' => 'NIN verification successful.',
            'record' => $record,
            'user' => UserPayload::from($updatedUser),
            'transaction' => TransactionPayload::from($transaction),
            'verification' => VerificationPayload::from($verification),
            'wallet' => [
                'balance' => (float) $updatedUser->wallet_balance,
                'currency' => CurrencyPayload::code(),
            ],
        ]);
    }

    private function transformRecord(array $payload, string $fallbackNin): array
    {
        $personalDetails = (array) data_get($payload, 'personal_details', []);
        $biometricData = (array) data_get($payload, 'biometric_data', []);
        $verificationMetadata = (array) data_get($payload, 'verification_metadata', []);

        $firstName = $this->normalizeUpper(data_get($personalDetails, 'first_name'));
        $middleName = $this->normalizeUpper(data_get($personalDetails, 'middle_name'));
        $surname = $this->normalizeUpper(
            data_get($personalDetails, 'last_name') ?? data_get($personalDetails, 'surname')
        );
        $gender = $this->normalizeTitle(
            data_get($personalDetails, 'gender') ?? data_get($personalDetails, 'sex')
        );

        return [
            'nin' => (string) (data_get($payload, 'identity_number') ?: $fallbackNin),
            'surname' => $surname ?: 'N/A',
            'firstName' => $firstName ?: 'N/A',
            'middleName' => $middleName,
            'givenNames' => trim(implode(' ', array_filter([$firstName, $middleName]))),
            'dateOfBirth' => (string) (data_get($personalDetails, 'date_of_birth') ?: ''),
            'sex' => $gender ? strtoupper(substr($gender, 0, 1)) : '',
            'gender' => $gender ?: 'N/A',
            'issueDate' => (string) (
                data_get($payload, 'issue_date')
                ?: data_get($verificationMetadata, 'timestamp')
                ?: now()->toIso8601String()
            ),
            'trackingId' => (string) (
                data_get($verificationMetadata, 'tracking_id')
                ?: data_get($verificationMetadata, 'request_id')
                ?: data_get($payload, 'tracking_id')
                ?: 'NIN-'.now()->format('YmdHis')
            ),
            'addressLines' => $this->splitAddress((string) data_get($personalDetails, 'address', '')),
            'nationalityCode' => $this->normalizeUpper(data_get($personalDetails, 'nationality')) ?: 'NGA',
            'passportPhoto' => $this->normalizePhoto((string) data_get($biometricData, 'photo', '')),
        ];
    }

    private function normalizeUpper(mixed $value): string
    {
        return strtoupper(trim((string) ($value ?? '')));
    }

    private function normalizeTitle(mixed $value): string
    {
        $text = trim((string) ($value ?? ''));

        if ($text === '') {
            return '';
        }

        return ucfirst(strtolower($text));
    }

    private function splitAddress(string $address): array
    {
        $parts = array_values(array_filter(array_map('trim', preg_split('/,|\r\n|\r|\n/', $address) ?: [])));

        if ($parts === []) {
            return ['', '', ''];
        }

        return array_pad(array_slice($parts, 0, 3), 3, '');
    }

    private function normalizePhoto(string $photo): ?string
    {
        $cleanPhoto = trim($photo);

        if ($cleanPhoto === '') {
            return null;
        }

        if (str_starts_with($cleanPhoto, 'data:image/')) {
            return $cleanPhoto;
        }

        return 'data:image/jpeg;base64,'.preg_replace('/\s+/', '', $cleanPhoto);
    }
}
