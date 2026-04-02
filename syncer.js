const fs = require("fs");
const path = require("path");

const baseDir = path.join(__dirname, "library");
if (!fs.existsSync(baseDir) || !fs.statSync(baseDir).isDirectory()) {
  console.error("Error: library directory not found at", baseDir);
  process.exit(1);
}

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const sections = [];
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      sections.push(...scanDirectory(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".pdf")) {
      files.push(entry.name);
    }
  }

  if (files.length) {
    const relPath = path.relative(__dirname, dir).replace(/\\/g, "/");
    sections.unshift({ [relPath]: files.sort((a, b) => a.localeCompare(b)) });
  }

  return sections;
}

const result = scanDirectory(baseDir);
const outputPath = path.join(__dirname, "pdf names.json");
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf8");

console.log("Wrote", outputPath, "with", result.length, "sections.");
