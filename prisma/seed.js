const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.product.createMany({
    data: [
      { name: 'Tahu Crispy', price: 500 },
      { name: 'Otak-Otak Crispy', price: 1000 },
    ],
  });
}

main()
  .then(() => {
    console.log('Seed data berhasil');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
