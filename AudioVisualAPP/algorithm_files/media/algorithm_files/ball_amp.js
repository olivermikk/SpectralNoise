(function(p) {
  let visualizerSketch = function(p) {
    let ballY, velocity, gravity;
    let colorA, colorB;
    let trailLayer;

    p.setup = function() {
      const container = document.getElementById("visualCanvas");
      let w = container?.clientWidth || 800;
      let h = container?.clientHeight || 600;
      let cnv = p.createCanvas(w, h);
      cnv.parent("visualCanvas");

      trailLayer = p.createGraphics(w, h);

      ballY = p.height / 2;
      velocity = 0;
      gravity = 0.8; // slightly less heavy gravity

      colorA = p.color(window.visualizerColors.colorA);
      colorB = p.color(window.visualizerColors.colorB);

      p.noStroke();
    };

    p.draw = function() {
      // Update colors live
      colorA = p.color(window.visualizerColors.colorA);
      colorB = p.color(window.visualizerColors.colorB);

      let amp = window.audioData.amplitude || 0;
      let rand = window.visualizerRandomness || 0;

      // Ball dynamics
      velocity += gravity;
      velocity -= amp * 5; // stronger lift
      ballY += velocity;

      // Clamp velocity to avoid crazy speeds
      velocity = p.constrain(velocity, -10, 10);

      // Boundaries with auto-boost
      if (ballY > p.height) {
        ballY = p.height;
        velocity *= -0.7;
        velocity -= 2; // extra boost upward
      }
      if (ballY < 0) {
        ballY = 0;
        velocity *= -0.7;
        velocity += 2; // extra push downward
      }

      // X movement based on randomness
      let xOffset = p.width / 2 + p.map(p.noise(p.frameCount * 0.01), 0, 1, -rand * p.width / 2, rand * p.width / 2);

      // Draw trail
      let lerpVal = p.map(p.sin(p.frameCount * 0.02), -1, 1, 0, 1);
      let trailColor = p.lerpColor(colorA, colorB, lerpVal);
      trailLayer.fill(trailColor.levels[0], trailColor.levels[1], trailColor.levels[2], 40);
      trailLayer.ellipse(xOffset, ballY, 20);

      p.image(trailLayer, 0, 0);
    };

    p.windowResized = function() {
      const container = document.getElementById("visualCanvas");
      let w = container?.clientWidth || 800;
      let h = container?.clientHeight || 600;
      p.resizeCanvas(w, h);

      let newTrail = p.createGraphics(w, h);
      newTrail.image(trailLayer, 0, 0);
      trailLayer = newTrail;
    };
  };

  new p5(visualizerSketch);
})(window.p5);
