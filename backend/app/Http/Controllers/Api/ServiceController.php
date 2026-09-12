<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Support\Api\ServicePayload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ServiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Service::query()->orderBy('sort_order')->orderBy('title');

        if ($request->boolean('homepage')) {
            $query->where('show_on_homepage', true)->where('status', 'Live');
        }

        return response()->json([
            'services' => $query->get()->map(fn (Service $service): array => ServicePayload::from($service))->values(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorizeAdmin($request);
        $data = $this->validated($request);
        $data['slug'] = $this->uniqueSlug($data['title']);
        $data['image_path'] = $request->hasFile('image') ? $this->storeImage($request->file('image')) : null;

        $service = Service::query()->create($this->toModelData($data));

        return response()->json([
            'message' => 'Service created.',
            'service' => ServicePayload::from($service),
        ], 201);
    }

    public function update(Request $request, Service $service): JsonResponse
    {
        $this->authorizeAdmin($request);
        $data = $this->validated($request, true);

        if (array_key_exists('title', $data) && $data['title'] !== $service->title) {
            $data['slug'] = $this->uniqueSlug($data['title'], $service->id);
        }

        if ($request->hasFile('image')) {
            $data['image_path'] = $this->storeImage($request->file('image'));
        }

        $service->fill($this->toModelData($data, true))->save();

        return response()->json([
            'message' => 'Service updated.',
            'service' => ServicePayload::from($service->fresh()),
        ]);
    }

    public function destroy(Request $request, Service $service): JsonResponse
    {
        $this->authorizeAdmin($request);
        $service->delete();

        return response()->json(['message' => 'Service deleted.']);
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless(strtoupper((string) $request->user()?->role) === 'ADMIN', 403, 'Forbidden.');
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'title' => [$required, 'string', 'max:255'],
            'category' => ['sometimes', 'string', 'max:100'],
            'type' => ['nullable', 'string', 'max:100'],
            'routePath' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'amount' => ['sometimes', 'numeric', 'min:0'],
            'status' => ['sometimes', Rule::in(['Live', 'Draft', 'Hidden'])],
            'sortOrder' => ['sometimes', 'integer', 'min:0'],
            'showOnHomepage' => ['sometimes', 'boolean'],
            'image' => ['nullable', 'image', 'max:5120'],
        ]);
    }

    private function toModelData(array $data, bool $partial = false): array
    {
        $mapped = [];
        foreach ($data as $key => $value) {
            $mapped[match ($key) {
                'routePath' => 'route_path',
                'sortOrder' => 'sort_order',
                'showOnHomepage' => 'show_on_homepage',
                default => $key,
            }] = $value;
        }

        if (! $partial) {
            $mapped += [
                'category' => 'verification',
                'amount' => 0,
                'status' => 'Live',
                'sort_order' => 0,
                'show_on_homepage' => true,
            ];
        }

        return $mapped;
    }

    private function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title) ?: Str::random(8);
        $slug = $base;
        $count = 2;

        while (Service::query()->where('slug', $slug)->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))->exists()) {
            $slug = $base.'-'.$count++;
        }

        return $slug;
    }

    private function storeImage(UploadedFile $image): string
    {
        $directory = public_path('uploads/services');

        if (! is_dir($directory)) {
            mkdir($directory, 0775, true);
        }

        $filename = now()->format('YmdHis').'-'.Str::random(8).'.'.$image->getClientOriginalExtension();
        $image->move($directory, $filename);

        return '/uploads/services/'.$filename;
    }
}
