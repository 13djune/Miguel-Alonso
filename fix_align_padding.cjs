const fs = require('fs');
let overlay = fs.readFileSync('src/components/Overlay.tsx', 'utf8');

// Fix Header Alignment
overlay = overlay.replace(
  'className="flex flex-col lg:flex-row items-start lg:items-end gap-2 lg:gap-4 relative pl-2 md:pl-4 border-l-2 border-white"',
  'className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-4 relative pl-2 md:pl-4 border-l-2 border-white"'
);

overlay = overlay.replace(
  'className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pointer-events-auto lg:pb-1"',
  'className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pointer-events-auto"'
);

// Fix Footer Padding
overlay = overlay.replace(
  'className={`fixed bottom-0 left-0 right-0 px-4 pb-4 md:px-12 md:pb-12 flex-col md:flex-row md:items-center gap-4 md:gap-8 border-t border-white pt-4 animate-item z-50 pointer-events-none ${appMode === \'terminal\' ? \'hidden\' : \'flex\'}`}',
  'className={`fixed bottom-0 left-0 right-0 px-4 pb-4 md:px-12 md:pb-6 flex-col md:flex-row md:items-center gap-4 md:gap-8 border-t border-white pt-4 animate-item z-50 pointer-events-none ${appMode === \'terminal\' ? \'hidden\' : \'flex\'}`}'
);

fs.writeFileSync('src/components/Overlay.tsx', overlay);
console.log('Fixed alignments and paddings');
