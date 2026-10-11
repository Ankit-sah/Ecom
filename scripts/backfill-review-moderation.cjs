/* eslint-disable @typescript-eslint/no-require-imports -- Standalone database rollout command. */
const { loadEnvConfig } = require('@next/env');
const { PrismaClient } = require('@prisma/client');

loadEnvConfig(process.cwd());
const prisma = new PrismaClient();
const missingStatus = { status: { $exists: false } };

async function main() {
  const before = await prisma.$runCommandRaw({ count: 'ProductReview', query: missingStatus });
  console.log(`Legacy reviews without a moderation status: ${before.n ?? 0}`);
  if (!process.argv.includes('--apply')) {
    console.log('Dry run only. Pass --apply to move these reviews into the pending moderation queue.');
    return;
  }
  if (!before.n) return;
  const result = await prisma.$runCommandRaw({
    update: 'ProductReview',
    updates: [{ q: missingStatus, u: { $set: { status: 'PENDING' } }, multi: true }],
  });
  if (result.ok !== 1 || result.writeErrors?.length) throw new Error('Review backfill did not complete.');
  const remaining = await prisma.$runCommandRaw({ count: 'ProductReview', query: missingStatus });
  console.log(`Moved ${result.nModified ?? 0} legacy reviews into pending moderation; ${remaining.n ?? 0} remain.`);
  if (remaining.n) throw new Error('Some legacy reviews still need a moderation status.');
}

main()
  .catch(() => { console.error('Review backfill failed. Check database connectivity and permissions.'); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
