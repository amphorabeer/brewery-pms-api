import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedQcTestTypes() {
  const org = await prisma.organization.findFirst();
  
  if (!org) {
    console.error('No organization found. Please create one first.');
    return;
  }

  console.log(`Seeding QC test types for org: ${org.name} (${org.id})`);

  const testTypes = [
    {
      name: 'Visual Clarity',
      description: 'Check beer clarity and transparency',
      category: 'appearance',
      unit: 'score',
      minValue: 1,
      maxValue: 10,
    },
    {
      name: 'Color Assessment',
      description: 'Evaluate beer color against target',
      category: 'appearance',
      unit: 'SRM',
      minValue: 0,
      maxValue: 50,
    },
    {
      name: 'Foam Quality',
      description: 'Head retention and foam texture',
      category: 'appearance',
      unit: 'score',
      minValue: 1,
      maxValue: 10,
    },
    {
      name: 'Aroma Profile',
      description: 'Overall aroma quality and complexity',
      category: 'aroma',
      unit: 'score',
      minValue: 1,
      maxValue: 10,
    },
    {
      name: 'Off-Flavor Detection',
      description: 'Check for diacetyl, DMS, acetaldehyde',
      category: 'aroma',
      unit: 'boolean',
      minValue: 0,
      maxValue: 1,
    },
    {
      name: 'Taste Profile',
      description: 'Overall flavor quality and balance',
      category: 'taste',
      unit: 'score',
      minValue: 1,
      maxValue: 10,
    },
    {
      name: 'Bitterness Level',
      description: 'IBU perception and balance',
      category: 'taste',
      unit: 'IBU',
      minValue: 0,
      maxValue: 120,
    },
    {
      name: 'Sweetness Level',
      description: 'Residual sweetness perception',
      category: 'taste',
      unit: 'score',
      minValue: 1,
      maxValue: 10,
    },
    {
      name: 'Carbonation Level',
      description: 'CO2 volumes measurement',
      category: 'carbonation',
      unit: 'volumes',
      minValue: 1.5,
      maxValue: 4.5,
    },
    {
      name: 'Mouthfeel',
      description: 'Body and carbonation feel',
      category: 'carbonation',
      unit: 'score',
      minValue: 1,
      maxValue: 10,
    },
    {
      name: 'pH Level',
      description: 'Beer pH measurement',
      category: 'technical',
      unit: 'pH',
      minValue: 3.8,
      maxValue: 4.8,
    },
    {
      name: 'Alcohol Content',
      description: 'ABV verification',
      category: 'technical',
      unit: 'ABV%',
      minValue: 0,
      maxValue: 15,
    },
    {
      name: 'Final Gravity',
      description: 'FG measurement',
      category: 'technical',
      unit: 'SG',
      minValue: 1.000,
      maxValue: 1.030,
    },
  ];

  for (const testType of testTypes) {
    const existing = await prisma.qcTestType.findFirst({
      where: {
        orgId: org.id,
        name: testType.name,
      },
    });

    if (!existing) {
      await prisma.qcTestType.create({
        data: {
          ...testType,
          orgId: org.id,
        },
      });
      console.log(`✅ Created: ${testType.name}`);
    } else {
      console.log(`⏭️  Skipped: ${testType.name} (already exists)`);
    }
  }

  console.log('\n🎉 QC Test Types seeding complete!');
}

seedQcTestTypes()
  .catch((e) => {
    console.error('Error seeding QC test types:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
