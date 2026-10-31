import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

const available = (file: string) => existsSync(path.join(process.cwd(), "public", file));
function asset(file: string) {
  if (!available(file)) return "";
  const hash = createHash("sha256").update(readFileSync(path.join(process.cwd(), "public", file))).digest("hex").slice(0, 12);
  return `/${file}?v=${hash}`;
}
const dimensions = available("brand/dimensions.json")
  ? JSON.parse(readFileSync(path.join(process.cwd(), "public/brand/dimensions.json"), "utf8")) as { width: number; height: number }
  : { width: 960, height: 480 };

// Assets are generated from the supplied original with npm run brand:assets.
export const brand = {
  logo: asset("brand/logo.webp"),
  ...dimensions,
  og: asset("brand/og.png"),
  icon: asset("brand/icon-512.png"),
  appleIcon: asset("brand/apple-touch-icon.png"),
};
