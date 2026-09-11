import { existsSync, readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}
const required = [
  "EXPO_PUBLIC_SUPABASE_URL",
  "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
];
if (required.some((name) => !process.env[name])) {
  console.error(
    "Publicação interrompida: configure URL e chave pública do Supabase.",
  );
  process.exit(1);
}
const result = spawnSync(
  process.execPath,
  ["node_modules/expo/bin/cli", "export", "--platform", "web", "--clear"],
  {
    stdio: "inherit",
    env: { ...process.env, EXPO_OFFLINE: "1", EXPO_NO_TELEMETRY: "1" },
  },
);
if (result.status !== 0) process.exit(result.status ?? 1);
const directory = "dist/_expo/static/js/web";
const source = readdirSync(directory)
  .filter((name) => name.endsWith(".js"))
  .map((name) => readFileSync(`${directory}/${name}`, "utf8"))
  .join("\n");
if (required.some((name) => !source.includes(process.env[name]))) {
  console.error(
    "Publicação interrompida: configuração do Supabase ausente do JavaScript gerado.",
  );
  process.exit(1);
}
console.log("Web validada: conexão com Supabase incluída no bundle.");
