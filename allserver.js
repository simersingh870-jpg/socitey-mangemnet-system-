const { spawn } = require("child_process");
const path = require("path");

console.log("🚀 Starting all servers...\n");

const servers = [
  {
    name: "Admin Server",
    dir: path.join(__dirname, "admin"),
    file: "server.js",
    port: 3000,
  },
  {
    name: "Security Guard Server",
    dir: path.join(__dirname, "security-gard"),
    file: "server.js",
    port: 5501,
  },
];

servers.forEach((server) => {
  const child = spawn("node", [server.file], {
    cwd: server.dir,
    stdio: "inherit",
    env: { ...process.env, PORT: server.port },
  });

  console.log(`✅ ${server.name} started on port ${server.port}`);

  child.on("error", (err) => {
    console.error(`❌ Error starting ${server.name}:`, err.message);
  });

  child.on("exit", (code) => {
    if (code !== 0) console.log(`⚠️  ${server.name} exited with code ${code}`);
  });
});

console.log("\n📊 All servers are running!");
console.log("   Admin Server:          http://localhost:3000");
console.log("   Security Guard Server: http://localhost:5501");
console.log("\nPress CTRL+C to stop all servers\n");

process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down all servers...");
  process.exit(0);
});
