// Import Prisma clients for each schema
import { PrismaClient as MysqlPrismaClient } from '../prisma/mysql/generated/mysql';
import { PrismaClient as UserPrismaClient } from '../prisma/sqlite/generated/user';
import { PrismaClient as OrderPrismaClient } from '../prisma/sqlite/generated/order';

// Initialize Prisma clients for each database
const mysqlPrisma = new MysqlPrismaClient();
const userPrisma = new UserPrismaClient();
const orderPrisma = new OrderPrismaClient();

// Function to connect to all databases
async function connect() {
  try {
    await mysqlPrisma.$connect();
    await userPrisma.$connect();
    await orderPrisma.$connect();
    console.log("Connected to all databases via Prisma");
  } catch (error) {
    console.error('Error connecting to the databases:', error);
  }
}

// Function to disconnect from all databases
async function disconnect() {
  try {
    await mysqlPrisma.$disconnect();
    await userPrisma.$disconnect();
    await orderPrisma.$disconnect();
    console.log("Disconnected from all databases");
  } catch (error) {
    console.error('Error disconnecting from the databases:', error);
  }
}

// Function to convert document to object (if needed)
function convertDocToObj(doc) {
  if (doc && doc._id) {
    doc._id = doc._id.toString();
  }
  if (doc && doc.createdAt) {
    doc.createdAt = doc.createdAt.toString();
  }
  if (doc && doc.updatedAt) {
    doc.updatedAt = doc.updatedAt.toString();
  }
  return doc;
}

// Export the Prisma clients and utility functions
const db = {
  mysql: mysqlPrisma,
  user: userPrisma,
  order: orderPrisma,
  connect,
  disconnect,
  convertDocToObj,
};

export default db;