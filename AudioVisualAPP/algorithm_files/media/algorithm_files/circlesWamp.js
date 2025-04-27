(function(p) {
  let visualizerSketch = function(p) {
    let baseShapeAngle = 0;
    let globalOffset = 0;
    let fadeAlpha = 10; // Lower value means slower fading
    let colorA, colorB;


    p.setup = function() {
      let container = document.getElementById("visualCanvas");
      let w = container?.clientWidth || 800;
      let h = container?.clientHeight || 600;
      let cnv = p.createCanvas(w, h);
      cnv.parent("visualCanvas");
      p.background(0);
      p.strokeWeight(1);
      p.noFill();

      colorA = p.color(window.visualizerColors.colorA);
      colorB = p.color(window.visualizerColors.colorB);
    };

    p.draw = function() {
      p.background(0, fadeAlpha);
      globalOffset += 0.002;

      // Use real-time updated global color values
      let colorA = p.color(window.visualizerColors.colorA);
      let colorB = p.color(window.visualizerColors.colorB);

      let level = window.audioData.amplitude || 0;

      baseShapeAngle += p.map(level, 0, 0.1, 0.01, 0.05);

      let outerSegments = p.int(p.map(level, 0, 0.3, 8, 32));
      let outerShapeSize = p.map(level, 0, 0.3, 40, 200);

      let innerSegments = p.int(p.map(level, 0, 0.3, 4, 8));
      let innerShapeSize = p.map(level, 0, 0.3, 20, 100);

      let lerpVal = p.map(p.sin(globalOffset * 5), -1, 1, 0, 1);
      let outerColor = p.lerpColor(p.color(window.visualizerColors.colorA), p.color(window.visualizerColors.colorB), lerpVal);
      let innerColor = p.lerpColor(p.color(window.visualizerColors.colorB), p.color(window.visualizerColors.colorA), lerpVal);

      p.push();
      p.translate(p.width / 2, p.height / 2);

      p.strokeWeight(2);
      p.stroke(outerColor);
      p.noFill();
      for (let i = 0; i < outerSegments; i++) {
        p.push();
        let angle = p.TWO_PI / outerSegments * i + baseShapeAngle + globalOffset;
        p.rotate(angle);
        if (i % 2 === 0) p.scale(1, -1);
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
