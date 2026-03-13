import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const TARGET_DIRS = ["src"];
const ROOT_FILES = ["server.js"];
const SOURCE_EXTENSIONS = new Set([".js", ".mjs", ".cjs"]);
const RESOLVE_EXTENSIONS = [".js", ".mjs", ".cjs", ".json"];
const INDEX_CANDIDATES = RESOLVE_EXTENSIONS.map((ext) => `index${ext}`);

const IMPORT_PATTERNS = [
  /import\s+[^"']*?\sfrom\s*["']([^"']+)["']/g,
  /export\s+[^"']*?\sfrom\s*["']([^"']+)["']/g,
  /import\s*\(\s*["']([^"']+)["']\s*\)/g,
];

const toPosixPath = (value) => value.split(path.sep).join("/");

const getLineNumber = (content, index) => content.slice(0, index).split("\n").length;

const readDirEntries = (dirPath) => {
  try {
    return fs.readdirSync(dirPath);
  } catch {
    return null;
  }
};

const isSourceFile = (filePath) => SOURCE_EXTENSIONS.has(path.extname(filePath));

const collectSourceFiles = () => {
  const files = [];

  for (const fileName of ROOT_FILES) {
    const absolute = path.join(ROOT_DIR, fileName);
    if (fs.existsSync(absolute) && isSourceFile(absolute)) {
      files.push(absolute);
    }
  }

  const walk = (dirPath) => {
    if (!fs.existsSync(dirPath)) return;

    for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
      const absolute = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") {
          continue;
        }
        walk(absolute);
        continue;
      }

      if (entry.isFile() && isSourceFile(absolute)) {
        files.push(absolute);
      }
    }
  };

  for (const target of TARGET_DIRS) {
    walk(path.join(ROOT_DIR, target));
  }

  return files;
};

const extractImports = (content) => {
  const imports = [];

  for (const pattern of IMPORT_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(content)) !== null) {
      imports.push({
        value: match[1],
        index: match.index,
      });
    }
  }

  return imports;
};

const checkPathCase = (fromDir, relativePath) => {
  const parts = relativePath.replace(/\\/g, "/").split("/").filter(Boolean);
  let current = fromDir;
  let hasMismatch = false;

  for (const part of parts) {
    if (part === ".") continue;
    if (part === "..") {
      current = path.dirname(current);
      continue;
    }

    const entries = readDirEntries(current);
    if (!entries) return { status: "not-found" };

    if (entries.includes(part)) {
      current = path.join(current, part);
      continue;
    }

    const caseInsensitive = entries.find((entry) => entry.toLowerCase() === part.toLowerCase());
    if (!caseInsensitive) return { status: "not-found" };

    hasMismatch = true;
    current = path.join(current, caseInsensitive);
  }

  if (!fs.existsSync(current)) return { status: "not-found" };

  const relativeResolved = toPosixPath(path.relative(fromDir, current));
  const correctedImport = relativeResolved.startsWith(".")
    ? relativeResolved
    : `./${relativeResolved}`;

  return {
    status: hasMismatch ? "case-mismatch" : "exact",
    correctedImport,
  };
};

const checkImportPath = (fromFile, importPath) => {
  if (!importPath.startsWith(".")) {
    return null;
  }

  const fromDir = path.dirname(fromFile);
  const hasExtension = path.extname(importPath) !== "";
  const candidates = [];

  if (hasExtension) {
    candidates.push(importPath);
  } else {
    for (const ext of RESOLVE_EXTENSIONS) {
      candidates.push(`${importPath}${ext}`);
    }
    for (const indexName of INDEX_CANDIDATES) {
      candidates.push(`${importPath}/${indexName}`);
    }
  }

  let mismatchResult = null;

  for (const candidate of candidates) {
    const result = checkPathCase(fromDir, candidate);
    if (result.status === "exact") return null;
    if (result.status === "case-mismatch" && mismatchResult === null) {
      mismatchResult = result;
    }
  }

  if (mismatchResult) {
    return {
      type: "case-mismatch",
      importPath,
      suggestion: mismatchResult.correctedImport,
    };
  }

  return {
    type: "unresolved",
    importPath,
  };
};

const run = () => {
  const issues = [];
  const files = collectSourceFiles();

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, "utf8");
    const imports = extractImports(content);

    for (const imported of imports) {
      const issue = checkImportPath(filePath, imported.value);
      if (!issue) continue;

      issues.push({
        ...issue,
        filePath,
        line: getLineNumber(content, imported.index),
      });
    }
  }

  if (issues.length === 0) {
    console.log("Import case check passed.");
    return;
  }

  console.error("Import case check failed:");
  for (const issue of issues) {
    const relativeFile = toPosixPath(path.relative(ROOT_DIR, issue.filePath));

    if (issue.type === "case-mismatch") {
      console.error(
        `- ${relativeFile}:${issue.line} import "${issue.importPath}" has incorrect casing. Use "${issue.suggestion}".`
      );
      continue;
    }

    console.error(
      `- ${relativeFile}:${issue.line} import "${issue.importPath}" could not be resolved.`
    );
  }

  process.exitCode = 1;
};

run();
