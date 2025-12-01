import { PrismaClient } from '../app/generated/prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = global as unknown as { 
    prisma: ReturnType<typeof createPrismaClient>
}

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL || ''

// Create Prisma client with proper Prisma 7 configuration
const createPrismaClient = () => {
  // Since you're using Prisma Accelerate, pass the URL as accelerateUrl
  return new PrismaClient({
    accelerateUrl: databaseUrl,
  }).$extends(withAccelerate())
}

const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma