const canvas = document.getElementById("colorCanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const hueSlider = document.getElementById("hueSlider");
const hexInput = document.getElementById("hexInput");
const rgbInput = document.getElementById("rgbInput");
const hslInput = document.getElementById("hslInput");
const imgCanvas = document.getElementById("imgCanvas");
const imgCtx = imgCanvas.getContext("2d", { willReadFrequently: true });

let currentRGB = { r: 16, g: 185, b: 129 };
let dragging = false;
let history = JSON.parse(localStorage.getItem("hexColorHist")) || [];

const init = () => {
  setupAccordion();
  setupCanvas();
  setupShortcuts();
  updateUI(currentRGB.r, currentRGB.g, currentRGB.b);
  renderHistory();

  window.addEventListener("resize", () => {
    setupCanvas();
    updateUI(currentRGB.r, currentRGB.g, currentRGB.b, false);
  });

  hueSlider.oninput = () => {
    drawPicker();
    pickColor(canvas.width, 0);
  };

  const startDrag = (e) => {
    dragging = true;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    pickColor(clientX - rect.left, clientY - rect.top);
  };

  const moveDrag = (e) => {
    if (!dragging) return;
    if (e.cancelable) e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    pickColor(clientX - rect.left, clientY - rect.top);
  };

  const endDrag = () => {
    if (dragging) {
      dragging = false;
      saveToHistory();
    }
  };

  canvas.addEventListener("mousedown", startDrag);
  window.addEventListener("mousemove", moveDrag, { passive: false });
  window.addEventListener("mouseup", endDrag);

  canvas.addEventListener("touchstart", startDrag, { passive: true });
  window.addEventListener("touchmove", moveDrag, { passive: false });
  window.addEventListener("touchend", endDrag);

  document.getElementById("imgUpload").onchange = handleImage;
  imgCanvas.onclick = pickImageColor;
  document.getElementById("btnDrop").onclick = useEyeDropper;
  document.getElementById("btnRandom").onclick = () => {
    updateUI(rand(255), rand(255), rand(255));
    saveToHistory();
  };

  ["R", "G", "B"].forEach((l) => {
    const s = document.getElementById(`slide${l}`);
    s.oninput = () => {
      const vals = {
        r: document.getElementById("slideR").value,
        g: document.getElementById("slideG").value,
        b: document.getElementById("slideB").value,
      };
      updateUI(vals.r, vals.g, vals.b, false);
    };
  });

  hexInput.onchange = (e) => {
    const rgb = hexToRgb(e.target.value);
    if (rgb) updateUI(rgb.r, rgb.g, rgb.b);
  };
};

const setupAccordion = () => {
  document.querySelectorAll(".accordion-header").forEach((btn) => {
    btn.onclick = () => {
      const item = btn.parentElement;
      const isActive = item.classList.contains("active");
      document
        .querySelectorAll(".accordion-item")
        .forEach((i) => i.classList.remove("active"));
      if (!isActive) item.classList.add("active");
    };
  });
};

const setupCanvas = () => {
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = window.innerWidth <= 900 ? 250 : 300;
  drawPicker();
};

const drawPicker = () => {
  const hue = hueSlider.value;
  ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let gW = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gW.addColorStop(0, "white");
  gW.addColorStop(1, "transparent");
  ctx.fillStyle = gW;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let gB = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gB.addColorStop(0, "transparent");
  gB.addColorStop(1, "black");
  ctx.fillStyle = gB;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const pickColor = (x, y) => {
  x = Math.max(0, Math.min(x, canvas.width - 1));
  y = Math.max(0, Math.min(y, canvas.height - 1));
  const p = ctx.getImageData(x, y, 1, 1).data;
  updateUI(p[0], p[1], p[2], true);
};

const updateUI = (r, g, b, fromCanvas = false) => {
  r = parseInt(r);
  g = parseInt(g);
  b = parseInt(b);
  currentRGB = { r, g, b };
  const hex = rgbToHex(r, g, b);
  const hsl = rgbToHsl(r, g, b);

  document.getElementById("mainDisplay").style.backgroundColor = hex;
  hexInput.value = hex;
  rgbInput.value = `${r}, ${g}, ${b}`;
  hslInput.value = `${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%`;

  document.getElementById("slideR").value = r;
  document.getElementById("slideG").value = g;
  document.getElementById("slideB").value = b;
  document.getElementById("valR").innerText = r;
  document.getElementById("valG").innerText = g;
  document.getElementById("valB").innerText = b;

  if (!fromCanvas) {
    hueSlider.value = hsl.h;
    drawPicker();
  }

  updateHarmonies(hsl);
  updateScales(r, g, b);
  updateAPCA(r, g, b);
  updateUIBuilder(hex);
  nameColor(r, g, b);
};

const setupShortcuts = () => {
  window.onkeydown = (e) => {
    if (e.target.tagName === "INPUT") return;
    if (e.key.toLowerCase() === "c") copyToClipboard(hexInput.value);
    if (e.key.toLowerCase() === "r")
      document.getElementById("btnRandom").click();
  };
};

const useEyeDropper = async () => {
  if (!window.EyeDropper) return showToast("EyeDropper não suportado.");
  const dropper = new EyeDropper();
  try {
    const result = await dropper.open();
    const rgb = hexToRgb(result.sRGBHex);
    updateUI(rgb.r, rgb.g, rgb.b);
    saveToHistory();
  } catch (e) {}
};

const updateAPCA = (r, g, b) => {
  const calc = (bgR, bgG, bgB, txtR, txtG, txtB) => {
    const lum = (c) => Math.pow(c / 255, 2.218);
    const bgL = 0.2126 * lum(bgR) + 0.7152 * lum(bgG) + 0.0722 * lum(bgB);
    const txtL = 0.2126 * lum(txtR) + 0.7152 * lum(txtG) + 0.0722 * lum(txtB);
    return Math.round(Math.abs(bgL - txtL) * 100);
  };

  const w = calc(r, g, b, 255, 255, 255);
  const bl = calc(r, g, b, 0, 0, 0);

  document.getElementById("apcaWhiteVal").innerText = w + "%";
  document.getElementById("apcaWhite").style.background = rgbToHex(r, g, b);
  document.getElementById("apcaWhite").style.color = "white";

  document.getElementById("apcaBlackVal").innerText = bl + "%";
  document.getElementById("apcaBlack").style.background = rgbToHex(r, g, b);
  document.getElementById("apcaBlack").style.color = "black";
};

const updateUIBuilder = (hex) => {
  document.getElementById("uiNav").style.background = hex;
  document.getElementById("uiBtn").style.background = hex;
  document.getElementById("uiBtn").style.boxShadow = `0 4px 14px ${hex}66`;
};

const handleImage = (e) => {
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(
        1,
        imgCanvas.parentElement.clientWidth / img.width,
      );
      imgCanvas.width = img.width * scale;
      imgCanvas.height = img.height * scale;
      imgCtx.drawImage(img, 0, 0, imgCanvas.width, imgCanvas.height);
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
};

const pickImageColor = (e) => {
  const rect = imgCanvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (imgCanvas.width / rect.width);
  const y = (e.clientY - rect.top) * (imgCanvas.height / rect.height);
  const p = imgCtx.getImageData(x, y, 1, 1).data;

  const format = document.getElementById("copyFormat").value;
  const hex = rgbToHex(p[0], p[1], p[2]);

  let text = hex;
  if (format === "rgb") text = `rgb(${p[0]}, ${p[1]}, ${p[2]})`;
  if (format === "css") text = `--color-primary: ${hex};`;

  updateUI(p[0], p[1], p[2]);
  copyToClipboard(text);
  saveToHistory();
};

const updateScales = (r, g, b) => {
  const mix = (c1, c2, w) => Math.round(c1 * (1 - w) + c2 * w);
  let t = "",
    s = "";
  for (let i = 1; i <= 10; i++) {
    const w = i * 0.1;
    const th = rgbToHex(mix(r, 255, w), mix(g, 255, w), mix(b, 255, w));
    const sh = rgbToHex(mix(r, 0, w), mix(g, 0, w), mix(b, 0, w));
    t += `<div class="scale-swatch" style="background:${th}" onclick="updateUIFromHex('${th}')"></div>`;
    s += `<div class="scale-swatch" style="background:${sh}" onclick="updateUIFromHex('${sh}')"></div>`;
  }
  document.getElementById("tintsGrid").innerHTML = t;
  document.getElementById("shadesGrid").innerHTML = s;
};

const updateHarmonies = (hsl) => {
  const h = hsl.h,
    s = hsl.s,
    l = hsl.l;
  const points = [
    (h + 180) % 360,
    (h + 30) % 360,
    (h - 30) % 360,
    (h + 120) % 360,
    (h + 240) % 360,
  ];
  document.getElementById("harmonyGrid").innerHTML = points
    .map((p) => {
      const hex = hslToHex(p, s, l);
      return `<div class="swatch" style="background:${hex}" onclick="updateUIFromHex('${hex}')"></div>`;
    })
    .join("");
};

const updateUIFromHex = (hex) => {
  const rgb = hexToRgb(hex);
  if (rgb) {
    updateUI(rgb.r, rgb.g, rgb.b);
    saveToHistory();
  }
};

const saveToHistory = () => {
  const hex = hexInput.value;
  if (history[0] === hex) return;
  history.unshift(hex);
  if (history.length > 20) history.pop();
  localStorage.setItem("hexColorHist", JSON.stringify(history));
  renderHistory();
};

const renderHistory = () => {
  document.getElementById("historyGrid").innerHTML = history
    .map(
      (h) =>
        `<div class="swatch" style="background:${h}" onclick="updateUIFromHex('${h}')"></div>`,
    )
    .join("");
};

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  showToast(`Copiado: ${text}`);
};

const showToast = (msg) => {
  const toast = document.getElementById("toast");
  toast.innerText = msg;
  toast.classList.add("active");
  setTimeout(() => toast.classList.remove("active"), 2500);
};

const rand = (max) => Math.floor(Math.random() * max);
const rgbToHex = (r, g, b) =>
  "#" +
  [r, g, b]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
const hexToRgb = (hex) => {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  return m
    ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
    : null;
};
const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;
  if (max === min) h = s = 0;
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
};
const hslToHex = (h, s, l) => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return "#" + f(0) + f(8) + f(4);
};

const nameColor = (r, g, b) => {
  const names = [
    { n: "Emerald", r: 16, g: 185, b: 129 },
    { n: "Rose", r: 244, g: 63, b: 94 },
    { n: "Sky", r: 14, g: 165, b: 233 },
    { n: "Amber", r: 245, g: 158, b: 11 },
  ];
  let closest = names[0];
  let minDist = Infinity;
  names.forEach((n) => {
    const d = Math.sqrt((r - n.r) ** 2 + (g - n.g) ** 2 + (b - n.b) ** 2);
    if (d < minDist) {
      minDist = d;
      closest = n;
    }
  });
  document.getElementById("colorName").innerText = closest.n;
};

const exportTailwind = () =>
  copyToClipboard(JSON.stringify({ primary: hexInput.value }, null, 2));
const exportCSSVars = () => {
  let css = ":root {\n";
  history.forEach((h, i) => (css += `  --color-${i + 1}: ${h};\n`));
  css += "}";
  copyToClipboard(css);
};

init();
