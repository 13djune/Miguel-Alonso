const fs = require('fs');
const path = require('path');

const dir = 'src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('backdrop-blur')) {
    // Replace all occurrences of backdrop-blur utility classes
    content = content.replace(/backdrop-blur-(sm|md|lg|xl|2xl|3xl|none)/g, '');
    content = content.replace(/backdrop-blur/g, ''); // catch bare backdrop-blur
    
    // Clean up double spaces left by removal
    content = content.replace(/\s+/g, ' ');
    
    fs.writeFileSync(filePath, content);
    console.log(`Removed backdrop-blur from ${file}`);
  }
}
