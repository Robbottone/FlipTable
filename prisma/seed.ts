const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()

async function main() {
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
      tenantId: tenant.id,
      name: 'Menù Cena',
      isActive: true,
    },
  })

  const category = await prisma.category.create({
    data: {
      tenantId: tenant.id,
      name: 'Antipasti',
      sortOrder: 1,
    },
  })

  await prisma.menuItem.createMany({
    data: [
      {
        menuId: menu.id,
        categoryId: category.id,
        name: 'Bruschetta',
        description: 'Pane tostato con pomodorini e basilico',
        price: 5.0,
        available: true,
        visible: true,
        tags: ['veg'],
      },
      {
        menuId: menu.id,
        categoryId: category.id,
        name: 'Caprese',
        description: 'Mozzarella di bufala e pomodoro',
        price: 6.5,
        available: true,
        visible: true,
        tags: ['veg', 'gluten-free'],
      },
      {
        menuId: menu.id,
        categoryId: category.id,
        name: 'Tagliere misto',
        description: 'Salumi e formaggi locali',
        price: 10.0,
        available: true,
        visible: true,
        tags: ['gluten-free'],
      },
    ],
  })

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