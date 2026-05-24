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

  let frame = 0;

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

  function animate() {
    ctx.clearRect(0, 0, 32, 32);
    
    // If we have access to GameState, we could animate fast during rolling,
    // but a continuous gentle animation is also nice.
    const isRolling = (window.GameState && window.GameState.isRollingAnim);
    
    const time = Date.now() / (isRolling ? 50 : 250); 
    
    // 4 Cowries arranged in a cross or square
    const positions = [
      { x: 10, y: 10, phase: 0 },
      { x: 22, y: 10, phase: 1 },
      { x: 10, y: 22, phase: 2 },
      { x: 22, y: 22, phase: 3 }
    ];
    
    positions.forEach(pos => {
      // Add jiggle
      const jiggleX = Math.sin(time * 2 + pos.phase) * (isRolling ? 3 : 0.5);
      const jiggleY = Math.cos(time * 2.3 + pos.phase) * (isRolling ? 3 : 0.5);
      
      const angle = Math.sin(time * 0.5 + pos.phase) * (isRolling ? Math.PI : 0.2);
      
      // Face up or down cycle
      // If rolling, flip wildly. If not, cycle slowly.
      const cycleTime = isRolling ? Math.floor(frame / 2) : Math.floor(frame / 20);
      const isFaceUp = (cycleTime + pos.phase) % 2 === 0;

      drawCowrie(pos.x + jiggleX, pos.y + jiggleY, angle, isFaceUp);
    });
    
    link.href = canvas.toDataURL('image/png');
    
    frame++;
    
    // 15 FPS when rolling, 5 FPS when idle
    setTimeout(animate, isRolling ? 66 : 200); 
  }

  // Start animation
  animate();
})();
