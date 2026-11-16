// Crea db.json (la base de datos de json-server) a partir de db.inicial.json.
// Si ya existe no la toca, para no perder lo publicado; con --reiniciar la vuelve a copiar.
import { copyFileSync, existsSync } from "node:fs";

const reiniciar = process.argv.includes("--reiniciar");

if (reiniciar || !existsSync("db.json")) {
  copyFileSync("db.inicial.json", "db.json");
  console.log("db.json creada desde db.inicial.json");
}
