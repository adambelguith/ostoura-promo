import { PrismaClient as MysqlPrismaClient } from '../prisma/mysql/generated/mysql';
import { PrismaClient as UserPrismaClient } from '../prisma/sqlite/generated/user';
import { PrismaClient as OrderPrismaClient } from '../prisma/sqlite/generated/order';

const globalForPrisma = global;

const mysqlPrisma = globalForPrisma.mysqlPrisma ?? new MysqlPrismaClient();
const userPrisma = globalForPrisma.userPrisma ?? new UserPrismaClient();
const orderPrisma = globalForPrisma.orderPrisma ?? new OrderPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.mysqlPrisma = mysqlPrisma;
  globalForPrisma.userPrisma = userPrisma;
  globalForPrisma.orderPrisma = orderPrisma;
}

export { mysqlPrisma, userPrisma, orderPrisma }; 