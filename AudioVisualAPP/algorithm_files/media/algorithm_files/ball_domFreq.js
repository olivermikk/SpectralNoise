(function(p) {
  let visualizerSketch = function(p) {
    let position;
    let targetPosition;
    let velocity;
    let lastFreq = null;
    let lastChangeTime = 0;

    let colorA, colorB;
    let trailLayer;

    let freqMapOrigin;
    let originVelocity;

    p.setup = function() {
      const container = document.getElementById("visualCanvas");
      let w = container?.clientWidth || 800;
      let h = container?.clientHeight || 600;
      let cnv = p.createCanvas(w, h);
      cnv.parent("visualCanvas");

      trailLayer = p.createGraphics(w, h);

      position = p.createVector(p.random(p.width), p.random(p.height));
      targetPosition = position.copy();
      velocity = p.createVector(0, 0);

      // Place origin anywhere on the canvas
      freqMapOrigin = p.createVector(p.random(p.width), p.random(p.height));
      originVelocity = p5.Vector.random2D().mult(0.5);

      colorA = p.color(window.visualizerColors.colorA);
      colorB = p.color(window.visualizerColors.colorB);

      p.noStroke();
    };

    p.draw = function() {
      colorA = p.color(window.visualizerColors.colorA);
      colorB = p.color(window.visualizerColors.colorB);
      let rand = window.visualizerRandomness || 0;

      // Move origin slowly
      freqMapOrigin.add(originVelocity);

      // Bounce origin off walls
      if (freqMapOrigin.x < 0 || freqMapOrigin.x > p.width) originVelocity.x *= -1;
      if (freqMapOrigin.y < 0 || freqMapOrigin.y > p.height) originVelocity.y *= -1;

      let currentFreq = window.audioData.dominantFreq || 0;
      if (currentFreq !== lastFreq) {
        let timeDiff = p.frameCount - lastChangeTime;
        lastChangeTime = p.frameCount;
        lastFreq = currentFreq;

        // Map frequency relative to dynamic origin
        let offsetX = p.map(currentFreq, 0, 20000, -p.width / 2, p.width / 2);
        let offsetY = p.map(Math.sin(currentFreq * 0.01), -1, 1, -p.height / 2, p.height / 2);

        offsetX += p.random(-rand * p.width / 4, rand * p.width / 4);
        offsetY += p.random(-rand * p.height / 4, rand * p.height / 4);

        targetPosition = p.createVector(freqMapOrigin.x + offsetX, freqMapOrigin.y + offsetY);

        let speed = p.map(timeDiff, 1, 120, 10, 2, true);
        velocity = p5.Vector.sub(targetPosition, position).setMag(speed);
      }

      position.add(velocity);

      if (position.x < 0 || position.x > p.width) {
        velocity.x *= -1;
        position.x = p.constrain(position.x, 0, p.width);
      }
      if (position.y < 0 || position.y > p.height) {
        velocity.y *= -1;
        position.y = p.constrain(position.y, 0, p.height);
      }

      let lerpVal = p.map(p.sin(p.frameCount * 0.01), -1, 1, 0, 1);
      let trailColor = p.lerpColor(colorA, colorB, lerpVal);
      trailLayer.fill(trailColor.levels[0], trailColor.levels[1], trailColor.levels[2], 50);
      trailLayer.ellipse(position.x, position.y, 20);

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