const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

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

const child = spawn(resolvePhpBinary(), ["artisan", "serve", "--host=0.0.0.0", "--port=80"], {
  cwd: backendDir,
  stdio: "inherit",
  shell: false,
  env: process.env,
});

child.on("exit", (code) => process.exit(code || 0));
