import { createPrismaClient } from '../src/prisma/create-prisma-client';

const prisma = createPrismaClient();

async function main() {
  console.log('Updating payment method defaults...');

  // Set all methods to non-default first
  await prisma.paymentMethodConfig.updateMany({
    where: {},
    data: {
      isDefault: false,
    },
  });
  console.log('✓ All methods set to non-default');

  // Set only NOT_PAID as default
  const notPaid = await prisma.paymentMethodConfig.update({
    where: { value: 'NOT_PAID' },
    data: {
      isDefault: true,
    },
  });
  console.log('✓ NOT_PAID set as default method');

  // Show all payment methods
  const allMethods = await prisma.paymentMethodConfig.findMany({
    orderBy: { order: 'asc' },
  });

  console.log('\nCurrent payment methods:');
  allMethods.forEach((method) => {
    console.log(`  ${method.emoji} ${method.label} (${method.value}) - Default: ${method.isDefault}`);
  });

  console.log('\n✅ Migration completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
