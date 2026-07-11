import { Pool } from "pg";
import fs from "node:fs";

declare global {
  var __pgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL не задан");
  }

  const caCertPath = process.env.YC_DB_CA_CERT_PATH;

  return new Pool({
    connectionString,
    ssl: caCertPath
      ? { ca: fs.readFileSync(caCertPath, "utf-8"), rejectUnauthorized: true }
      : undefined,
  });
}

export function getPool(): Pool {
  if (!global.__pgPool) {
    global.__pgPool = createPool();
  }
  return global.__pgPool;
}
