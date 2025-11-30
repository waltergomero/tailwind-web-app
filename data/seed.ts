import { PrismaClient } from '../app/generated/prisma';
import sampleData from './sample-data';
//import { hash } from '@/lib/encrypt';

async function main() {
  const prisma = new PrismaClient();
  await prisma.user.deleteMany();

  await prisma.user.createMany({ data: sampleData.users });

  console.log('Database seeded successfully!');
}

main();
