<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Loan;
use App\Models\LoanGuarantor;
use App\Models\LoanType;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class LoanController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $scope = $request->query('scope', 'all');
        $user = $request->user();

        $query = Loan::query()->with(['guarantors', 'user'])->orderByDesc('created_at');

        if ($scope === 'mine' || $user->role === 'MEMBER') {
            $query->where('user_id', $user->id);
        }

        if ($scope === 'pending_notifications') {
            $query->where('status', 'AWAITING_NOTIFICATION_APPROVAL');
        }

        return response()->json([
            'loans' => $query->get()->map(fn (Loan $loan) => $this->transformLoan($loan))->values(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'loanTypeId' => ['required', 'exists:loan_types,id'],
            'amount' => ['required', 'numeric', 'min:1'],
            'guarantorIds' => ['nullable', 'array'],
            'guarantorIds.*' => ['nullable', 'string'],
        ]);

        $user = $request->user();
        $loanType = LoanType::query()->findOrFail($data['loanTypeId']);

        $loan = Loan::query()->create([
            'user_id' => $user->id,
            'member_name' => $user->name,
            'amount' => $data['amount'],
            'loan_type_id' => $loanType->id,
            'status' => 'AWAITING_NOTIFICATION_APPROVAL',
            'repayment_schedule' => [],
        ]);

        foreach (array_filter($data['guarantorIds'] ?? []) as $identifier) {
            $guarantorUser = User::query()
                ->where('member_id', $identifier)
                ->orWhere('email', $identifier)
                ->first();

            LoanGuarantor::query()->create([
                'loan_id' => $loan->id,
                'user_id' => $guarantorUser?->id,
                'name' => $guarantorUser?->name ?? ('Guarantor '.$identifier),
                'email' => $guarantorUser?->email,
                'status' => 'PENDING',
            ]);
        }

        AuditLog::query()->create([
            'action' => 'Loan Request Submitted',
            'actor' => $user->name,
            'actor_role' => $user->role,
            'target' => $loan->member_name,
            'timestamp' => now(),
            'status' => 'VERIFIED',
        ]);

        return response()->json(['loan' => $this->transformLoan($loan->load('guarantors'))], 201);
    }

    public function notifyGuarantors(Request $request, Loan $loan): JsonResponse
    {
        abort_unless($request->user()?->role === 'PRESIDENT', 403, 'Forbidden.');

        $loan->load('guarantors');

        foreach ($loan->guarantors as $guarantor) {
            if ($guarantor->email) {
                Mail::raw(
                    sprintf('%s has requested a cooperative loan of NGN %s and listed you as a guarantor.', $loan->member_name, number_format($loan->amount, 2)),
                    function ($message) use ($guarantor): void {
                        $message->to($guarantor->email)->subject('CoopNest guarantor request');
                    }
                );
            }

            $guarantor->update([
                'notified_at' => now(),
            ]);
        }

        $loan->update([
            'status' => 'AWAITING_GUARANTORS',
            'notifications_sent_at' => now(),
        ]);

        AuditLog::query()->create([
            'action' => 'Guarantor Notifications Sent',
            'actor' => $request->user()->name,
            'actor_role' => $request->user()->role,
            'target' => $loan->member_name,
            'timestamp' => now(),
            'status' => 'VERIFIED',
        ]);

        return response()->json(['loan' => $this->transformLoan($loan->fresh()->load('guarantors'))]);
    }

    private function transformLoan(Loan $loan): array
    {
        return [
            'id' => (string) $loan->id,
            'userId' => (string) $loan->user_id,
            'memberName' => $loan->member_name,
            'amount' => (float) $loan->amount,
            'loanTypeId' => $loan->loan_type_id,
            'status' => $loan->status,
            'createdAt' => optional($loan->created_at)->toIso8601String(),
            'guarantors' => $loan->guarantors->map(fn (LoanGuarantor $guarantor) => [
                'userId' => $guarantor->user_id ? (string) $guarantor->user_id : '',
                'name' => $guarantor->name,
                'status' => $guarantor->status,
                'notifiedAt' => optional($guarantor->notified_at)->toIso8601String(),
                'confirmedAt' => optional($guarantor->confirmed_at)->toIso8601String(),
            ])->values()->all(),
            'repaymentSchedule' => $loan->repayment_schedule ?? [],
        ];
    }
}
