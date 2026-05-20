const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const frontendDir = path.resolve(__dirname, "..");
const backendDir = path.resolve(frontendDir, "..", "backend");
const projectRoot = path.resolve(frontendDir, "..");
const phpBinary = resolvePhpBinary();

const processes = [];
let shuttingDown = false;

function resolvePhpBinary() {
  const candidates = [
    process.env.PHP_BINARY,
    path.resolve(projectRoot, "..", "..", "php", "php.exe"),
    "C:\\xampp\\php\\php.exe",
    "C:\\laragon\\bin\\php\\php-8.3\\php.exe",
    "C:\\laragon\\bin\\php\\php-8.2\\php.exe",
    "php",
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate === "php" || fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return "php";
}

function startProcess(name, command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    stdio: "inherit",
    shell: false,
    env: process.env,
  });

  processes.push({ name, child });

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;

    const reason = signal ? `signal ${signal}` : `code ${code}`;
    console.log(`\n${name} stopped with ${reason}. Shutting down the dev stack...`);
    shutdown(code || 0);
  });

  child.on("error", (error) => {
    if (shuttingDown) return;

    console.error(`\nUnable to start ${name}: ${error.message}`);
    shutdown(1);
  });
}

function killProcess(child) {
  if (!child.pid || child.killed) return;

  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
      stdio: "ignore",
      shell: true,
    });
    return;
  }

  child.kill("SIGTERM");
}

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const { child } of processes) {
    killProcess(child);
  }

  setTimeout(() => process.exit(exitCode), 250);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

console.log("Starting Laravel API on http://localhost:8000");
startProcess("Laravel API", phpBinary, ["artisan", "serve", "--host=0.0.0.0", "--port=8000"], backendDir);

console.log("Starting Vite frontend");
startProcess("Vite frontend", process.execPath, [path.join(frontendDir, "node_modules", "vite", "bin", "vite.js"), "--host", "0.0.0.0"], frontendDir);
