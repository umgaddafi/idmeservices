const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const frontendDir = path.resolve(__dirname, "..");
const projectRoot = path.resolve(frontendDir, "..");
const backendDir = path.resolve(projectRoot, "backend");
const laravelPort = process.env.LARAVEL_DEV_PORT || "8000";

function resolvePhpBinary() {
  const candidates = [
    process.env.PHP_BINARY,
    "/opt/lampp/bin/php",
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

console.log(`Starting Laravel API on http://localhost:${laravelPort}`);

const child = spawn(resolvePhpBinary(), ["artisan", "serve", "--host=0.0.0.0", `--port=${laravelPort}`], {
  cwd: backendDir,
  stdio: "inherit",
  shell: false,
  env: process.env,
});

child.on("exit", (code) => process.exit(code || 0));
