import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: 'npx tsx ./prisma/seed.ts',
  },
  datasource: {
    // This is used for migrations and db push (direct connection)
    url: process.env.DIRECT_URL, 
  },
});