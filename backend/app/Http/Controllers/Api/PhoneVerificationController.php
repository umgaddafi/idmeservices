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

class PhoneVerificationController extends Controller
{
    public function __construct(private readonly KhadVerifyService $khadVerify)
    {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'regex:/^\+?[0-9]{10,15}$/'],
            'consent' => ['required', 'accepted'],
        ]);

        $phone = $this->normalizePhone($data['phone']);
        $user = $request->user();
        $settings = SystemSetting::query()->first();
        $amount = PricingCatalog::amount($settings, 'phone', 'premium-phone', (float) ($settings?->default_phone_price ?? 200));

        if ((float) $user->wallet_balance < $amount) {
            return response()->json([
                'message' => 'Your wallet balance is below the phone verification price.',
            ], 422);
        }

        try {
            $record = $this->transformRecord(
                $this->khadVerify->verifyPhone($phone, true),
                $phone
            );
        } catch (RuntimeException $exception) {
            $message = $exception->getMessage();
            $status = str_contains($message, 'configured') ? 500 : 422;

            return response()->json([
                'message' => $message,
            ], $status);
        }

        [$verification, $transaction, $updatedUser] = DB::transaction(function () use ($amount, $phone, $record, $user): array {
            $freshUser = User::query()->findOrFail($user->id);

            if ((float) $freshUser->wallet_balance < $amount) {
                throw ValidationException::withMessages([
                    'wallet' => 'Your wallet balance is below the phone verification price.',
                ]);
            }

            $freshUser->wallet_balance = (float) $freshUser->wallet_balance - $amount;
            $freshUser->phone = $record['phoneNumber'] ?: $phone;
            $freshUser->save();

            $verification = Verification::query()->create([
                'user_id' => $freshUser->id,
                'reference' => 'PHN-'.Str::upper(Str::random(8)),
                'channel' => 'Phone Verification',
                'identifier' => $record['phoneNumber'] ?: $phone,
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
                'type' => 'Phone Verification',
                'direction' => 'debit',
                'amount' => $amount,
                'status' => 'Completed',
                'description' => 'Phone verification charge',
                'metadata' => ['verificationReference' => $verification->reference],
                'processed_at' => now(),
            ]);

            AuditLog::query()->create([
                'actor_user_id' => $freshUser->id,
                'target_user_id' => $freshUser->id,
                'actor' => $freshUser->name,
                'actor_role' => $freshUser->role,
                'target' => $verification->reference,
                'action' => 'Phone Verification Completed',
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
            'message' => 'Phone verification successful.',
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

    private function transformRecord(array $payload, string $fallbackPhone): array
    {
        $record = (array) (data_get($payload, 'data') ?: $payload);
        $personalDetails = (array) data_get($record, 'personal_details', []);
        $contactDetails = (array) data_get($record, 'contact_details', []);
        $metadata = (array) data_get($record, 'verification_metadata', []);
        $phone = $this->normalizePhone(
            data_get($record, 'phone')
            ?: data_get($record, 'phone_number')
            ?: data_get($record, 'mobile')
            ?: data_get($record, 'number')
            ?: data_get($record, 'identity_number')
            ?: data_get($contactDetails, 'phone_number')
            ?: data_get($contactDetails, 'phone')
            ?: $fallbackPhone
        );

        $firstName = $this->normalizeUpper(data_get($personalDetails, 'first_name'));
        $middleName = $this->normalizeUpper(data_get($personalDetails, 'middle_name'));
        $lastName = $this->normalizeUpper(
            data_get($personalDetails, 'last_name') ?? data_get($personalDetails, 'surname')
        );
        $address = trim((string) (
            data_get($personalDetails, 'address')
            ?: data_get($contactDetails, 'address')
            ?: data_get($record, 'address')
            ?: ''
        ));

        return [
            'phoneNumber' => $phone,
            'firstName' => $firstName ?: 'N/A',
            'middleName' => $middleName,
            'lastName' => $lastName ?: 'N/A',
            'fullName' => trim((string) (
                data_get($personalDetails, 'full_name')
                ?: implode(' ', array_filter([$firstName, $middleName, $lastName]))
            )),
            'dateOfBirth' => (string) (data_get($personalDetails, 'date_of_birth') ?: ''),
            'gender' => $this->normalizeTitle(
                data_get($personalDetails, 'gender') ?? data_get($personalDetails, 'sex')
            ) ?: 'N/A',
            'address' => $address,
            'carrier' => (string) (
                data_get($record, 'carrier')
                ?: data_get($record, 'network')
                ?: data_get($record, 'operator')
                ?: ''
            ),
            'lineType' => (string) (
                data_get($record, 'line_type')
                ?: data_get($record, 'type')
                ?: ''
            ),
            'status' => (string) (
                data_get($record, 'status')
                ?: data_get($metadata, 'status')
                ?: 'Verified'
            ),
            'reference' => (string) (
                data_get($metadata, 'tracking_id')
                ?: data_get($metadata, 'request_id')
                ?: data_get($record, 'reference')
                ?: 'PHN-'.now()->format('YmdHis')
            ),
        ];
    }

    private function normalizePhone(mixed $phone): string
    {
        $value = trim((string) ($phone ?? ''));

        if (str_starts_with($value, '+')) {
            return '+'.preg_replace('/\D+/', '', substr($value, 1));
        }

        return preg_replace('/\D+/', '', $value) ?: '';
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
}
