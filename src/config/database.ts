import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaMariaDb({
  host: "srv1040.hstgr.io",
  port: 3306,
  user: "u475313638_u1234567_admin",
  password: "Organic01@gmail.com",
  database: "u475313638_u123456789_lms",
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

export default prisma;
