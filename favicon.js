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

  function drawCowrie(x, y, angle, isFaceUp) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    // Draw outer shell (gold/beige)
    ctx.fillStyle = '#e3c06d';
    ctx.beginPath();
    ctx.ellipse(0, 0, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw shadow/edge
    ctx.strokeStyle = '#b98c3e';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (isFaceUp) {
      // Draw inner slit (dark)
      ctx.fillStyle = '#5d4f37';
      ctx.beginPath();
      // An elegant slit
      ctx.ellipse(0, 0, 1.5, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  let startTime = Date.now();

  function animate() {
    ctx.clearRect(0, 0, 32, 32);
    
    const elapsed = Date.now() - startTime;
    // Each phase (0 to 4 openings) lasts 2 seconds
    const cycleDuration = 2000; 
    const currentCycle = Math.floor(elapsed / cycleDuration);
    const cycleTime = elapsed % cycleDuration;
    
    // Current target state (0 to 4 mouths open)
    const state = currentCycle % 5; 
    
    // First 400ms of the cycle is a "rolling" shake transition
    const isRolling = cycleTime < 400; 
    
    const positions = [
      { x: 10, y: 10, phase: 0 },
      { x: 22, y: 10, phase: 1 },
      { x: 10, y: 22, phase: 2 },
      { x: 22, y: 22, phase: 3 }
    ];
    
    positions.forEach((pos, idx) => {
      // Fast jitter when rolling, slow breathing when idle
      const jiggleX = isRolling ? Math.sin(elapsed * 0.05 + pos.phase) * 3 : Math.sin(elapsed * 0.002 + pos.phase) * 0.3;
      const jiggleY = isRolling ? Math.cos(elapsed * 0.04 + pos.phase) * 3 : Math.cos(elapsed * 0.003 + pos.phase) * 0.3;
      
      const angle = isRolling ? Math.sin(elapsed * 0.02 + pos.phase) * Math.PI : Math.sin(elapsed * 0.001 + pos.phase) * 0.1;
      
      let isFaceUp;
      if (isRolling) {
         isFaceUp = Math.random() > 0.5;
      } else {
         isFaceUp = idx < state;
      }

      drawCowrie(pos.x + jiggleX, pos.y + jiggleY, angle, isFaceUp);
    });
    
    link.href = canvas.toDataURL('image/png');
    
    // High framerate while rolling, low framerate when idle (saves battery)
    setTimeout(animate, isRolling ? 66 : 250); 
  }

  // Start animation
  animate();
})();
