/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node diagnostic. */
const { loadEnvConfig } = require('@next/env');
const { createHmac, randomUUID } = require('node:crypto');
loadEnvConfig(process.cwd());
async function main() {
  if (process.env.PAYMENT_ENVIRONMENT !== 'sandbox') throw new Error('This diagnostic only runs in sandbox mode.');
  const origin = new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').origin;
  const rate = Number(process.env.PAYMENT_USD_TO_NPR_RATE);
  if (!Number.isFinite(rate) || rate <= 0) throw new Error('Set a positive PAYMENT_USD_TO_NPR_RATE.');
  const reference = `probe-${randomUUID()}`;
  const code = process.env.ESEWA_PRODUCT_CODE;
  const secret = process.env.ESEWA_SECRET_KEY;
  if (!code || !secret) throw new Error('eSewa merchant configuration is missing.');
  const fields = { amount: '10.00', tax_amount: '0', total_amount: '10.00', transaction_uuid: reference, product_code: code, product_service_charge: '0', product_delivery_charge: '0', success_url: `${origin}/checkout`, failure_url: `${origin}/checkout`, signed_field_names: 'total_amount,transaction_uuid,product_code' };
  fields.signature = createHmac('sha256', secret).update(`total_amount=${fields.total_amount},transaction_uuid=${reference},product_code=${code}`).digest('base64');
  const response = await fetch('https://rc-epay.esewa.com.np/api/epay/main/v2/form', { method: 'POST', body: new URLSearchParams(fields), signal: AbortSignal.timeout(20000) });
  const html = await response.text();
  if (!response.ok || !/password/i.test(html) || /invalid signature|invalid product|invalid parameters/i.test(html)) throw new Error('eSewa did not return the expected payment login page.');
  console.log('PASS: eSewa signed form accepted; payment login page returned.');
  const query = new URLSearchParams({ product_code: code, total_amount: fields.total_amount, transaction_uuid: reference });
  const statusResponse = await fetch(`https://rc.esewa.com.np/api/epay/transaction/status/?${query}`, { signal: AbortSignal.timeout(20000) });
  const status = await statusResponse.json();
  if (!statusResponse.ok || status.status !== 'PENDING' || status.transaction_uuid !== reference) throw new Error('eSewa lookup did not confirm the unpaid test session.');
  console.log('PASS: eSewa lookup confirmed the matching PENDING transaction.');
  if (!process.env.KHALTI_SECRET_KEY) { console.log('BLOCKED: Add KHALTI_SECRET_KEY from your test merchant dashboard to .env.'); process.exitCode = 2; return; }
  const headers = { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`, 'Content-Type': 'application/json' };
  const initiated = await fetch('https://dev.khalti.com/api/v2/epayment/initiate/', { method: 'POST', headers, body: JSON.stringify({ return_url: `${origin}/checkout`, website_url: origin, amount: 1000, purchase_order_id: reference, purchase_order_name: 'Unpaid sandbox connectivity check' }), signal: AbortSignal.timeout(20000) });
  if (!initiated.ok) throw new Error(`Khalti initiation returned HTTP ${initiated.status}; check the sandbox merchant key and origin.`);
  const payment = await initiated.json();
  if (typeof payment.pidx !== 'string' || typeof payment.payment_url !== 'string') throw new Error('Khalti returned an incomplete payment session.');
  console.log('PASS: Khalti merchant key accepted; hosted payment session created.');
  const lookup = await fetch('https://dev.khalti.com/api/v2/epayment/lookup/', { method: 'POST', headers, body: JSON.stringify({ pidx: payment.pidx }), signal: AbortSignal.timeout(20000) });
  const result = await lookup.json();
  if (!lookup.ok || result.pidx !== payment.pidx || result.total_amount !== 1000 || !['Initiated', 'Pending'].includes(result.status)) throw new Error('Khalti lookup did not confirm the unpaid test session.');
  console.log('PASS: Khalti lookup matched the unpaid session and NPR 10 amount.');
}
main().catch(error => { console.error(`FAIL: ${error.message}`); process.exitCode = 1; });
