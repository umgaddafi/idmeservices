<?php

return [
    'branding' => [
        'system_name' => env('SYSTEM_NAME', env('APP_NAME', 'IDM e-Services')),
        'support_email' => env('SUPPORT_EMAIL', 'support@idmeservices.com.ng'),
        'support_phone' => env('SUPPORT_PHONE', '+2348000000000'),
    ],

    'currency' => [
        'code' => strtoupper((string) env('APP_CURRENCY_CODE', 'USD')),
        'locale' => env('APP_CURRENCY_LOCALE', 'en-US'),
        'rate' => (float) env('APP_CURRENCY_RATE', 1),
    ],

    'pricing_source' => strtolower((string) env('APP_PRICING_SOURCE', 'env')),

    'pricing' => [
        'nin_premium' => (float) env('PRICE_NIN_PREMIUM', 150),
        'nin_regular' => (float) env('PRICE_NIN_REGULAR', 150),
        'phone_premium' => (float) env('PRICE_PHONE_PREMIUM', 200),
        'phone_regular' => (float) env('PRICE_PHONE_REGULAR', 200),
        'phone_standard' => (float) env('PRICE_PHONE_STANDARD', 200),
        'bvn_premium' => (float) env('PRICE_BVN_PREMIUM', 170),
        'bvn_regular' => (float) env('PRICE_BVN_REGULAR', 170),
        'modification_dob' => (float) env('PRICE_MODIFICATION_DOB', 43000),
        'modification_phone' => (float) env('PRICE_MODIFICATION_PHONE', 8000),
        'modification_address' => (float) env('PRICE_MODIFICATION_ADDRESS', 8000),
        'modification_name' => (float) env('PRICE_MODIFICATION_NAME', 8000),
        'birth_attestation_permanent' => (float) env('PRICE_BIRTH_ATTESTATION_PERMANENT', 1500),
        'birth_attestation_temporary' => (float) env('PRICE_BIRTH_ATTESTATION_TEMPORARY', 1000),
        'diaspora_child_birth' => (float) env('PRICE_DIASPORA_CHILD_BIRTH', 2000),
        'ipe_error_50' => (float) env('PRICE_IPE_ERROR_50', 1000),
        'other_express' => (float) env('PRICE_OTHER_EXPRESS', 250),
        'other_default' => (float) env('PRICE_OTHER_DEFAULT', 180),
    ],
];
