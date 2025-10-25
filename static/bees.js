// 🐝 Bienen: sanftes Fliegen + Scroll-Impuls (invertierte Richtung) + seitliches Schweben
(function () {
  const layer = document.getElementById("bee-layer");
  if (!layer) return;

  const beeSrc = layer.getAttribute("data-bee-src") || "/static/img/bee.png";
  const NUM_BEES = 14;
  const bees = [];
  let lastY = window.scrollY;
  let scrollImpulse = 0; // vertikaler Scroll-Impuls

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const rand = (a, b) => Math.random() * (b - a) + a;

  // 🐝 Bienen erzeugen
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
      vx: rand(-0.05, 0.05), // Grundgeschwindigkeit
      vy: rand(-0.03, 0.03),
      swaySpeed: rand(0.6, 1.2), // Geschwindigkeit der Wellenbewegung
      swayRange: rand(20, 50),   // Amplitude der Wellenbewegung
      swayOffset: rand(0, Math.PI * 2), // Zufällige Startphase
      rot: rand(-10, 10)
    });
  }

  // 📜 Scroll -> Impuls (invertiert)
  function onScroll() {
    const y = window.scrollY;
    const dy = y - lastY; // >0 = runter gescrollt
    lastY = y;
    scrollImpulse -= dy * 0.6; // invertiert
    scrollImpulse = clamp(scrollImpulse, -800, 800);
  }

  // 🎞️ Animation
  function tick() {
    scrollImpulse *= 0.92; // Impuls ausklingen lassen
    const t = performance.now() / 1000;

    for (const b of bees) {
      // Sanftes Eigenleben
      b.vx += (Math.random() - 0.5) * 0.003;
      b.vy += (Math.random() - 0.5) * 0.002;

      // Scroll-Impuls (entgegengesetzt zur Scrollrichtung)
      b.vy += scrollImpulse * 0.015;

      // Zusätzliche horizontale Wellenbewegung 🌀
      const waveX = Math.sin(t * b.swaySpeed + b.swayOffset) * (b.swayRange * 0.05);
      b.x += b.vx * 4 + waveX; // sanft nach links/rechts schwingen
      b.y += b.vy * 5 + Math.sin(t * 2 * b.swaySpeed) * 0.3;
      b.rot += b.vx * 6;

      // Begrenzungen
      if (b.x < -60) b.x = window.innerWidth + 30;
      if (b.x > window.innerWidth + 60) b.x = -30;
      if (b.y < -60) b.y = window.innerHeight + 30;
      if (b.y > window.innerHeight + 60) b.y = -30;

      b.el.style.transform = `translate(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px) rotate(${b.rot.toFixed(1)}deg)`;
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