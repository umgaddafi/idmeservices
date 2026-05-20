<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment confirmed</title>
</head>
<body style="margin:0; padding:0; background:#111111; color:#f5f5f5; font-family:Arial, Helvetica, sans-serif;">
    <div style="max-width:720px; margin:0 auto; padding:32px 20px;">
        <div style="background:#171717; border:1px solid #2e2e2e; border-radius:24px; padding:32px 28px;">
            <h1 style="margin:0 0 24px; font-size:28px; line-height:1.2; color:#efc5aa;">Payment confirmed</h1>

            <p style="margin:0 0 18px; font-size:16px; line-height:1.7;">Hello {{ $user->name }},</p>

            <p style="margin:0 0 28px; font-size:16px; line-height:1.8;">
                Your payment was successful and your order is now being prepared.
            </p>

            <div style="background:#1f1f1c; border:1px solid #3c3c37; border-radius:22px; padding:22px 24px; margin-bottom:28px;">
                <p style="margin:0 0 14px; font-size:15px; line-height:1.7;"><strong>Order Number:</strong> {{ $details['Order Number'] ?? $reference }}</p>
                <p style="margin:0 0 14px; font-size:15px; line-height:1.7;"><strong>Payment Reference:</strong> {{ $reference }}</p>
                <p style="margin:0; font-size:15px; line-height:1.7;"><strong>Order Status:</strong> Paid</p>
            </div>

            @if(!empty($items))
                <h2 style="margin:0 0 18px; font-size:20px; color:#efc5aa;">Order details</h2>
                <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse; margin-bottom:28px;">
                    <thead>
                        <tr>
                            <th align="left" style="padding:0 0 14px; color:#a3a8a1; font-size:14px; border-bottom:1px solid #343434;">Item</th>
                            <th align="center" style="padding:0 0 14px; color:#a3a8a1; font-size:14px; border-bottom:1px solid #343434;">Qty</th>
                            <th align="right" style="padding:0 0 14px; color:#a3a8a1; font-size:14px; border-bottom:1px solid #343434;">Unit Price</th>
                            <th align="right" style="padding:0 0 14px; color:#a3a8a1; font-size:14px; border-bottom:1px solid #343434;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                    @foreach($items as $item)
                        <tr>
                            <td style="padding:18px 0; font-size:15px; border-bottom:1px solid #2d2d2d;">{{ $item['name'] }}</td>
                            <td align="center" style="padding:18px 0; font-size:15px; border-bottom:1px solid #2d2d2d;">{{ rtrim(rtrim(number_format((float) $item['quantity'], 2), '0'), '.') }}</td>
                            <td align="right" style="padding:18px 0; font-size:15px; border-bottom:1px solid #2d2d2d;">NGN {{ number_format((float) $item['unitPrice'], 2) }}</td>
                            <td align="right" style="padding:18px 0; font-size:15px; border-bottom:1px solid #2d2d2d;">NGN {{ number_format((float) $item['subtotal'], 2) }}</td>
                        </tr>
                    @endforeach
                    </tbody>
                </table>
            @endif

            @if(!empty($totals))
                <div style="margin-bottom:28px; padding-top:10px; border-top:1px solid #343434;">
                    <p style="margin:0 0 14px; font-size:16px;"><strong>Items Total:</strong> NGN {{ number_format((float) ($totals['itemsTotal'] ?? 0), 2) }}</p>
                    <p style="margin:0 0 14px; font-size:16px;"><strong>Shipping Fee:</strong> NGN {{ number_format((float) ($totals['shippingFee'] ?? 0), 2) }}</p>
                    <p style="margin:0; font-size:16px;"><strong>Total Paid:</strong> NGN {{ number_format((float) ($totals['totalPaid'] ?? $amount), 2) }}</p>
                </div>
            @endif

            @if(!empty($delivery))
                <div style="background:#1b251c; border:1px solid #38503b; border-radius:18px; padding:20px 20px; margin-bottom:28px;">
                    <h3 style="margin:0 0 14px; font-size:18px; color:#71c55d;">Delivery address</h3>
                    @if(!empty($delivery['name']))
                        <p style="margin:0 0 10px; font-size:16px; font-weight:700;">{{ $delivery['name'] }}</p>
                    @endif
                    @if(!empty($delivery['address']))
                        <p style="margin:0 0 10px; font-size:16px; line-height:1.8;">{{ $delivery['address'] }}</p>
                    @endif
                    @if(!empty($delivery['phone']))
                        <p style="margin:0; font-size:16px;">{{ $delivery['phone'] }}</p>
                    @endif
                </div>
            @endif

            @if($ctaUrl)
                <div style="margin-bottom:28px;">
                    <a href="{{ $ctaUrl }}" style="display:inline-block; background:#ff8a00; color:#ffffff; text-decoration:none; font-weight:700; padding:16px 28px; border-radius:14px;">View your order</a>
                </div>
            @endif

            <div style="background:#151515; border:1px solid #2a2a2a; border-radius:18px; padding:18px 20px;">
                <p style="margin:0 0 10px; font-size:15px;"><strong>Amount Paid:</strong> NGN {{ number_format($amount, 2) }}</p>
                @foreach($details as $label => $value)
                    @if(!in_array($label, ['Order Number', 'Payment Reference', 'Order Status']) && $value !== null && $value !== '')
                        <p style="margin:0 0 10px; font-size:14px; color:#d0d0d0;"><strong>{{ $label }}:</strong> {{ $value }}</p>
                    @endif
                @endforeach
                <p style="margin:0; font-size:14px; color:#d0d0d0;"><strong>Wallet Balance:</strong> NGN {{ number_format($walletBalance, 2) }}</p>
            </div>

            <p style="margin:28px 0 0; font-size:16px; line-height:1.8;">Thank you for shopping with AFRO VILLAGE MARKET.</p>
        </div>
    </div>
</body>
</html>
