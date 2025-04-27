(function(p) {
  let visualizerSketch = function(p) {
    let t = 0;
    let phaseX = 0;
    let phaseY = 0;
    let fadeAlpha = 10;

    p.setup = function() {
      let container = document.getElementById("visualCanvas");
      let w = container?.clientWidth || 800;
      let h = container?.clientHeight || 600;
      let cnv = p.createCanvas(w, h);
      cnv.parent("visualCanvas");
      p.background(0);
      p.strokeWeight(1);
      p.noFill();
    };

    p.draw = function() {
      p.background(0, fadeAlpha);

      let colorA = p.color(window.visualizerColors.colorA);
      let colorB = p.color(window.visualizerColors.colorB);

      let amp = window.audioData.amplitude || 0;
      let dominantFreq = window.audioData.dominantFreq || 0;
      let spectrum = window.audioData.toneSections || [];
      let randomness = window.visualizerRandomness || 0;

      let baseA = 2.5;
      let baseB = 3.5;

      let size = p.height / 3;
      let warp = randomness * 1.0;

      // Offset shift based on dominant frequency
      let freqOffset = p.map(dominantFreq, 0, 2000, 0, p.TWO_PI);

      p.translate(p.width / 2, p.height / 2);

      p.beginShape();
      for (let i = 0; i < p.TWO_PI * 4; i += 0.02) {
        let angleNoise = p.noise(i * 0.3 + t * 0.1) * randomness * 0.2;

        let a = baseA + randomness * p.sin(i + t * 0.1) * 0.2;
        let b = baseB + randomness * p.cos(i + t * 0.1) * 0.2;

        let r = size * (1 + randomness * 0.1 * p.sin(i * 2 + t * 0.2));

        // Add the dominant frequency offset into the wave formula
        let x = p.sin(a * i + phaseX + angleNoise + freqOffset) * r;
        let y = p.sin(b * i + phaseY + angleNoise + freqOffset) * r;

        // Randomly pick between colorA and colorB
        if (p.random() < 0.5) {
          p.stroke(colorA);
        } else {
          p.stroke(colorB);
        }

        p.curveVertex(x, y);
      }
      p.endShape();

      // Movement speed controlled by amp
      let speed = p.map(amp, 0, 0.3, 0.0005, 0.002);

      phaseX += speed * (0.1 + randomness * 0.7);
      phaseY += speed * (5.0 + randomness * 5);
      t += speed;
    };

    p.windowResized = function() {
      let container = document.getElementById("visualCanvas");
      let w = container?.clientWidth || 800;
      let h = container?.clientHeight || 600;
      p.resizeCanvas(w, h);
    };
  };

  new p5(visualizerSketch);
})(window.p5);
