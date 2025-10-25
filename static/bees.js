// Bienen: sanftes Fliegen + Scroll-Impuls (invertierte Richtung)
(function () {
  const layer = document.getElementById("bee-layer");
  if (!layer) return;

  const beeSrc = layer.getAttribute("data-bee-src") || "/static/img/bee.png";
  const NUM_BEES = 14;
  const bees = [];
  let lastY = window.scrollY;
  let scrollImpulse = 0;        // kumulierter Impuls durch Scrollen

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const rand = (a, b) => Math.random() * (b - a) + a;

  // Bienen erzeugen
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
      vx: rand(-0.06, 0.06),     // Grundgeschwindigkeit
      vy: rand(-0.03, 0.03),
      sway: rand(0.5, 1.2),
      rot: rand(-10, 10)
    });
  }

  // Scroll -> Impuls (invertiert: nach unten scrollen => Bienen nach oben)
  function onScroll() {
    const y = window.scrollY;
    const dy = y - lastY;     // >0 = runter gescrollt
    lastY = y;
    scrollImpulse -= dy * 0.6;   // Minus = invertierte Richtung, 0.6 = Stärke
    // Impuls begrenzen (gegen „Ausreißer“)
    scrollImpulse = clamp(scrollImpulse, -800, 800);
  }

  // Animation
  function tick() {
    // Impuls leicht ausklingen lassen
    scrollImpulse *= 0.92;

    for (const b of bees) {
      // sanftes Eigenleben
      b.vx += (Math.random() - 0.5) * 0.004;
      b.vy += (Math.random() - 0.5) * 0.002;

      // Scroll-Impuls auf vertikale Geschwindigkeit anwenden
      b.vy += (scrollImpulse * 0.015);  // 0.015 = wie stark der Impuls wirkt

      // Geschwindigkeiten sanft dämpfen, damit es ruhig bleibt
      b.vx = clamp(b.vx * 0.98, -0.6, 0.6);
      b.vy = clamp(b.vy * 0.98, -0.6, 0.6);

      // Positionen aktualisieren
      b.x += b.vx * 6;  // Multiplikator = „Pixel pro Frame“
      b.y += b.vy * 6 + Math.sin(performance.now() / 1000 * b.sway) * 0.4;
      b.rot += b.vx * 6;

      // Wrap an den Rändern
      if (b.x < -60) b.x = window.innerWidth + 30;
      if (b.x > window.innerWidth + 60) b.x = -30;
      if (b.y < -60) b.y = window.innerHeight + 30;
      if (b.y > window.innerHeight + 60) b.y = -30;

      b.el.style.transform = `translate(${Math.round(b.x)}px, ${Math.round(b.y)}px) rotate(${b.rot}deg)`;
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    for (const b of bees) {
      b.x = Math.min(b.x, window.innerWidth);
      b.y = Math.min(b.y, window.innerHeight);
    }
  });

  requestAnimationFrame(tick);
})();