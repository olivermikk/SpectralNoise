(function(p) {
  let visualizerSketch = function(p) {
    let balls = [];
    let trailLayer;
    let centerX, centerY;
    let colorA, colorB;

    p.setup = function() {
      const container = document.getElementById("visualCanvas");
      let w = container ? container.clientWidth : 800;
      let h = container ? container.clientHeight : 600;
      let cnv = p.createCanvas(w, h);
      cnv.parent("visualCanvas");

      centerX = w / 2;
      centerY = h / 2;
      trailLayer = p.createGraphics(w, h);

      balls.push(createBall(centerX, centerY)); // Start with one

      colorA = p.color(window.visualizerColors.colorA);
      colorB = p.color(window.visualizerColors.colorB);

      p.noStroke();
    };

    function createBall(baseX, baseY) {
      return {
        angle: p.random(p.TWO_PI), // random starting angle
        radius: p.random(0, 200),   // random starting radius
        centerX: baseX + p.random(-50, 50),
        centerY: baseY + p.random(-50, 50),
        centerOffsetX: 0,
        centerOffsetY: 0,
        spinDirection: p.random([-1, 1]),  // Random left or right
        spinSpeedFactor: p.random(0.2, 1) // Random speed multiplier
      };
    }

    p.draw = function() {
      colorA = p.color(window.visualizerColors.colorA);
      colorB = p.color(window.visualizerColors.colorB);

      let amp = window.audioData.amplitude || 0;
      let dominantFreq = window.audioData.dominantFreq || 0;
      let rand = window.visualizerRandomness || 0;

      // Dynamically add more balls based on randomness
      let targetNumBalls = 1 + p.floor(rand * 11); // 1 to 6 balls
      while (balls.length < targetNumBalls) {
        balls.push(createBall(centerX, centerY));
      }
      while (balls.length > targetNumBalls) {
        balls.pop();
      }

      let lerpVal = p.map(p.sin(p.frameCount * 0.02), -1, 1, 0, 1);
      let trailColor = p.lerpColor(colorA, colorB, lerpVal);

      for (let ball of balls) {
        // Center drift using noise
        ball.centerOffsetX = p.map(p.noise(p.frameCount * 0.001 + ball.centerX), 0, 1, -rand * 150, rand * 150);
        ball.centerOffsetY = p.map(p.noise(p.frameCount * 0.001 + ball.centerY), 0, 1, -rand * 150, rand * 150);

        // Spin movement
        let freqMappedSpeed = p.map(dominantFreq, 0, 2000, 0.001, 3);
        freqMappedSpeed *= (1 + rand * 2.0); // 🛠️ randomness multiplies the speed dramatically!
        ball.angle += ball.spinDirection * ball.spinSpeedFactor * freqMappedSpeed * p.deltaTime * 0.001;

        // Radius dynamics
        let ampPush = p.map(amp, 0, 0.5, 0, 400);
        ball.radius += (ampPush - ball.radius) * 0.1;
        ball.radius *= (0.996 - rand * 0.002);

        // Ball position
        let ballX = (ball.centerX + ball.centerOffsetX) + ball.radius * p.cos(ball.angle);
        let ballY = (ball.centerY + ball.centerOffsetY) + ball.radius * p.sin(ball.angle);

        // Draw trail
        trailLayer.fill(trailColor.levels[0], trailColor.levels[1], trailColor.levels[2], 50);
        trailLayer.ellipse(ballX, ballY, 20);
      }

      p.image(trailLayer, 0, 0);
    };

    p.windowResized = function() {
      const container = document.getElementById("visualCanvas");
      let w = container ? container.clientWidth : 800;
      let h = container ? container.clientHeight : 600;
      p.resizeCanvas(w, h);

      centerX = w / 2;
      centerY = h / 2;

      let newTrail = p.createGraphics(w, h);
      newTrail.image(trailLayer, 0, 0);
      trailLayer = newTrail;
    };
  };

  new p5(visualizerSketch);
})(window.p5);
