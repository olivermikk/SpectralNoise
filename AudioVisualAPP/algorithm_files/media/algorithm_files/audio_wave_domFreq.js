(function(p) {
  let visualizerSketch = function(p) {
    let noiseSeedOffset = 0;
    let waveDirection;
    let directionAngle = 0;

    // New: variables to shift the gradient over time
    let gradientShiftX = 0;
    let gradientShiftY = 0;
    let gradientShiftSpeedX = 0;
    let gradientShiftSpeedY = 0;

    p.setup = function() {
      let container = document.getElementById("visualCanvas");
      let w = container ? container.clientWidth : 800;
      let h = container ? container.clientHeight : 600;
      let cnv = p.createCanvas(w, h);
      cnv.parent("visualCanvas");
      p.noStroke();
      p.background(0);

      waveDirection = p5.Vector.random2D();

      // Randomize initial gradient movement speeds
      gradientShiftSpeedX = p.random(-0.0005, 0.0005);
      gradientShiftSpeedY = p.random(-0.0005, 0.0005);

      document.addEventListener("fullscreenchange", () => {
        setTimeout(() => {
          p.windowResized();
        }, 100);
      });
    };

    p.draw = function() {
      p.background(0, 30);

      let level = window.audioData.amplitude || 0;
      let dominantFreq = window.audioData.dominantFreq || 0;
      let randomness = window.visualizerRandomness || 0;

      let colorA = p.color(window.visualizerColors.colorA);
      let colorB = p.color(window.visualizerColors.colorB);

      directionAngle += p.map(level, 0, 0.3, 0.0005, 0.01);
      directionAngle += p.random(-randomness * 0.01, randomness * 0.01);
      waveDirection = p5.Vector.fromAngle(directionAngle);

      let waveFreq = p.map(dominantFreq, 0, 1024, 0.001, 0.01);
      let waveSpeed = p.map(dominantFreq, 0, 1024, 0.002, 0.04);

      let t = p.millis() * waveSpeed;
      noiseSeedOffset += 0.2;

      // Update gradient shifts
      gradientShiftX += gradientShiftSpeedX;
      gradientShiftY += gradientShiftSpeedY;

      // Bounce shift speeds if they get too large (keep contained)
      if (gradientShiftX > 0.5 || gradientShiftX < -0.5) gradientShiftSpeedX *= -1;
      if (gradientShiftY > 0.5 || gradientShiftY < -0.5) gradientShiftSpeedY *= -1;

      let rows = 80;
      let cols = 160;

      for (let y = 0; y < rows; y++) {
        let yOffsetRandomness = p.map(p.noise(y * 0.1 + noiseSeedOffset), 0, 1, -p.PI, p.PI);

        for (let x = 0; x < cols; x++) {
          let px = p.map(x, 0, cols, 0, p.width);
          let py = p.map(y, 0, rows, 0, p.height);

          let dirX = waveDirection.x * waveFreq * 200;
          let dirY = waveDirection.y * waveFreq * 200;

          let offsetX = p.sin(px * waveFreq + t + yOffsetRandomness + dirX);
          let offsetY = p.cos(py * waveFreq + t + x * 0.1 + dirY);
          let noiseOffset = p.noise(x * 0.05, y * 0.05, t * 0.1);

          let ampHeight = p.map(level, 0, 0.3, 20, 300);
          let amp = offsetX * offsetY * ampHeight * noiseOffset;

          let finalX = px;
          let finalY = py + amp;

          let dotSize = p.map(p.abs(amp), 0, ampHeight, 0.5, 7) + p.random(-0.5, 0.5);
          let brightness = p.map(p.abs(amp), 0, ampHeight, 50, 255);

          // Updated: create gradient mixing based on position + shifting
          let lerpFactorX = p.map(finalX / p.width + gradientShiftX, 0, 1, 0, 1);
          let lerpFactorY = p.map(finalY / p.height + gradientShiftY, 0, 1, 0, 1);
          let lerpFactor = (lerpFactorX + lerpFactorY) * 0.5;
          lerpFactor = p.constrain(lerpFactor, 0, 1); // clamp to valid range

          let blendedColor = p.lerpColor(colorA, colorB, lerpFactor);

          p.fill(blendedColor.levels[0], blendedColor.levels[1], blendedColor.levels[2], brightness);
          p.ellipse(finalX, finalY, dotSize, dotSize);
        }
      }
    };

    p.windowResized = function() {
      let container = document.getElementById("visualCanvas");
      let w = container ? container.clientWidth : 800;
      let h = container ? container.clientHeight : 600;
      p.resizeCanvas(w, h);
    };
  };

  new p5(visualizerSketch);
})(window.p5);
