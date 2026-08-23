const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

const newGrid = `.bg-cyber-grid {
    background-image: 
      radial-gradient(circle at center, rgba(196, 255, 255, 0.3) 1px, transparent 1px),
      radial-gradient(circle at center, rgba(196, 255, 255, 0.3) 1px, transparent 1px);
    background-size: 6px 48px, 48px 6px;
    background-position: 0 0, 0 0;
  }`;

css = css.replace(/\.bg-cyber-grid \{[\s\S]*?\}\n/m, newGrid + '\n');
fs.writeFileSync('src/index.css', css);
