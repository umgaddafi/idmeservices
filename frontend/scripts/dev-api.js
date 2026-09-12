import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDir = path.resolve(__dirname, "..");
const projectRoot = path.resolve(frontendDir, "..");
const backendDir = path.resolve(projectRoot, "backend");

function resolvePhpBinary() {
  const candidates = [
    process.env.PHP_BINARY,
    path.resolve(projectRoot, "..", "..", "php", "php.exe"),
    "C:\\xampp\\php\\php.exe",
    "php",
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate === "php" || fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return "php";
}

const child = spawn(resolvePhpBinary(), ["artisan", "serve", "--host=0.0.0.0", "--port=8000"], {
  cwd: backendDir,
  stdio: "inherit",
  shell: false,
  env: process.env,
});

child.on("exit", (code) => process.exit(code || 0));
