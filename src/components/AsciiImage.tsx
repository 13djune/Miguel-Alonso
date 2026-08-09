import { useEffect, useRef, useState } from 'react';

// Ordered from darkest to lightest
const ASCII_CHARS = ['@', '%', '#', '*', '+', '=', '-', ':', '.', ' '];

interface AsciiImageProps {
  src: string;
  charWidth?: number;
  charHeight?: number;
  className?: string;
  width?: number; // legacy prop to ignore
}

export default function AsciiImage({ src, charWidth = 6, charHeight = 10, className = '' }: AsciiImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    
    let animationFrameId: number;
    let originalImageData: ImageData | null = null;
    let cols = 0;
    let rows = 0;
    let rectWidth = 0;
    let rectHeight = 0;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = src;
    
    const drawAscii = (glitch = false) => {
       if (!originalImageData || !ctx) return;
       
       // Clear canvas
       ctx.fillStyle = 'black';
       ctx.fillRect(0, 0, canvas.width, canvas.height);
       
       ctx.fillStyle = '#c4ffff';
       // We use charHeight as the font size, typically monospaced fonts work well this way
       ctx.font = `bold ${charHeight}px monospace`;
       ctx.textBaseline = 'top';
       
       const pixels = originalImageData.data;
       
       for (let y = 0; y < rows; y++) {
         for (let x = 0; x < cols; x++) {
           const px = Math.floor(x * charWidth + charWidth / 2);
           const py = Math.floor(y * charHeight + charHeight / 2);
           
           if (px >= rectWidth || py >= rectHeight) continue;
           
           const idx = (py * rectWidth + px) * 4;
           const r = pixels[idx];
           const g = pixels[idx + 1];
           const b = pixels[idx + 2];
           const a = pixels[idx + 3];
           
           if (a < 128) continue; // Skip transparent pixels
           
           // Calculate brightness
           const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
           const charIdx = Math.floor((brightness / 255) * (ASCII_CHARS.length - 1));
           let char = ASCII_CHARS[ASCII_CHARS.length - 1 - charIdx];
           
           if (glitch && Math.random() > 0.995) {
             char = ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)];
           }
           
           ctx.fillText(char, x * charWidth, y * charHeight);
         }
       }
    };
    
    const processImage = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      
      rectWidth = Math.floor(rect.width);
      rectHeight = Math.floor(rect.height);
      
      // Support high DPI displays for rendering, but sample from 1x pixel data
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rectWidth * dpr;
      canvas.height = rectHeight * dpr;
      
      // Scale ctx to match DPR
      ctx.scale(dpr, dpr);
      
      // Determine logical columns and rows based on container size
      cols = Math.ceil(rectWidth / charWidth);
      rows = Math.ceil(rectHeight / charHeight);
      
      // Create a temporary canvas at 1x resolution to get pixel data
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = rectWidth;
      tempCanvas.height = rectHeight;
      const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
      if (!tempCtx) return;
      
      // We want object-fit: cover behavior
      const imgRatio = img.width / img.height;
      const containerRatio = rectWidth / rectHeight;
      
      let drawWidth = rectWidth;
      let drawHeight = rectHeight;
      let offsetX = 0;
      let offsetY = 0;
      
      if (imgRatio > containerRatio) {
         // Image is wider, crop sides
         drawHeight = rectHeight;
         drawWidth = img.width * (rectHeight / img.height);
         offsetX = (rectWidth - drawWidth) / 2;
      } else {
         // Image is taller, crop top/bottom
         drawWidth = rectWidth;
         drawHeight = img.height * (rectWidth / img.width);
         offsetY = (rectHeight - drawHeight) / 2;
      }
      
      // Fill black background on temp canvas
      tempCtx.fillStyle = 'black';
      tempCtx.fillRect(0, 0, rectWidth, rectHeight);
      
      // Draw the image onto the temp canvas
      tempCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      
      originalImageData = tempCtx.getImageData(0, 0, rectWidth, rectHeight);
      
      drawAscii();
    };
    
    img.onload = processImage;
    
    let lastTime = 0;
    const animate = (time: number) => {
       if (time - lastTime > 100) { 
         if (Math.random() > 0.7) {
           drawAscii(true);
         } else {
           drawAscii(false);
         }
         lastTime = time;
       }
       animationFrameId = requestAnimationFrame(animate);
    };
    
    animate(0);
    
    const handleResize = () => {
       if (img.complete) {
          processImage();
       }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Check if already loaded from cache
    if (img.complete) {
        processImage();
    }
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [src, charWidth, charHeight]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full cursor-crosshair overflow-hidden group bg-black flex items-center justify-center ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <canvas 
        ref={canvasRef} 
        className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
        style={{ filter: "drop-shadow(0 0 1px rgba(196,255,255,0.3))" }}
      />
      
      <img 
        src={src} 
        alt="Original" 
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} 
      />
    </div>
  );
}
