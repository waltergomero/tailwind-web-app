import { PrismaClient } from '../app/generated/prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import sampleData from './sample-data';

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  const prisma = new PrismaClient({
    accelerateUrl: databaseUrl,
  }).$extends(withAccelerate());
  
  await prisma.user.deleteMany();
  await prisma.user.createMany({ data: sampleData.users });

  console.log('Database seeded successfully!');
}

main();
