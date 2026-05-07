import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// const pool = mysql.createPool(process.env.DATABASE_URL as string);

const adapter = new PrismaMariaDb({
  host: process.env.HOST,
  port: 4000,
  connectionLimit: 30,
  user: process.env.USERNAME,
  password: process.env.PASSWORD,
  database: "anime_db",
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("DB connected via prisma");
  } catch (e) {
    console.error(`DB connection error ${e}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await prisma.$disconnect();
};

export { prisma, connectDB, disconnectDB };
