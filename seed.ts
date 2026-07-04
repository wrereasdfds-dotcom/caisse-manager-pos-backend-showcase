import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-restaurant-rabat' },
    update: {},
    create: { name: 'Demo Restaurant Rabat', slug: 'demo-restaurant-rabat' }
  });

  const store = await prisma.store.upsert({
    where: { id: 'demo-store-rabat-hay-riad' },
    update: {},
    create: {
      id: 'demo-store-rabat-hay-riad',
      tenantId: tenant.id,
      name: 'Hay Riad Store',
      city: 'Rabat'
    }
  });

  const passwordHash = await bcrypt.hash('Demo12345!', 10);
  await prisma.user.upsert({
    where: { email: 'owner@demo.ma' },
    update: {},
    create: {
      tenantId: tenant.id,
      storeId: store.id,
      fullName: 'Demo Owner',
      email: 'owner@demo.ma',
      passwordHash,
      role: Role.OWNER
    }
  });

  const products = [
    { sku: 'BURGER-001', name: 'Classic Burger', category: 'Food', price: '55.00', taxRate: '10.00' },
    { sku: 'COFFEE-001', name: 'Espresso', category: 'Drinks', price: '18.00', taxRate: '10.00' },
    { sku: 'DESSERT-001', name: 'Cheesecake', category: 'Dessert', price: '35.00', taxRate: '10.00' }
  ];

  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { tenantId_sku: { tenantId: tenant.id, sku: product.sku } },
      update: {},
      create: { tenantId: tenant.id, ...product }
    });
    await prisma.stockItem.upsert({
      where: { storeId_productId: { storeId: store.id, productId: created.id } },
      update: {},
      create: { tenantId: tenant.id, storeId: store.id, productId: created.id, quantity: 50, threshold: 8 }
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
