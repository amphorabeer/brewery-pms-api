import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const orgId = '30f6ff47-61ce-4d86-9a51-e195ebdf0e00';

  // Generate real UUID v4
  const locationId = randomUUID();
  const recipeId = randomUUID();

  // Create Location
  const location = await prisma.location.upsert({
    where: { id: locationId },
    update: {},
    create: {
      id: locationId,
      orgId: orgId,
      name: 'Main Brewery',
      type: 'BREWERY',
      address: 'Tbilisi, Georgia',
      city: 'Tbilisi',
      country: 'Georgia',
      isActive: true,
    },
  });

  console.log('✅ Location created:', location.name);

  // Create Recipe
  const recipe = await prisma.recipe.upsert({
    where: { id: recipeId },
    update: {},
    create: {
      id: recipeId,
      orgId: orgId,
      name: 'Test Batch Recipe',
      style: 'American Pale Ale',
      batchSize: 100,
      abv: 5.5,
      ibu: 42,
      og: 1.055,
      fg: 1.012,
      mashTemp: 67,
      mashTime: 60,
      boilTime: 60,
      fermentTemp: 18,
      fermentDays: 14,
      notes: 'Recipe for testing batches',
    },
  });

  console.log('✅ Recipe created:', recipe.name);
  console.log('\n📋 Use these IDs for batch creation:');
  console.log('recipeId:', recipe.id);
  console.log('locationId:', location.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });