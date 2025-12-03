import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPaymentMethods() {
  const defaultMethods = [
    { value: 'CASH', label: 'Cash', emoji: '💵', enabled: true, isDefault: true, order: 1 },
    { value: 'CREDIT_CARD', label: 'Credit Card', emoji: '💳', enabled: true, isDefault: true, order: 2 },
    { value: 'DEBIT_CARD', label: 'Debit Card', emoji: '🏦', enabled: true, isDefault: true, order: 3 },
    { value: 'BIT', label: 'Bit', emoji: '📱', enabled: true, isDefault: true, order: 4 },
    { value: 'PAYBOX', label: 'PayBox', emoji: '📦', enabled: true, isDefault: true, order: 5 },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer', emoji: '🏛️', enabled: true, isDefault: true, order: 6 },
    { value: 'OTHER', label: 'Other', emoji: '❓', enabled: true, isDefault: true, order: 7 },
    { value: 'NOT_PAID', label: 'Not Paid', emoji: '💸', enabled: true, isDefault: true, order: 8 },
  ];

  for (const method of defaultMethods) {
    await prisma.paymentMethodConfig.upsert({
      where: { value: method.value },
      update: {},
      create: method,
    });
  }

  console.log('✅ Payment methods seeded successfully');
}

seedPaymentMethods()
  .catch((e) => {
    console.error('❌ Error seeding payment methods:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
