/* eslint-disable @typescript-eslint/no-require-imports -- Node test harness compiles TypeScript without extra dependencies. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
function load(file, mocks = {}) {
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(source, { exports, require: name => mocks[name] || require(name), process, Buffer, URL, URLSearchParams, AbortSignal, fetch, console, setTimeout });
  return exports;
}
const validation = load('src/lib/checkout-validation.ts');
const wallet = load('src/lib/wallet-payments.ts');
const valid = () => ({ items: [{ productId: 'a'.repeat(24), quantity: 2 }], shippingAddress: { fullName: 'Buyer', addressLine1: 'Main Road', city: 'Janakpur', postalCode: '45600', country: 'NP' }, shippingCents: 0 });
test('checkout rejects negative, fractional, string, zero, duplicate and malformed items', () => {
  for (const quantity of [-1, 0, 1.5, '2', 1000, NaN]) assert.throws(() => validation.validateCheckout({ ...valid(), items: [{ productId: 'a'.repeat(24), quantity }] }));
  const body = valid(); body.items.push(body.items[0]); assert.throws(() => validation.validateCheckout(body));
  for (const body of [null, {}, { ...valid(), items: [] }, { ...valid(), shippingAddress: { ...valid().shippingAddress, fullName: ' ' } }]) assert.throws(() => validation.validateCheckout(body));
});
test('destination determines shipping and ignores client price overrides', () => {
  const body = valid(); body.shippingMethod = 'domestic'; body.shippingAddress.country = 'us';
  const parsed = validation.validateCheckout(body);
  assert.equal(parsed.shippingMethod, 'international');
  const totals = validation.checkoutTotals(10000, parsed.shippingMethod);
  assert.equal(totals.shippingCents, 2500); assert.equal(totals.taxCents, 800); assert.equal(totals.totalCents, 13300);
});
test('paisa conversion rounds once and rejects invalid or unsupported totals', () => {
  assert.equal(wallet.toPaisa(1234, 135.25), 166899);
  for (const args of [[1, 1], [100, NaN], [100, -1], [1e12, 135]]) assert.throws(() => wallet.toPaisa(...args));
});
test('eSewa signature matches independently verified HMAC vector and rejects forged callbacks', () => {
  const secret = '8gBm/:&EnhH.1/q';
  assert.equal(wallet.esewaSignature('total_amount=100,transaction_uuid=11-201-13,product_code=EPAYTEST', secret), '5DZywcrTKD0gia/rsSMcrRHmJl+4Tbol6S+lWgdJ94E=');
  const previous = process.env.ESEWA_SECRET_KEY;
  process.env.ESEWA_SECRET_KEY = secret;
  try {
    const data = { transaction_code: 'txn', status: 'COMPLETE', total_amount: '100', transaction_uuid: 'test', product_code: 'EPAYTEST', signed_field_names: 'transaction_code,status,total_amount,transaction_uuid,product_code,signed_field_names' };
    data.signature = wallet.esewaSignature(data.signed_field_names.split(',').map(field => `${field}=${data[field]}`).join(','));
    assert.equal(wallet.verifyEsewaResponse(data), true);
    assert.equal(wallet.verifyEsewaResponse({ ...data, total_amount: '1' }), false);
    assert.equal(wallet.verifyEsewaResponse({ ...data, signed_field_names: 'status' }), false);
    assert.equal(wallet.verifyEsewaResponse({ ...data, signature: 'bad' }), false);
  } finally { if (previous === undefined) delete process.env.ESEWA_SECRET_KEY; else process.env.ESEWA_SECRET_KEY = previous; }
});
test('wallet verification rejects mismatch and handles repeat callbacks exactly once', async () => {
  const order = { id: 'order', status: 'PENDING', paymentProvider: 'khalti', paymentReference: 'pidx', paymentAmountPaisa: 1000 };
  let amount = 999, deductions = 0, histories = 0;
  const prisma = { order: { findUnique: async () => ({ ...order }) }, $transaction: async callback => callback({
    order: { updateMany: async () => { if (order.status !== 'PENDING') return { count: 0 }; order.status = 'PAID'; return { count: 1 }; }, update: async () => { histories++; } },
    orderItem: { findMany: async () => [{ productId: 'product', quantity: 2 }] },
    product: { updateMany: async () => { deductions++; return { count: 1 }; } }, productInventoryEvent: { create: async () => {} },
  }) };
  const service = load('src/lib/verify-wallet-order.ts', { '@/lib/prisma': { prisma }, '@/lib/wallet-payments': { khaltiRequest: async () => ({ pidx: 'pidx', total_amount: amount, status: 'Completed', transaction_id: 'txn', refunded: false }) } });
  assert.equal(await service.verifyWalletOrder('order'), false); assert.equal(deductions, 0);
  amount = 1000;
  assert.equal(await service.verifyWalletOrder('order'), true);
  assert.equal(await service.verifyWalletOrder('order'), true);
  assert.equal(deductions, 1); assert.equal(histories, 1);
});
test('wallets fail closed without an explicit environment and positive rate', () => {
  const keys = ['PAYMENT_ENVIRONMENT', 'PAYMENT_USD_TO_NPR_RATE', 'ESEWA_SECRET_KEY', 'ESEWA_PRODUCT_CODE', 'KHALTI_SECRET_KEY'];
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  try {
    process.env.ESEWA_SECRET_KEY = 'test'; process.env.ESEWA_PRODUCT_CODE = 'test'; process.env.KHALTI_SECRET_KEY = 'test';
    for (const [environment, rate] of [['', '135'], ['production', ''], ['sandbox', '-1'], ['typo', '135']]) {
      process.env.PAYMENT_ENVIRONMENT = environment; process.env.PAYMENT_USD_TO_NPR_RATE = rate;
      assert.equal(wallet.walletConfig().esewa, false); assert.equal(wallet.walletConfig().khalti, false);
    }
    process.env.PAYMENT_ENVIRONMENT = 'sandbox'; process.env.PAYMENT_USD_TO_NPR_RATE = '135';
    assert.equal(wallet.walletConfig().esewa, true); assert.equal(wallet.walletConfig().khalti, true);
  } finally { for (const key of keys) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; } }
});
test('pending, refunded, wrong reference and provider errors never settle an order', async () => {
  let result = {}, shouldThrow = false;
  const service = load('src/lib/verify-wallet-order.ts', {
    '@/lib/prisma': { prisma: { order: { findUnique: async () => ({ id: 'order', status: 'PENDING', paymentProvider: 'khalti', paymentReference: 'pidx', paymentAmountPaisa: 1000 }) }, $transaction: async () => assert.fail('Invalid payment settled') } },
    '@/lib/wallet-payments': { khaltiRequest: async () => { if (shouldThrow) throw new Error('Timeout'); return result; } },
  });
  for (const changes of [{ status: 'Pending' }, { refunded: true }, { pidx: 'another-order' }, { transaction_id: null }]) {
    result = { status: 'Completed', refunded: false, pidx: 'pidx', total_amount: 1000, transaction_id: 'txn', ...changes };
    assert.equal(await service.verifyWalletOrder('order'), false);
  }
  shouldThrow = true; await assert.rejects(service.verifyWalletOrder('order'), /Timeout/);
});
test('gateway returns retain order identity with appended query data', () => {
  const { paymentCallbackParams } = load('src/lib/payment-callback.ts');
  const id = 'a'.repeat(24);
  const modern = paymentCallbackParams(`https://shop.example/api/payments/verify/${id}?data=YWJj`, id);
  assert.equal(modern.get('order_id'), id); assert.equal(modern.get('data'), 'YWJj');
  const legacy = paymentCallbackParams(`https://shop.example/api/payments/verify?order_id=${id}?data=YWJj`);
  assert.equal(legacy.get('order_id'), id); assert.equal(legacy.get('data'), 'YWJj');
  const khalti = paymentCallbackParams(`https://shop.example/api/payments/verify/${id}?pidx=payment&status=Completed`, id);
  assert.equal(khalti.get('order_id'), id); assert.equal(khalti.get('pidx'), 'payment');
});
