const fs = require('fs');
let code = fs.readFileSync('src/components/IntroCurtain.tsx', 'utf8');

code = code.replace(
`      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => setIsReady(true), 400);
      }`,
`      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        // Do not auto-start. Let user click.
        setIsReady(true);
      }`
);

code = code.replace(
`  useEffect(() => {
    if (isReady && curtainRef.current) {
      gsap.to(curtainRef.current, {
        yPercent: -100,
        duration: 1.5,
        ease: 'power4.inOut',
        onStart: () => {
          if (onComplete) onComplete();
        }
      });
    }
  }, [isReady]);`,
`  const handleStart = () => {
    if (curtainRef.current) {
      gsap.to(curtainRef.current, {
        yPercent: -100,
        duration: 1.5,
        ease: 'power4.inOut',
        onStart: () => {
          if (onComplete) onComplete();
        }
      });
    }
  };`
);

// We need to render the button when isReady is true
code = code.replace(
`        <div className="mt-2 text-xs">{progress.toFixed(0)}%</div>
      </div>`,
`        <div className="mt-2 text-xs">{progress.toFixed(0)}%</div>
        
        {isReady && (
          <div className="mt-8">
            <button 
              onClick={handleStart}
              className="px-6 py-2 border border-[#c4ffff] text-[#c4ffff] hover:bg-[#c4ffff] hover:text-black transition-colors font-bold tracking-widest text-xs uppercase animate-pulse"
            >
              [ {t('overlay.target.select') || 'START_SYSTEM'} ]
            </button>
          </div>
        )}
      </div>`
);

fs.writeFileSync('src/components/IntroCurtain.tsx', code);
