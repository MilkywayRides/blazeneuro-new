const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('src/app/dashboard');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  const regex = /\{new Date\(([^)]+)\)\.toLocaleDateString\(\)\}/g;
  
  if (regex.test(content)) {
    content = content.replace(regex, '<RelativeTime date={$1} />');
    
    if (!content.includes('import { RelativeTime }')) {
      content = 'import { RelativeTime } from "@/components/relative-time";\n' + content;
    }
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated dates in ${file}`);
  }
});
