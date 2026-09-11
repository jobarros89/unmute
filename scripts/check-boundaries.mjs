import { readdir, readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

async function scan(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await scan(file);
    else if (/\.[jt]sx?$/.test(file)) {
      const text = await readFile(file, "utf8");
      if (
        /CLOUDFLARE_AI_API_TOKEN|OPENAI_API_KEY|SUPABASE_SERVICE_ROLE_KEY|sb_secret_|sk-proj-/.test(
          text,
        )
      )
        throw new Error(
          `Private credential reference in mobile source: ${file}`,
        );
    }
  }
}
await scan("app");
await scan("src");
const tracked = execFileSync("git", ["ls-files", "-z"], {
  encoding: "utf8",
}).split("\0");
for (const file of tracked) {
  if (/(^|\/)\.env($|\.)/.test(file) && !file.endsWith(".env.example"))
    throw new Error(`Environment file must not be tracked: ${file}`);
}
console.log("Mobile boundary and tracked environment checks passed.");
