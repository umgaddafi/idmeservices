<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\ServiceRequest;
use App\Models\SystemSetting;
use App\Models\Transaction;
use App\Models\User;
use App\Support\PricingCatalog;
use App\Support\Api\CurrencyPayload;
use App\Support\Api\ServiceRequestPayload;
use App\Support\Api\TransactionPayload;
use App\Support\Api\UserPayload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ServiceRequestController extends Controller
{
    private const CATEGORY_NIN_MODIFICATION = 'ninModifications';
    private const CATEGORY_BIRTH_ATTESTATION = 'birthAttestations';
    private const CATEGORY_DIASPORA_BIRTH = 'diasporaBirth';
    private const CATEGORY_RESOLUTION = 'resolutions';

    public function index(Request $request): JsonResponse
    {
        $allowedCategories = [
            self::CATEGORY_NIN_MODIFICATION,
            self::CATEGORY_BIRTH_ATTESTATION,
            self::CATEGORY_DIASPORA_BIRTH,
            self::CATEGORY_RESOLUTION,
        ];

        $validated = $request->validate([
            'category' => ['nullable', Rule::in($allowedCategories)],
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = ServiceRequest::query()
            ->where('user_id', $request->user()->id)
            ->with('user')
            ->orderByDesc('submitted_at')
            ->orderByDesc('created_at');

        if (! empty($validated['category'])) {
            $query->where('category', $validated['category']);
        }

        $limit = (int) ($validated['limit'] ?? 50);

        return response()->json([
            'requests' => $query
                ->limit($limit)
                ->get()
                ->map(fn (ServiceRequest $serviceRequest): array => ServiceRequestPayload::from($serviceRequest))
                ->values()
                ->all(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validatePayload($request);
        $this->ensureRequiredFields($request, $data);
        [$typeLabel, $amount] = $this->resolvePricing($data['category'], $data['type']);
        $user = $request->user();

        $details = $this->buildDetails($data['category'], $data['type'], $data);
        $identifier = $this->resolveIdentifier($data['category'], $details);
        $picturePath = $request->hasFile('picture')
            ? $this->storePicture($request->file('picture'))
            : null;

        [$serviceRequest, $transaction, $updatedUser] = DB::transaction(function () use (
            $amount,
            $details,
            $identifier,
            $picturePath,
            $typeLabel,
            $user,
            $data
        ): array {
            $freshUser = User::query()->findOrFail($user->id);

            if ((float) $freshUser->wallet_balance < $amount) {
                throw ValidationException::withMessages([
                    'wallet' => 'Your wallet balance is below the service price.',
                ]);
            }

            $freshUser->wallet_balance = (float) $freshUser->wallet_balance - $amount;
            $freshUser->save();

            $referencePrefix = match ($data['category']) {
                self::CATEGORY_BIRTH_ATTESTATION => 'BIRTH',
                self::CATEGORY_DIASPORA_BIRTH => 'DIASP',
                self::CATEGORY_RESOLUTION => 'RES',
                default => 'NIN-MOD',
            };

            $serviceRequest = ServiceRequest::query()->create([
                'user_id' => $freshUser->id,
                'category' => $data['category'],
                'type' => $typeLabel,
                'reference' => $referencePrefix.'-'.Str::upper(Str::random(10)),
                'identifier' => $identifier,
                'email' => $data['email'] ?? $freshUser->email,
                'amount' => $amount,
                'status' => 'New Request',
                'picture_path' => $picturePath,
                'details' => $details,
                'submitted_at' => now(),
            ]);

            $transaction = Transaction::query()->create([
                'user_id' => $freshUser->id,
                'reference' => 'TXN-'.Str::upper(Str::random(10)),
                'type' => $typeLabel,
                'direction' => 'debit',
                'amount' => $amount,
                'status' => 'Completed',
                'description' => $typeLabel.' charge',
                'metadata' => [
                    'serviceRequestReference' => $serviceRequest->reference,
                    'category' => $serviceRequest->category,
                ],
                'processed_at' => now(),
            ]);

            AuditLog::query()->create([
                'actor_user_id' => $freshUser->id,
                'target_user_id' => $freshUser->id,
                'actor' => $freshUser->name,
                'actor_role' => $freshUser->role,
                'target' => $serviceRequest->reference,
                'action' => $typeLabel.' Submitted',
                'status' => 'Completed',
                'timestamp' => now(),
                'metadata' => [
                    'transactionReference' => $transaction->reference,
                    'walletBalance' => (float) $freshUser->wallet_balance,
                ],
            ]);

            return [$serviceRequest->load('user'), $transaction, $freshUser->fresh()];
        });

        return response()->json([
            'message' => $typeLabel.' submitted successfully.',
            'request' => ServiceRequestPayload::from($serviceRequest),
            'transaction' => TransactionPayload::from($transaction),
            'user' => UserPayload::from($updatedUser),
            'wallet' => [
                'balance' => (float) $updatedUser->wallet_balance,
                'currency' => CurrencyPayload::code(),
            ],
        ], 201);
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'category' => ['required', Rule::in([
                self::CATEGORY_NIN_MODIFICATION,
                self::CATEGORY_BIRTH_ATTESTATION,
                self::CATEGORY_DIASPORA_BIRTH,
                self::CATEGORY_RESOLUTION,
            ])],
            'type' => ['required', 'string', 'max:100'],
            'nin' => ['nullable', 'digits:11'],
            'parentNinId' => ['nullable', 'digits:11'],
            'trackingId' => ['nullable', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'max:255'],
            'firstName' => ['nullable', 'string', 'max:255'],
            'middleName' => ['nullable', 'string', 'max:255'],
            'surname' => ['nullable', 'string', 'max:255'],
            'oldPhoneNumber' => ['nullable', 'string', 'max:20'],
            'newPhoneNumber' => ['nullable', 'string', 'max:20'],
            'dateOfBirth' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'max:50'],
            'stateOfOrigin' => ['nullable', 'string', 'max:255'],
            'lgaOfOrigin' => ['nullable', 'string', 'max:255'],
            'homeTownVillage' => ['nullable', 'string', 'max:255'],
            'residenceStateLga' => ['nullable', 'string', 'max:255'],
            'residentialAddress' => ['nullable', 'string'],
            'occupation' => ['nullable', 'string', 'max:255'],
            'fatherName' => ['nullable', 'string', 'max:255'],
            'fatherAddress' => ['nullable', 'string'],
            'motherName' => ['nullable', 'string', 'max:255'],
            'motherAddress' => ['nullable', 'string'],
            'oldAddress' => ['nullable', 'string'],
            'newAddress' => ['nullable', 'string'],
            'countryOfBirth' => ['nullable', 'string', 'max:255'],
            'ninOwner' => ['nullable', 'string', 'max:50'],
            'picture' => ['nullable', 'image', 'max:4096'],
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function ensureRequiredFields(Request $request, array $data): void
    {
        $required = match ($data['category']) {
            self::CATEGORY_NIN_MODIFICATION => match ($data['type']) {
                'name' => ['nin', 'firstName', 'surname'],
                'phone' => ['nin', 'newPhoneNumber'],
                'dob' => ['nin', 'email', 'firstName', 'surname', 'dateOfBirth', 'gender', 'stateOfOrigin', 'lgaOfOrigin', 'homeTownVillage', 'residenceStateLga', 'residentialAddress', 'occupation', 'fatherName', 'fatherAddress', 'motherName', 'motherAddress'],
                'address' => ['nin', 'email', 'firstName', 'surname', 'oldAddress', 'newAddress'],
                default => [],
            },
            self::CATEGORY_BIRTH_ATTESTATION => ['nin', 'email', 'firstName', 'surname', 'dateOfBirth', 'gender', 'countryOfBirth', 'stateOfOrigin', 'lgaOfOrigin', 'homeTownVillage', 'residenceStateLga', 'residentialAddress', 'occupation', 'fatherName', 'fatherAddress', 'motherName', 'motherAddress'],
            self::CATEGORY_DIASPORA_BIRTH => ['parentNinId', 'ninOwner', 'email', 'firstName', 'surname', 'dateOfBirth', 'gender', 'countryOfBirth', 'stateOfOrigin', 'lgaOfOrigin', 'homeTownVillage', 'residenceStateLga', 'residentialAddress', 'occupation', 'fatherName', 'fatherAddress', 'motherName', 'motherAddress'],
            self::CATEGORY_RESOLUTION => ['trackingId'],
            default => [],
        };

        $errors = [];

        foreach ($required as $field) {
            if (blank($data[$field] ?? null)) {
                $errors[$field] = [ucfirst((string) preg_replace('/([a-z])([A-Z])/', '$1 $2', $field)).' is required.'];
            }
        }

        if (
            ($data['category'] === self::CATEGORY_NIN_MODIFICATION && in_array($data['type'], ['name', 'phone', 'address'], true))
            || ($data['category'] === self::CATEGORY_BIRTH_ATTESTATION && $data['type'] === 'permanent')
        ) {
            if (! $request->hasFile('picture')) {
                $errors['picture'] = ['Picture upload is required.'];
            }
        }

        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function buildDetails(string $category, string $type, array $data): array
    {
        return match ($category) {
            self::CATEGORY_NIN_MODIFICATION => match ($type) {
                'name' => [
                    'nin' => $data['nin'] ?? '',
                    'firstName' => $data['firstName'] ?? '',
                    'middleName' => $data['middleName'] ?? '',
                    'surname' => $data['surname'] ?? '',
                ],
                'phone' => [
                    'nin' => $data['nin'] ?? '',
                    'oldPhoneNumber' => $data['oldPhoneNumber'] ?? '',
                    'newPhoneNumber' => $data['newPhoneNumber'] ?? '',
                ],
                'dob' => [
                    'nin' => $data['nin'] ?? '',
                    'email' => $data['email'] ?? '',
                    'firstName' => $data['firstName'] ?? '',
                    'middleName' => $data['middleName'] ?? '',
                    'surname' => $data['surname'] ?? '',
                    'dateOfBirth' => $data['dateOfBirth'] ?? '',
                    'gender' => $data['gender'] ?? '',
                    'stateOfOrigin' => $data['stateOfOrigin'] ?? '',
                    'lgaOfOrigin' => $data['lgaOfOrigin'] ?? '',
                    'homeTownVillage' => $data['homeTownVillage'] ?? '',
                    'residenceStateLga' => $data['residenceStateLga'] ?? '',
                    'residentialAddress' => $data['residentialAddress'] ?? '',
                    'occupation' => $data['occupation'] ?? '',
                    'fatherName' => $data['fatherName'] ?? '',
                    'fatherAddress' => $data['fatherAddress'] ?? '',
                    'motherName' => $data['motherName'] ?? '',
                    'motherAddress' => $data['motherAddress'] ?? '',
                ],
                'address' => [
                    'nin' => $data['nin'] ?? '',
                    'email' => $data['email'] ?? '',
                    'firstName' => $data['firstName'] ?? '',
                    'surname' => $data['surname'] ?? '',
                    'oldAddress' => $data['oldAddress'] ?? '',
                    'newAddress' => $data['newAddress'] ?? '',
                ],
                default => throw ValidationException::withMessages(['type' => 'Unsupported modification type.']),
            },
            self::CATEGORY_BIRTH_ATTESTATION => [
                'nin' => $data['nin'] ?? '',
                'email' => $data['email'] ?? '',
                'firstName' => $data['firstName'] ?? '',
                'middleName' => $data['middleName'] ?? '',
                'surname' => $data['surname'] ?? '',
                'dateOfBirth' => $data['dateOfBirth'] ?? '',
                'gender' => $data['gender'] ?? '',
                'countryOfBirth' => $data['countryOfBirth'] ?? '',
                'stateOfOrigin' => $data['stateOfOrigin'] ?? '',
                'lgaOfOrigin' => $data['lgaOfOrigin'] ?? '',
                'homeTownVillage' => $data['homeTownVillage'] ?? '',
                'residenceStateLga' => $data['residenceStateLga'] ?? '',
                'residentialAddress' => $data['residentialAddress'] ?? '',
                'occupation' => $data['occupation'] ?? '',
                'fatherName' => $data['fatherName'] ?? '',
                'fatherAddress' => $data['fatherAddress'] ?? '',
                'motherName' => $data['motherName'] ?? '',
                'motherAddress' => $data['motherAddress'] ?? '',
            ],
            self::CATEGORY_DIASPORA_BIRTH => [
                'parentNinId' => $data['parentNinId'] ?? '',
                'ninOwner' => $data['ninOwner'] ?? '',
                'email' => $data['email'] ?? '',
                'firstName' => $data['firstName'] ?? '',
                'middleName' => $data['middleName'] ?? '',
                'surname' => $data['surname'] ?? '',
                'dateOfBirth' => $data['dateOfBirth'] ?? '',
                'gender' => $data['gender'] ?? '',
                'countryOfBirth' => $data['countryOfBirth'] ?? '',
                'stateOfOrigin' => $data['stateOfOrigin'] ?? '',
                'lgaOfOrigin' => $data['lgaOfOrigin'] ?? '',
                'homeTownVillage' => $data['homeTownVillage'] ?? '',
                'residenceStateLga' => $data['residenceStateLga'] ?? '',
                'residentialAddress' => $data['residentialAddress'] ?? '',
                'occupation' => $data['occupation'] ?? '',
                'fatherName' => $data['fatherName'] ?? '',
                'fatherAddress' => $data['fatherAddress'] ?? '',
                'motherName' => $data['motherName'] ?? '',
                'motherAddress' => $data['motherAddress'] ?? '',
            ],
            self::CATEGORY_RESOLUTION => [
                'trackingId' => $data['trackingId'] ?? '',
                'issueType' => 'IPE / Error 50 / Resolution',
            ],
            default => throw ValidationException::withMessages(['category' => 'Unsupported service request category.']),
        };
    }

    /**
     * @param  array<string, mixed>  $details
     */
    private function resolveIdentifier(string $category, array $details): ?string
    {
        return match ($category) {
            self::CATEGORY_DIASPORA_BIRTH => $details['parentNinId'] ?: null,
            self::CATEGORY_RESOLUTION => $details['trackingId'] ?: null,
            default => $details['nin'] ?: null,
        };
    }

    /**
     * @return array{0: string, 1: float}
     */
    private function resolvePricing(string $category, string $type): array
    {
        $settings = SystemSetting::query()->first();

        return match ($category) {
            self::CATEGORY_NIN_MODIFICATION => match ($type) {
                'name' => ['NAME MODIFICATION', PricingCatalog::amount($settings, 'modification', 'name-modification', 8000.0)],
                'phone' => ['PHONE NUMBER MODIFICATION', PricingCatalog::amount($settings, 'modification', 'phone-modification', 8000.0)],
                'dob' => ['DOB MODIFICATION', PricingCatalog::amount($settings, 'modification', 'dob-modification', 43000.0)],
                'address' => ['ADDRESS MODIFICATION', PricingCatalog::amount($settings, 'modification', 'address-modification', 8000.0)],
                default => throw ValidationException::withMessages(['type' => 'Unsupported modification type.']),
            },
            self::CATEGORY_BIRTH_ATTESTATION => match ($type) {
                'permanent' => ['PERMANENT BIRTH ATTESTATION', PricingCatalog::amount($settings, 'birthAttestation', 'permanent-attestation', 1500.0)],
                'temporary' => ['TEMPORARY BIRTH ATTESTATION', PricingCatalog::amount($settings, 'birthAttestation', 'temporary-attestation', 1000.0)],
                default => throw ValidationException::withMessages(['type' => 'Unsupported birth attestation type.']),
            },
            self::CATEGORY_DIASPORA_BIRTH => ['DIASPORA CHILD BIRTH NOTIFICATION', PricingCatalog::amount($settings, 'diaspora', 'diaspora-child-birth', 2000.0)],
            self::CATEGORY_RESOLUTION => ['SUBMIT TRACKING ID', PricingCatalog::amount($settings, 'resolutions', 'ipe-error-50', 1000.0)],
            default => throw ValidationException::withMessages(['category' => 'Unsupported service request category.']),
        };
    }

    private function storePicture(UploadedFile $picture): string
    {
        $directory = public_path('uploads/service-requests');

        if (! is_dir($directory)) {
            mkdir($directory, 0775, true);
        }

        $filename = now()->format('YmdHis').'-'.Str::random(8).'.'.$picture->getClientOriginalExtension();
        $picture->move($directory, $filename);

        return '/uploads/service-requests/'.$filename;
    }
}
