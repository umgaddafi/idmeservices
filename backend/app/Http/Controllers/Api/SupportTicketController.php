<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class SupportTicketController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $limit = max(1, min((int) $request->query('limit', 50), 200));
        $tickets = SupportTicket::query()
            ->with('user')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (SupportTicket $ticket): array => $this->payload($ticket))
            ->values()
            ->all();

        return response()->json(['tickets' => $tickets]);
    }

    public function memberIndex(Request $request): JsonResponse
    {
        $tickets = SupportTicket::query()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn (SupportTicket $ticket): array => $this->payload($ticket))
            ->values()
            ->all();

        return response()->json(['tickets' => $tickets]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
            'subject' => ['nullable', 'string', 'max:255'],
            'channel' => ['nullable', 'string', 'max:100'],
        ]);

        $ticket = SupportTicket::query()->create([
            'guest_name' => $data['name'],
            'guest_email' => $data['email'],
            'subject' => $data['subject'] ?? 'Homepage support message',
            'channel' => $data['channel'] ?? 'Homepage Form',
            'priority' => 'Medium',
            'status' => 'Open',
            'message' => $data['message'],
        ]);

        return response()->json([
            'message' => 'Your message has been sent successfully.',
            'ticket' => $this->payload($ticket),
        ], 201);
    }

    public function storeMember(Request $request): JsonResponse
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
            'subject' => ['nullable', 'string', 'max:255'],
            'channel' => ['nullable', 'string', 'max:100'],
        ]);

        $ticket = SupportTicket::query()->create([
            'user_id' => $request->user()->id,
            'subject' => $data['subject'] ?? 'Client support message',
            'channel' => $data['channel'] ?? 'Client Portal',
            'priority' => 'Medium',
            'status' => 'Open',
            'message' => $data['message'],
        ]);

        return response()->json([
            'message' => 'Your message has been sent to admin.',
            'ticket' => $this->payload($ticket->load('user')),
        ], 201);
    }

    public function update(Request $request, SupportTicket $supportTicket): JsonResponse
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'status' => ['required', 'string', 'max:100'],
            'reply' => ['nullable', 'string', 'max:5000'],
            'sendEmail' => ['sometimes', 'boolean'],
        ]);

        $changes = [
            'status' => $data['status'],
            'assigned_admin_id' => $request->user()->id,
        ];

        if (! empty($data['reply'])) {
            $changes['admin_reply'] = $data['reply'];
            $changes['replied_at'] = now();
            $changes['status'] = 'Resolved';
        }

        $supportTicket->fill($changes)->save();

        if (! empty($data['reply']) && (bool) ($data['sendEmail'] ?? false)) {
            $this->sendReplyEmail($supportTicket->fresh(), $data['reply']);
        }

        AuditLog::query()->create([
            'actor_user_id' => $request->user()->id,
            'target_user_id' => $supportTicket->user_id,
            'actor' => $request->user()->name,
            'actor_role' => $request->user()->role,
            'target' => $supportTicket->subject,
            'action' => 'Support Ticket Updated',
            'status' => $supportTicket->status,
            'timestamp' => now(),
        ]);

        return response()->json([
            'ticket' => $this->payload($supportTicket->fresh()),
        ]);
    }

    private function payload(SupportTicket $ticket): array
    {
        return [
            'id' => (string) $ticket->id,
            'subject' => $ticket->subject,
            'customer' => $ticket->user?->name ?? $ticket->guest_name ?? 'Guest',
            'email' => $ticket->user?->email ?? $ticket->guest_email,
            'userId' => $ticket->user_id ? (string) $ticket->user_id : null,
            'priority' => $ticket->priority,
            'status' => $ticket->status,
            'channel' => $ticket->channel,
            'message' => $ticket->message,
            'reply' => $ticket->admin_reply,
            'repliedAt' => optional($ticket->replied_at)->toDateTimeString(),
        ];
    }

    private function sendReplyEmail(SupportTicket $ticket, string $reply): void
    {
        $recipient = $ticket->user?->email ?? $ticket->guest_email;
        if (! $recipient) {
            return;
        }

        try {
            Mail::raw(
                "Hello ".($ticket->user?->name ?? $ticket->guest_name ?? 'there').",\n\n"
                ."Thank you for contacting support about: {$ticket->subject}.\n\n"
                ."Admin reply:\n{$reply}\n\n"
                ."Regards,\nIDM e-Services Support",
                fn ($message) => $message
                    ->to($recipient)
                    ->subject('Support reply: '.$ticket->subject)
            );
        } catch (Throwable $error) {
            Log::warning('Support reply email could not be sent.', [
                'ticket_id' => $ticket->id,
                'recipient' => $recipient,
                'error' => $error->getMessage(),
            ]);
        }
    }

    private function ensureAdmin(Request $request): void
    {
        abort_unless(strtoupper((string) $request->user()?->role) === 'ADMIN', 403, 'Forbidden.');
    }
}

