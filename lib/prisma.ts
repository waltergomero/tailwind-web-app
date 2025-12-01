import { PrismaClient } from '../app/generated/prisma/client'

const globalForPrisma = global as unknown as { 
    prisma: PrismaClient
}

// Check if using Prisma Accelerate URL
const databaseUrl = process.env.DATABASE_URL || ''
const isAccelerateUrl = databaseUrl.startsWith('prisma://') || databaseUrl.startsWith('prisma+postgres://')

// Create Prisma client without Accelerate extension for regular database URLs
const createPrismaClient = () => {
  if (isAccelerateUrl) {
    // Use Accelerate for prisma:// URLs
    const { withAccelerate } = require('@prisma/extension-accelerate')
    return new PrismaClient().$extends(withAccelerate())
  }
  // Use regular Prisma Client for postgresql:// URLs
  return new PrismaClient()
}

const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma