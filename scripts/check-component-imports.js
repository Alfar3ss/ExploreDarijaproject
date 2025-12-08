const fs = require('fs');
const path = require('path');

function findFiles(dir, ext) {
  const results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const d of list) {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) {
      results.push(...findFiles(full, ext));
    } else if (d.isFile() && full.endsWith(ext)) {
      results.push(full);
    }
  }
  return results;
}

const repo = process.cwd();
const tsxFiles = findFiles(repo, '.tsx');
const importRegex = /import\s+([A-Za-z0-9_${},\s*]+)\s+from\s+['\"](\.\.?\/.+components\/.+?)['\"]/g;

const problems = [];

for (const f of tsxFiles) {
  const src = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = importRegex.exec(src)) !== null) {
    const importClause = m[1].trim();
    const importPath = m[2];
    // resolve target file (.tsx or .ts or index)
    const possible = [
      path.resolve(path.dirname(f), importPath + '.tsx'),
      path.resolve(path.dirname(f), importPath + '.ts'),
      path.resolve(path.dirname(f), importPath, 'index.tsx'),
      path.resolve(path.dirname(f), importPath, 'index.ts'),
    ];
    const target = possible.find(p => fs.existsSync(p));
    if (!target) continue;

    const targetSrc = fs.readFileSync(target, 'utf8');
    // if importClause is a default import (no braces)
    const isDefault = !importClause.startsWith('{');
    if (isDefault) {
      if (!/export\s+default\s+/m.test(targetSrc)) {
        problems.push({ from: f, import: importClause, target });
      }
    } else {
      // named imports: ensure exported
      const names = importClause.replace(/[{}]/g, '').split(',').map(s=>s.trim()).filter(Boolean);
      for (const n of names) {
        const name = n.split(' as ')[0].trim();
        const re = new RegExp(`export\s+(const|function|class)\s+${name}|export\s+\{[\s\S]*\b${name}\b[\s\S]*\}`);
        if (!re.test(targetSrc)) {
          problems.push({ from: f, import: name, target, type: 'named-missing' });
        }
      }
    }
  }
}

if (problems.length === 0) {
  console.log('No import/export mismatches detected for components.');
  process.exit(0);
}

console.log('Detected potential import/export mismatches:');
for (const p of problems) {
  console.log(`- File ${p.from} imports '${p.import}' from ${p.target}, but target may not export it as expected.`);
}
process.exit(2);
