const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function test() {
  try {
    await prisma.$connect()
    console.log('✅ Connection successful!')
    
    // Test a simple query
    const levelCount = await prisma.level.count()
    console.log(`Found ${levelCount} levels in the database`)
    
  } catch (error) {
    console.error('❌ Connection failed:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
  } finally {
    await prisma.$disconnect()
  }
}

test() 