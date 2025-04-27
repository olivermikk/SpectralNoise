// --- Global Audio and Color State ---
window.audioData = { amplitude: 0, dominantFreq: 0, toneSections: [] };
window.visualizerColors = { colorA: '#000000', colorB: '#ffffff' };
  window.visualizerRandomness = 0.5;

let mic, filePlayer;
let fft, amplitude;
let pauseButton;
let audioInputType = null;
let audioSelected = false;

let sliderValue = 0;
let sliderDragging = false;
let fileInputElement;

let micButton, fileButton;
let colorPickerA, colorPickerB;
let colorALabel, colorBLabel;

let randomnessSlider, randomLabel;
let ampLabel, freqLabel;
let spectrumGraphics;

function setup() {
  const container = document.getElementById("canvas");
  createCanvas(container.clientWidth, container.clientHeight).parent("canvas");

  fft = new p5.FFT();
  amplitude = new p5.Amplitude();

  micButton = createButton("Microphone").parent("canvas").mousePressed(startMic);
  fileButton = createButton("Audio File").parent("canvas").mousePressed(startFileUpload);

  randomLabel = createDiv("Randomness:").parent("canvas").style("font-size", "12px");
  randomnessSlider = createSlider(0, 1, 0.5, 0.01).parent("canvas").input(() => {
    window.visualizerRandomness = randomnessSlider.value();
  });

  colorALabel = createDiv("Color 1:").parent("canvas").style("font-size", "12px");
  colorPickerA = createColorPicker(window.visualizerColors.colorA).parent("canvas").input(() => {
    window.visualizerColors.colorA = colorPickerA.value();
  });

  colorBLabel = createDiv("Color 2:").parent("canvas").style("font-size", "12px");
  colorPickerB = createColorPicker(window.visualizerColors.colorB).parent("canvas").input(() => {
    window.visualizerColors.colorB = colorPickerB.value();
  });

  ampLabel = createDiv("Amplitude: 0.00").parent("canvas").style("font-size", "16px");
  freqLabel = createDiv("Dominant Frequency: 0 Hz").parent("canvas").style("font-size", "16px");

  spectrumGraphics = createGraphics(width, 120);
  spectrumGraphics.parent("canvas");

  positionUI();
}

function updateCanvasSize() {
  const container = document.getElementById("canvas");
  resizeCanvas(container.clientWidth, container.clientHeight);
  positionUI();
}

window.addEventListener("resize", updateCanvasSize);

function startMic() {
  userStartAudio();
  if (filePlayer) {
    filePlayer.stop();
    filePlayer = null;
  }
  clearFileDOM();
  audioInputType = 'mic';
  audioSelected = true;
  mic = new p5.AudioIn();
  mic.start(() => {
    fft.setInput(mic);
    amplitude.setInput(mic);
  });
}

function startFileUpload() {
  if (mic) mic.stop();
  clearFileDOM();
  audioInputType = 'file';
  audioSelected = true;
  fileInputElement = createFileInput(handleFile);
  fileInputElement.parent("canvas");
  fileInputElement.position(fileButton.x + fileButton.width + 10, fileButton.y);
  fileInputElement.elt.click(); // Trigger file dialog automatically
}

function handleFile(file) {
  clearFileDOM();

  let loadingDiv = document.getElementById("loading-spinner");
  if (!loadingDiv) {
    loadingDiv = document.createElement("div");
    loadingDiv.id = "loading-spinner";
    loadingDiv.style.position = "fixed";
    loadingDiv.style.top = "50%";
    loadingDiv.style.left = "50%";
    loadingDiv.style.transform = "translate(-50%, -50%)";
    loadingDiv.style.padding = "12px 24px";
    loadingDiv.style.backgroundColor = "#fff3cd";
    loadingDiv.style.border = "1px solid #ffeeba";
    loadingDiv.style.borderRadius = "8px";
    loadingDiv.style.color = "#856404";
    loadingDiv.style.fontSize = "16px";
    loadingDiv.style.fontWeight = "500";
    loadingDiv.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
    loadingDiv.style.transition = "opacity 0.5s ease";
    loadingDiv.style.zIndex = "9999";
    document.body.appendChild(loadingDiv);
  }
  loadingDiv.innerText = "Loading audio...";

  if (file.type === 'audio') {
    if (filePlayer) {
      filePlayer.stop();
      clearFileDOM();
    }

    filePlayer = createAudio(file.data);
    filePlayer.elt.onloadeddata = () => {
      filePlayer.play();
      fft.setInput(filePlayer);
      amplitude.setInput(filePlayer);

      if (!pauseButton) {
        pauseButton = createButton("Pause").parent("canvas").mousePressed(togglePause);
      }

      positionUI();

      setTimeout(() => {
        loadingDiv.style.opacity = "0";
        setTimeout(() => loadingDiv.remove(), 500);
      }, 3000);
    };

    filePlayer.elt.onerror = () => {
      loadingDiv.innerText = "⚠️ Error loading audio file.";
      setTimeout(() => {
        loadingDiv.style.opacity = "0";
        setTimeout(() => loadingDiv.remove(), 500);
      }, 3000);
    };
  } else {
    loadingDiv.innerText = "❌ Please upload a valid audio file.";
    setTimeout(() => {
      loadingDiv.style.opacity = "0";
      setTimeout(() => loadingDiv.remove(), 500);
    }, 3000);
  }
}

function togglePause() {
  if (filePlayer) {
    if (filePlayer.elt.paused) {
      filePlayer.play();
      pauseButton.html("Pause");
    } else {
      filePlayer.pause();
      pauseButton.html("Resume");
    }
  }
}

function clearFileDOM() {
  if (fileInputElement) fileInputElement.remove();
  fileInputElement = undefined;
  if (pauseButton) {
    pauseButton.remove();
    pauseButton = undefined;
  }
}

function positionUI() {
  const pad = 10;
  let y = pad;

  micButton.position(pad, y);
  fileButton.position(pad + 120, y);
  if (fileInputElement) fileInputElement.position(fileButton.x + fileButton.width + 10, fileButton.y);

  y += 40;

  colorALabel.position(pad, y);
  colorPickerA.position(pad, y + 20);
  colorBLabel.position(pad + 100, y);
  colorPickerB.position(pad + 100, y + 20);
  y += 60;

  randomLabel.position(pad, y);
  randomnessSlider.position(pad, y + 20);
  y += 120;

  if (pauseButton) {
    pauseButton.position(pad, y);
  }

  y += 100;
  ampLabel.position(pad, y);
  y += 20;
  freqLabel.position(pad, y);

  spectrumGraphics.position(pad, y);
}

function draw() {
  background(255);

  if (filePlayer && !isNaN(filePlayer.elt.duration)) {
    let duration = filePlayer.elt.duration;
    let currentTime = filePlayer.elt.currentTime;
    if (!sliderDragging) sliderValue = currentTime / duration;

    const sliderX = 10;
    const sliderY = 200;
    const sliderW = width - 20;
    const sliderH = 10;

    fill(180);
    rect(sliderX, sliderY, sliderW, sliderH);
    fill(100);
    let knobX = sliderX + sliderValue * sliderW;
    ellipse(knobX, sliderY + sliderH / 2, sliderH * 2);

    fill(0);
    textSize(14);
    let currentMin = floor(currentTime / 60);
    let currentSec = floor(currentTime % 60);
    let durMin = floor(duration / 60);
    let durSec = floor(duration % 60);
    text(`${currentMin}:${nf(currentSec, 2)} / ${durMin}:${nf(durSec, 2)}`, sliderX, sliderY - 10);

    if (
      mouseX >= sliderX &&
      mouseX <= sliderX + sliderW &&
      mouseY >= sliderY &&
      mouseY <= sliderY + sliderH * 2
    ) {
      cursor(HAND);
    } else {
      cursor(ARROW);
    }
  }

  if (audioSelected) {
    let level = amplitude.getLevel();
    let spectrum = fft.analyze();
    let dominantFreq = getDominantFrequency(spectrum);
    let toneSections = calculateToneSections(spectrum);

    window.audioData = { amplitude: level, dominantFreq, toneSections };

    ampLabel.html(`Amplitude: ${nf(level, 1, 2)}`);
    freqLabel.html(`Dominant Frequency: ${dominantFreq} Hz`);

    spectrumGraphics.clear();
    for (let i = 0; i < spectrum.length; i++) {
      let barHeight = map(spectrum[i], 0, 255, 0, 100);
      spectrumGraphics.fill(0, 100, 255);
      spectrumGraphics.noStroke();
      spectrumGraphics.rect(i * 2, 120 - barHeight, 2, barHeight);
    }
    image(spectrumGraphics, 10, height - 130);
  }
}

function mousePressed() {
  const sliderX = 10;
  const sliderW = width - 20;
  const sliderH = 10;
  const sliderY = height - 330;
  if (
    mouseX >= sliderX &&
    mouseX <= sliderX + sliderW &&
    mouseY >= sliderY &&
    mouseY <= sliderY + sliderH * 2
  ) {
    sliderDragging = true;
  }
}

function mouseReleased() {
  sliderDragging = false;
}

function mouseDragged() {
  if (sliderDragging && filePlayer && !isNaN(filePlayer.elt.duration)) {
    const sliderX = 10;
    const sliderW = width - 20;
    sliderValue = constrain((mouseX - sliderX) / sliderW, 0, 1);
    filePlayer.elt.currentTime = sliderValue * filePlayer.elt.duration;
  }
}

function getDominantFrequency(spectrum) {
  let nyquist = sampleRate() / 2;
  let index = spectrum.indexOf(max(spectrum));
  return int(index * nyquist / spectrum.length);
}

function calculateToneSections(spectrum) {
  let sections = [];
  let numSections = 10;
  let sectionSize = floor(spectrum.length / numSections);
  for (let i = 0; i < numSections; i++) {
    let sum = 0;
    for (let j = i * sectionSize; j < (i + 1) * sectionSize; j++) {
      sum += spectrum[j];
    }
    sections.push(sum / sectionSize);
  }
  return sections;
}
