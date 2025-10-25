// 🐝 Ruhige Bienen: sanftes Fliegen + invertierter Scroll-Impuls + stabile Dämpfung
(function () {
  const layer = document.getElementById("bee-layer");
  if (!layer) return;

  const beeSrc = layer.getAttribute("data-bee-src") || "/static/img/bee.png";
  const NUM_BEES = 12;               // etwas weniger = ruhiger
  const SPEED_PX_S = 40;             // Grundgeschwindigkeit (Pixel pro Sekunde)
  const MAX_V = 0.25;                // Max. Basisgeschwindigkeit (px/frame in vNorm)
  const SCROLL_IMP_LIMIT = 400;      // Begrenzung des Impulses
  const NOISE = 0.001;               // sehr wenig Zufallsrauschen

  const bees = [];
  let lastY = window.scrollY;
  let scrollImpulse = 0;
  let lastTs = null;
  let running = true;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => Math.random() * (b - a) + a;

  // Bild erst laden, dann Bienen erzeugen → verhindert „Zucken“
  const sprite = new Image();
  sprite.src = beeSrc;
  sprite.onload = () => {
    for (let i = 0; i < NUM_BEES; i++) {
      const img = document.createElement("img");
      img.src = beeSrc;
      img.alt = "";
      img.className = "bee";
      layer.appendChild(img);

      bees.push({
        el: img,
        x: rand(0, window.innerWidth),
        y: rand(0, window.innerHeight),
        vx: rand(-0.03, 0.03),
        vy: rand(-0.02, 0.02),
        swaySpeed: rand(0.6, 1.0),     // 0.6–1.0 Hz
        swayRange: rand(10, 22),       // 10–22 px Amplitude
        swayPhase: rand(0, Math.PI * 2),
        rot: rand(-6, 6)
      });
    }
    requestAnimationFrame(tick);
  };

  // invertierter Scroll-Impuls: runter scrollen → Bienen nach oben
  function onScroll() {
    const y = window.scrollY;
    const dy = y - lastY;            // >0 = runter gescrollt
    lastY = y;
    scrollImpulse -= dy * 0.45;      // Stärke (kleiner = sanfter)
    scrollImpulse = clamp(scrollImpulse, -SCROLL_IMP_LIMIT, SCROLL_IMP_LIMIT);
  }

  // pausiere Animation, wenn Tab/Window nicht sichtbar (stabiler, sparsamer)
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    lastTs = null;                   // dt neu starten, sonst Sprung
    if (running) requestAnimationFrame(tick);
  });

  function tick(ts) {
    if (!running) return;
    if (lastTs == null) lastTs = ts;
    const dt = Math.min((ts - lastTs) / 1000, 0.05); // Sekunden; clamp auf 50 ms
    lastTs = ts;

    // Impuls langsam ausklingen lassen (zeitbasiert)
    scrollImpulse *= Math.pow(0.9, dt * 60); // ~0.9 pro 60 FPS

    const t = ts / 1000;

    for (const b of bees) {
      // kleines Rauschen (sehr sanft)
      b.vx += (Math.random() - 0.5) * NOISE;
      b.vy += (Math.random() - 0.5) * NOISE;

      // Scroll-Impuls wirkt vertikal (sehr dezent)
      b.vy += (scrollImpulse * 0.006) * dt;

      // Geschwindigkeiten begrenzen & leicht dämpfen
      b.vx = clamp(b.vx * (1 - 0.04 * dt * 60), -MAX_V, MAX_V);
      b.vy = clamp(b.vy * (1 - 0.04 * dt * 60), -MAX_V, MAX_V);

      // Seitliche Welle (ruhig)
      const waveX = Math.sin(t * b.swaySpeed + b.swayPhase) * (b.swayRange * 0.04);

      // Positionsupdate (zeitbasiert → überall gleich schnell)
      b.x += (b.vx * SPEED_PX_S + waveX) * dt;
      b.y += (b.vy * SPEED_PX_S + Math.sin(t * 2 * b.swaySpeed) * 2) * dt;
      b.rot += b.vx * 30 * dt;

      // Bildschirm-Wrap
      const pad = 60;
      if (b.x < -pad) b.x = window.innerWidth + pad / 2;
      if (b.x > window.innerWidth + pad) b.x = -pad / 2;
      if (b.y < -pad) b.y = window.innerHeight + pad / 2;
      if (b.y > window.innerHeight + pad) b.y = -pad / 2;

      b.el.style.transform =
        `translate(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px) rotate(${b.rot.toFixed(1)}deg)`;
    }

    requestAnimationFrame(tick);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    for (const b of bees) {
      b.x = Math.min(Math.max(b.x, -30), window.innerWidth + 30);
      b.y = Math.min(Math.max(b.y, -30), window.innerHeight + 30);
    }
  });
})();