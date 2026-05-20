<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_bootstrap_endpoint_is_publicly_available(): void
    {
        $response = $this->app->handle(Request::create('/api/bootstrap', 'GET'));

        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame(['settings'], array_keys(json_decode($response->getContent(), true)));
    }

    public function test_the_settings_endpoint_requires_authentication(): void
    {
        $response = $this->app->handle(Request::create('/api/settings', 'GET'));

        $this->assertSame(401, $response->getStatusCode());
        $this->assertSame(
            ['message' => 'Unauthenticated.'],
            json_decode($response->getContent(), true)
        );
    }
}
