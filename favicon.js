// favicon.js
(function() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  
  let link = document.getElementById('favicon');
  if (!link) {
    link = document.createElement('link');
    link.id = 'favicon';
    link.rel = 'icon';
    document.head.appendChild(link);
  }

  function drawCowrie(targetCtx, scale, x, y, angle, isFaceUp, isLight) {
    targetCtx.save();
    targetCtx.translate(x * scale, y * scale);
    targetCtx.rotate(angle);
    
    // Choose colors based on theme
    const shellColor = isLight ? '#d29c8f' : '#e3c06d'; // Rose Gold/Copper vs Gold
    const edgeColor = isLight ? '#9c6559' : '#b98c3e'; // Darker Rose Gold vs Darker Gold
    const slitColor = isLight ? '#592f25' : '#5d4f37'; // Deep copper-brown vs Dark bronze-brown
    
    // Draw outer shell
    targetCtx.fillStyle = shellColor;
    targetCtx.beginPath();
    targetCtx.ellipse(0, 0, 6 * scale, 8 * scale, 0, 0, Math.PI * 2);
    targetCtx.fill();
    
    // Draw shadow/edge
    targetCtx.strokeStyle = edgeColor;
    targetCtx.lineWidth = 1.5 * scale;
    targetCtx.stroke();

    if (isFaceUp) {
      // Draw inner slit (dark/concave area)
      targetCtx.fillStyle = slitColor;
      targetCtx.beginPath();
      targetCtx.ellipse(0, 0, 1.5 * scale, 6 * scale, 0, 0, Math.PI * 2);
      targetCtx.fill();
    }
    
    targetCtx.restore();
  }

  let startTime = Date.now();

  function animate() {
    // Check if light theme is active
    const isLight = document.body.classList.contains('light-theme');
    
    ctx.clearRect(0, 0, 32, 32);
    
    const logoCanvas = document.getElementById('header-logo-canvas');
    let logoCtx = null;
    let dpr = 1;
    
    if (logoCanvas) {
      dpr = window.devicePixelRatio || 1;
      // Handle high-DPI scaling dynamically
      const targetWidth = 64 * dpr;
      const targetHeight = 64 * dpr;
      if (logoCanvas.width !== targetWidth || logoCanvas.height !== targetHeight) {
        logoCanvas.width = targetWidth;
        logoCanvas.height = targetHeight;
      }
      logoCtx = logoCanvas.getContext('2d');
      logoCtx.clearRect(0, 0, targetWidth, targetHeight);
    }
    
    const elapsed = Date.now() - startTime;
    const cycleDuration = 2000; 
    const currentCycle = Math.floor(elapsed / cycleDuration);
    const cycleTime = elapsed % cycleDuration;
    
    const state = currentCycle % 5; 
    const isRolling = cycleTime < 400; 
    
    const positions = [
      { x: 10, y: 10, phase: 0 },
      { x: 22, y: 10, phase: 1 },
      { x: 10, y: 22, phase: 2 },
      { x: 22, y: 22, phase: 3 }
    ];
    
    positions.forEach((pos, idx) => {
      const jiggleX = isRolling ? Math.sin(elapsed * 0.05 + pos.phase) * 3 : Math.sin(elapsed * 0.002 + pos.phase) * 0.3;
      const jiggleY = isRolling ? Math.cos(elapsed * 0.04 + pos.phase) * 3 : Math.cos(elapsed * 0.003 + pos.phase) * 0.3;
      
      const angle = isRolling ? Math.sin(elapsed * 0.02 + pos.phase) * Math.PI : Math.sin(elapsed * 0.001 + pos.phase) * 0.1;
      
      let isFaceUp;
      if (isRolling) {
         isFaceUp = Math.random() > 0.5;
      } else {
         isFaceUp = idx < state;
      }

      // Draw favicon (32x32, scale=1)
      drawCowrie(ctx, 1, pos.x + jiggleX, pos.y + jiggleY, angle, isFaceUp, isLight);
      
      // Draw header logo (64x64 backing scaled by dpr, base scale = 2 * dpr)
      if (logoCtx) {
        drawCowrie(logoCtx, 2 * dpr, pos.x + jiggleX, pos.y + jiggleY, angle, isFaceUp, isLight);
      }
    });
    
    link.href = canvas.toDataURL('image/png');
    
    setTimeout(animate, isRolling ? 66 : 250); 
  }

  animate();
})();
