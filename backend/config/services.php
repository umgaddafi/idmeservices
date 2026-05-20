<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'paystack' => [
        'base_url' => env('PAYSTACK_BASE_URL', 'https://api.paystack.co'),
        'public_key' => env('PAYSTACK_PUBLIC_KEY'),
        'secret_key' => env('PAYSTACK_SECRET_KEY'),
        'dedicated_account_banks' => array_values(array_filter(array_map(
            static fn (string $bank): string => trim($bank),
            explode(',', env('PAYSTACK_DVA_BANKS', env('PAYSTACK_DVA_PREFERRED_BANK', 'wema-bank')))
        ))),
    ],

    'khadverify' => [
        'base_url' => env('KHADVERIFY_BASE_URL', 'https://khadverify.com.ng/api'),
        'api_key' => env('KHADVERIFY_API_KEY', 'v1_khadverify_2c1e3028de13e8b892c00af9420a51ff67a78c6a'),
        'phone_verify_path' => env('KHADVERIFY_PHONE_VERIFY_PATH', '/verifyPhone'),
    ],

];
