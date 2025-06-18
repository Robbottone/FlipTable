import { connect } from "http2";

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()

async function main() {

await prisma.menuItemsOnMenus.deleteMany()
await prisma.menuItem.deleteMany()
await prisma.menu.deleteMany()
await prisma.category.deleteMany()
await prisma.table.deleteMany()
await prisma.reservation.deleteMany()
await prisma.orderItem.deleteMany()
await prisma.order.deleteMany()
await prisma.user.deleteMany()
await prisma.tenant.deleteMany()

  const tenant = await prisma.tenant.create({
    data: {
      name: 'Bar Cipo',
      slug: 'bar-cipo',
      timezone: 'Europe/Rome',
      currency: 'EUR',
    },
  })

  const menu = await prisma.menu.create({
    data: {
      name: 'Menù Cena',
      isActive: true,
      tenant: { connect: { id: tenant.id }}
    },
  })

  const category = await prisma.category.create({
    data: {
      tenantId: tenant.id,
      name: 'Antipasti',
      sortOrder: 1,
    },
  })

  const item1 = await prisma.menuItem.create({
    data: {
      name: 'Bruschetta',
      description: 'Pane tostato con pomodorini e basilico',
      price: 5.0,
      available: true,
      visible: true,
      tags: ['veg'],
      category: { connect: { id: category.id } },
    }
  });

  const item2 = await prisma.menuItem.create({
    data: {
      name: 'Caprese',
      description: 'Mozzarella di bufala e pomodoro',
      price: 6.5,
      available: true,
      visible: true,
      tags: ['veg', 'gluten-free'],
      category: { connect: { id: category.id }},
    },
  });

  const item3 = await prisma.menuItem.create({
      data: {
        name: 'Tagliere misto',
        description: 'Salumi e formaggi locali',
        price: 10.0,
        available: true,
        visible: true,
        tags: ['gluten-free'],
        category: { connect: { id: category.id }},
      },
  });

  await prisma.menuItemsOnMenus.createMany({
    data: [
      {
      menuId: menu.id,
      menuItemId: item1.id
      }, 
      {
      menuId: menu.id,
      menuItemId: item2.id
      },
      {
      menuId: menu.id,
      menuItemId: item3.id
      }
    ],
    });

  await prisma.table.create({
    data: {
      tenantId: tenant.id,
      number: 1,
      seats: 4,
    },
  })

  console.log('✅ Seed completato.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())