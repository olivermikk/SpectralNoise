(function(p) {
  let visualizerSketch = function(p) {
    let currentX, currentY, currentAngle;
    let t = 0;

    p.setup = function() {
      let container = document.getElementById("visualCanvas");
      let w = container ? container.clientWidth : 800;
      let h = container ? container.clientHeight : 600;
      let cnv = p.createCanvas(w, h);
      cnv.parent("visualCanvas");
      p.background(0);

      currentX = p.width / 2;
      currentY = p.height / 2;
      currentAngle = 0;

      p.strokeCap(p.ROUND);
      p.strokeJoin(p.ROUND);
      p.noFill();
    };

    p.draw = function() {
      let amp = window.audioData.amplitude || 0;
      let randomness = window.visualizerRandomness || 0;

      let colorA = p.color(window.visualizerColors.colorA);
      let colorB = p.color(window.visualizerColors.colorB);

      let gradientShift = (p.sin(t * 0.2) + 1) * 0.5;
      let blendedColor = p.lerpColor(colorA, colorB, gradientShift);

      // Stroke weight based only on randomness (plus small per-frame variation)
      let baseStroke = 3; // Base stroke weight
      let strokeW = baseStroke * (1 + p.random(-randomness, randomness)); // randomness wiggle
      p.strokeWeight(strokeW);
      p.stroke(blendedColor);

      // Amplitude controls line length
      let lineLength = p.map(amp, 0, 0.3, 5, 50);

      // Amplitude controls angle offset
      let angleOffset = p.map(amp, 0, 0.3, -180, 180);

      let targetAngle = currentAngle + angleOffset;
      let smoothAngle = p.lerp(currentAngle, targetAngle, 0.5);

      let newX = currentX + p.cos(smoothAngle) * lineLength;
      let newY = currentY + p.sin(smoothAngle) * lineLength;

      if (newX < 0 || newX > p.width) {
        smoothAngle = p.PI - smoothAngle;
        newX = currentX + p.cos(smoothAngle) * lineLength;
        newY = currentY + p.sin(smoothAngle) * lineLength;
      }
      if (newY < 0 || newY > p.height) {
        smoothAngle = -smoothAngle;
        newX = currentX + p.cos(smoothAngle) * lineLength;
        newY = currentY + p.sin(smoothAngle) * lineLength;
      }

      p.line(currentX, currentY, newX, newY);

      currentX = newX;
      currentY = newY;
      currentAngle = smoothAngle;

      t += 0.01;
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
