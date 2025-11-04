import { defineConfig, env } from "prisma/config";
import * as dotenv from "dotenv";

dotenv.config({ path: "./.env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts"
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
