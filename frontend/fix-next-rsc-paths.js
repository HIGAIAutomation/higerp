const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      results.push(filePath);
    }
  });
  return results;
}

const outDir = path.resolve(__dirname, 'out');
if (!fs.existsSync(outDir)) {
  console.error("Out directory does not exist. Run next build first.");
  process.exit(1);
}

const files = walk(outDir);
let fixedCount = 0;
files.forEach((file) => {
  if (file.endsWith('__PAGE__.txt')) {
    const relativePath = path.relative(outDir, file);
    const parts = relativePath.split(path.sep);
    
    const nextIdx = parts.findIndex(part => part.startsWith('__next.'));
    if (nextIdx !== -1) {
      const routePrefixParts = parts.slice(0, nextIdx);
      const suffixParts = parts.slice(nextIdx);
      
      const dotFileNameWithPage = suffixParts.join('.');
      let dotFileNameWithoutPage = dotFileNameWithPage;
      if (dotFileNameWithoutPage.endsWith('.__PAGE__.txt')) {
        dotFileNameWithoutPage = dotFileNameWithoutPage.replace('.__PAGE__.txt', '.txt');
      } else if (dotFileNameWithoutPage.endsWith('__PAGE__.txt')) {
        dotFileNameWithoutPage = dotFileNameWithoutPage.replace('__PAGE__.txt', 'txt');
      }
      
      const targetDir = path.join(outDir, ...routePrefixParts);
      
      // Copy to the version with __PAGE__
      const targetPathWithPage = path.join(targetDir, dotFileNameWithPage);
      fs.copyFileSync(file, targetPathWithPage);
      
      // Copy to the version without __PAGE__
      const targetPathWithoutPage = path.join(targetDir, dotFileNameWithoutPage);
      fs.copyFileSync(file, targetPathWithoutPage);
      
      console.log(`Copied:\n  From: ${relativePath}\n  To (with PAGE):    ${path.relative(outDir, targetPathWithPage)}\n  To (without PAGE): ${path.relative(outDir, targetPathWithoutPage)}`);
      fixedCount += 2;
    }
  }
});
console.log(`Successfully fixed ${fixedCount} Next.js RSC static export paths.`);
