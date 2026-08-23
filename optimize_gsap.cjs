const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

// The main issue might be opacity fading of huge DOM trees without will-change
app = app.replace(
  'className={`absolute inset-0 z-0 origin-center will-change-transform transition-opacity duration-1000 ${appMode === \'universe\' ? \'opacity-100\' : \'opacity-0 pointer-events-none\'}`}',
  'className={`absolute inset-0 z-0 origin-center will-change-[opacity,transform] transition-opacity duration-700 ease-in-out ${appMode === \'universe\' ? \'opacity-100\' : \'opacity-0 pointer-events-none\'}`}'
);

app = app.replace(
  'className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-1000 ${modalActive ? \'opacity-0\' : \'opacity-100\'}`}',
  'className={`absolute inset-0 z-10 pointer-events-none will-change-[opacity] transition-opacity duration-700 ease-in-out ${modalActive ? \'opacity-0\' : \'opacity-100\'}`}'
);

fs.writeFileSync('src/App.tsx', app);
console.log('App.tsx optimized');
