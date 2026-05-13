import fs from "node:fs";

const requiredFiles = [
  ".env.example",
  "supabase/migrations/202605130001_initial_crm_schema.sql",
  "src/lib/supabase/client.js",
  "src/lib/supabase/server.js",
  "src/lib/realtime/useCrmRealtime.js",
  "src/middleware.js"
];

const missing = requiredFiles.filter((file) => !fs.existsSync(file));

if (missing.length) {
  console.error(`Missing required files:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Smoke test passed.");
