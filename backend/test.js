// test.js — minimal Node test to check process stability

console.log("🟢 test.js started");

setInterval(() => {
  console.log("⏱️ Node is still running at", new Date().toISOString());
}, 3000);

process.on("exit", (code) => {
  console.log("🔴 Process EXITED with code:", code);
});

process.on("uncaughtException", (err) => {
  console.log("💥 Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.log("💥 Unhandled Promise Rejection:", reason);
});
