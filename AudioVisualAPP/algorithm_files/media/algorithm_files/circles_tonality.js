(function(p) {

  let visualizerSketch = function (p) {
    // Instance variables
    let baseShapeAngle = 0;
    let globalOffset = 0;
    let fadeAlpha = 10;  // Lower value means slower fading

    // Define two colors for the gradient.
    let colorA, colorB;

    p.setup = function () {
      // Create canvas using container's current dimensions
      let container = document.getElementById("visualCanvas");
      let w = container ? container.clientWidth : 800;
      let h = container ? container.clientHeight : 600;
      let cnv = p.createCanvas(w, h);
      cnv.parent("visualCanvas");
      p.background(0);

      colorA = p.color(window.visualizerColors.colorA);
      colorB = p.color(window.visualizerColors.colorB);
    };

    p.draw = function () {
      // Draw a translucent background for fading effect.
      p.background(0, fadeAlpha);
      globalOffset += 0.002;

      let colorA = p.color(window.visualizerColors.colorA);
      let colorB = p.color(window.visualizerColors.colorB);

      // Get frequency spectrum from extractVals.js (if available)
      let spectrum = window.audioData.toneSections || [];  // Use the frequency spectrum (tone sections)

      if (spectrum.length === 0) return;

      // Calculate the average frequency from the spectrum
      let avgFreq = 0;
      for (let i = 0; i < spectrum.length; i++) {
        avgFreq += spectrum[i];
      }
      avgFreq /= spectrum.length; // Average frequency

      baseShapeAngle += p.map(avgFreq, 0, 255, 0.005, 0.05); // Control rotation speed based on frequency
      let movementFactor = p.map(avgFreq, 20, 200, 0.5, 2);  // Adjust movement intensity based on frequency

      // Define shape sizes and segments based on the frequency spectrum
      let outerSegments = p.int(p.map(avgFreq, 20, 255, 8, 32));  // Number of segments based on frequency
      let outerShapeSize = p.map(avgFreq, 20, 255, 40, 200);  // Shape size based on frequency

      let innerSegments = p.int(p.map(avgFreq, 20, 255, 4, 8));  // Inner layer segments
      let innerShapeSize = p.map(avgFreq, 20, 255, 20, 100);  // Inner shape size

      // Calculate a lerp value for gradient effects based on the global offset
      let lerpVal = p.map(p.sin(globalOffset * 5), -1, 1, 0, 1);
      let outerColor = p.lerpColor(colorA, colorB, lerpVal);
      let innerColor = p.lerpColor(colorB, colorA, lerpVal);

      p.push();
      p.translate(p.width / 2, p.height / 2);

      // Outer Layer: Draw larger, more numerous segments based on frequency spectrum
      p.strokeWeight(2);
      p.stroke(outerColor);
      p.noFill();
      for (let i = 0; i < outerSegments; i++) {
        p.push();
        let angle = p.TWO_PI / outerSegments * i + baseShapeAngle + globalOffset;
        p.rotate(angle);
        if (i % 2 === 0) {
          p.scale(1, -1);
        }
        let randFactor = outerShapeSize * 0.1;
        p.beginShape();
        p.vertex(0, 0);
        let cp1x = outerShapeSize * 0.5 + p.random(-randFactor, randFactor);
        let cp1y = -outerShapeSize * 0.4 + p.random(-randFactor, randFactor);
        let cp2x = outerShapeSize + p.random(-randFactor, randFactor);
        let cp2y = outerShapeSize * 0.4 + p.random(-randFactor, randFactor);
        let endX = outerShapeSize * 1.5 + p.random(-randFactor, randFactor);
        let endY = p.random(-randFactor, randFactor);
        p.bezierVertex(cp1x, cp1y, cp2x, cp2y, endX, endY);
        p.endShape();
        p.pop();
      }

      // Inner Layer: Draw fewer segments, with less weight based on frequency spectrum
      p.strokeWeight(1);
      p.stroke(innerColor);
      for (let i = 0; i < innerSegments; i++) {
        p.push();
        let angle = p.TWO_PI / innerSegments * i - baseShapeAngle + globalOffset * 2;
        p.rotate(angle);
        p.scale(1, -1);
        let randFactorInner = innerShapeSize * 0.1;
        p.beginShape();
        p.vertex(0, 0);
        let cp1x = innerShapeSize * 0.5 + p.random(-randFactorInner, randFactorInner);
        let cp1y = -innerShapeSize * 0.3 + p.random(-randFactorInner, randFactorInner);
        let cp2x = innerShapeSize + p.random(-randFactorInner, randFactorInner);
        let cp2y = innerShapeSize * 0.3 + p.random(-randFactorInner, randFactorInner);
        let endX = innerShapeSize * 1.2 + p.random(-randFactorInner, randFactorInner);
        let endY = p.random(-randFactorInner, randFactorInner);
        p.bezierVertex(cp1x, cp1y, cp2x, cp2y, endX, endY);
        p.endShape();
        p.pop();
      }

      p.pop();
    };


  };

  new p5(visualizerSketch);
})(window.p5);

