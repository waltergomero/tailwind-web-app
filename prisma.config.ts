import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load environment variables from .env
config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DIRECT_DATABASE_URL || "",
  },
});
