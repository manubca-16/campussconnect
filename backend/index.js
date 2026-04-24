import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const child = spawn(
  process.execPath,
  ["--import", "tsx/esm", path.join(__dirname, "index.ts")],
  {
    cwd: __dirname,
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: process.env.NODE_ENV || "production" },
  }
);

child.on("exit", (code) => process.exit(code ?? 0));

