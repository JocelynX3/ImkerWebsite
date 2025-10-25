// 🐝 Natürlicher Dauerflug + sanfter, invertierter Scroll-Impuls
(function () {
  const layer = document.getElementById("bee-layer");
  if (!layer) return;

  const beeSrc = layer.getAttribute("data-bee-src") || "/static/img/bee.png";

  // ---- Feintuning ----
  const NUM_BEES = 12;          // Anzahl Bienen
  const BASE_SPEED = 28;        // Grundgeschwindigkeit (px/s)
  const SCROLL_TO_IMPULSE = 1;// wie stark ein Scroll (dy) in Impuls umgesetzt wird
  const IMPULSE_DECAY = 0.5;   // wie schnell der Impuls ausklingt pro Sekunde (0.90 = schnell)
  const H_SWAY_MIN = 18, H_SWAY_MAX = 36;  // horizontale Wellenamplitude (px)
  const V_SWAY = 10;            // vertikale Wellenamplitude (px)
  const NOISE = 4;              // sehr wenig zufällige Unruhe (px/s)
  const PAD = 60;               // Randpuffer für Wrap

  const bees = [];
  let lastY = window.scrollY;
  let impulseY = 0;             // kumulierter vertikaler Impuls (px/s)
  let lastTs = performance.now();

  const rand = (a, b) => Math.random() * (b - a) + a;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // Bienen erzeugen (als <img>)
  for (let i = 0; i < NUM_BEES; i++) {
    const img = document.createElement("img");
    img.src = beeSrc;
    img.alt = "";
    img.className = "bee";
    layer.appendChild(img);

    bees.push({
      el: img,
      // Startposition
      x: rand(0, window.innerWidth),
      y: rand(0, window.innerHeight),
      // individueller Grundkurs (Richtung)
      dir: rand(0, Math.PI * 2),
      speed: BASE_SPEED * rand(0.8, 1.25),
      // seitliche Wellenbewegung
      swayA: rand(H_SWAY_MIN, H_SWAY_MAX),
      swayF: rand(0.3, 0.7),             // Hz
      phase: rand(0, Math.PI * 2),
      rot: rand(-8, 8)
    });
  }

  // Scroll: invertierter Impuls (runter scrollen -> Bienen nach oben)
  function onScroll() {
    const y = window.scrollY;
    const dy = y - lastY;  // >0 = nach unten gescrollt
    lastY = y;
    impulseY -= dy * SCROLL_TO_IMPULSE; // invertiert
    // harte Begrenzung gegen Ausreißer
    impulseY = clamp(impulseY, -600, 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  // Animation
  function tick() {
    const now = performance.now();
    const dt = Math.min((now - lastTs) / 1000, 0.05); // Sekunden, max 50ms
    lastTs = now;
    const t = now / 1000;

    // Impuls zeitbasiert ausklingen lassen
    const decay = Math.pow(IMPULSE_DECAY, dt * 60);
    impulseY *= decay;

    for (const b of bees) {
      // Grundbewegung entlang eines Kurses
      const baseVX = Math.cos(b.dir) * b.speed; // px/s
      const baseVY = Math.sin(b.dir) * b.speed; // px/s

      // sanftes seitliches Schweben + leichtes vertikales Wippen
      const waveX = Math.sin(t * 2 * Math.PI * b.swayF + b.phase) * b.swayA; // px
      const waveY = Math.cos(t * 2 * Math.PI * (b.swayF * 0.8) + b.phase) * V_SWAY; // px

      // sehr dezentes Rauschen (Zufallsdrift)
      const noiseVX = (Math.random() - 0.5) * NOISE; // px/s
      const noiseVY = (Math.random() - 0.5) * NOISE; // px/s

      // Scroll-Impuls wirkt vertikal (px/s)
      const impulseVY = impulseY;

      // Positionsupdate (px/s -> px per frame: * dt)
      b.x += (baseVX + noiseVX) * dt + waveX * 0.02; // waveX als kleine Drift
      b.y += (baseVY + noiseVY + impulseVY) * dt + waveY * 0.02;

      // leichte Rotation nach horizontaler Bewegung
      b.rot += (baseVX + noiseVX) * 0.02 * dt;

      // Bildschirm-Wrap
      if (b.x < -PAD) b.x = window.innerWidth + PAD / 2;
      if (b.x > window.innerWidth + PAD) b.x = -PAD / 2;
      if (b.y < -PAD) b.y = window.innerHeight + PAD / 2;
      if (b.y > window.innerHeight + PAD) b.y = -PAD / 2;

      b.el.style.transform =
        `translate(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px) rotate(${b.rot.toFixed(2)}deg)`;
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // Resizing: Positionen im Bildschirm halten
  window.addEventListener("resize", () => {
    for (const b of bees) {
      b.x = clamp(b.x, -PAD, window.innerWidth + PAD);
      b.y = clamp(b.y, -PAD, window.innerHeight + PAD);
    }
  });
})();