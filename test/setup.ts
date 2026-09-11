import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.CONTRACT_ID =
  "CTESTCONTRACT00000000000000000000000000000000000000000";
process.env.RPC_URL = "http://localhost:9999";
process.env.DB_PATH = path.resolve(__dirname, "../.tmp/test.db");

fs.mkdirSync(path.dirname(process.env.DB_PATH), { recursive: true });
for (const suffix of ["", "-journal", "-wal", "-shm"]) {
  const file = process.env.DB_PATH + suffix;
  if (fs.existsSync(file)) fs.unlinkSync(file);
}
