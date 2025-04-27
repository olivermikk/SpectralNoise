(function(p) {
  let visualizerSketch = function(p) {
    let balls = [];
    let trailLayer;
    const numBalls = 10;
    let centerX, centerY;
    let lastAmp = 0;

    p.setup = function() {
      const container = document.getElementById("visualCanvas");
      const w = container?.clientWidth || 800;
      const h = container?.clientHeight || 600;
      const cnv = p.createCanvas(w, h);
      cnv.parent("visualCanvas");

      centerX = w / 2;
      centerY = h / 2;
      trailLayer = p.createGraphics(w, h);

      for (let i = 0; i < numBalls; i++) {
        const size = p.lerp(80, 20, i / (numBalls - 1));
        balls.push({
          angle: (p.TWO_PI / numBalls) * i,
          radius: 0,
          baseRadius: 30 + i * 12,
          size: size,
          x: centerX,
          y: centerY,
          direction: 1 // each ball has its own direction
        });
      }

      p.noStroke();
    };

    p.draw = function() {
      const colorA = p.color(window.visualizerColors.colorA);
      const colorB = p.color(window.visualizerColors.colorB);
      const rand = window.visualizerRandomness || 0;

      const spectrum = window.audioData.toneSections || [];
      const level = window.audioData.amplitude || 0;
      const ampDelta = level - lastAmp;
      lastAmp = level;

      const lerpVal = p.map(p.sin(p.frameCount * 0.01), -1, 1, 0, 1);
      const blendColor = p.lerpColor(colorA, colorB, lerpVal);

      const ampEffect = p.map(rand, 0, 1, 0.8, 4.0);
      const sectionEffect = p.map(rand, 0, 1, 0.5, 3.0);

      const baseSpeed = p.map(level, 0, 0.3, 0.001, 0.05 * (1 + rand));

      for (let i = 0; i < numBalls; i++) {
        const energy = spectrum[i] || 0;

        // If amplitude increased, change direction or amplify speed
        if (ampDelta > 0) {
          // Flip direction with randomness influence
          if (p.random() < rand * 0.8) {
            balls[i].direction *= -1;
          }
        }

        balls[i].angle += balls[i].direction * (baseSpeed + rand * 0.01);

        const targetRadius = p.map(energy * sectionEffect, 0, 255, 0, balls[i].baseRadius + 200);
        balls[i].radius = p.lerp(balls[i].radius, targetRadius, 0.1 * ampEffect);

        balls[i].x = centerX + balls[i].radius * p.cos(balls[i].angle);
        balls[i].y = centerY + balls[i].radius * p.sin(balls[i].angle);
      }

      for (let i = 0; i < numBalls; i++) {
        trailLayer.fill(blendColor.levels[0], blendColor.levels[1], blendColor.levels[2], 50);
        trailLayer.ellipse(balls[i].x, balls[i].y, balls[i].size);
      }

      p.image(trailLayer, 0, 0);
    };

    p.windowResized = function() {
      const container = document.getElementById("visualCanvas");
      const w = container?.clientWidth || 800;
      const h = container?.clientHeight || 600;
      p.resizeCanvas(w, h);

      centerX = w / 2;
      centerY = h / 2;

      const newTrail = p.createGraphics(w, h);
      newTrail.image(trailLayer, 0, 0);
      trailLayer = newTrail;
    };
  };

  new p5(visualizerSketch);
})(window.p5);
