/* tablero.js -- marcador completo con logos cambiables por hover
   Incluye desbloqueo de audio y fallback WebAudio si <audio> falla.
*/


document.addEventListener("DOMContentLoaded", () => {

  /****************************************************
     VARIABLES
  ****************************************************/
  let localScore = 0;
  let visitScore = 0;
  let localFouls = 0;
  let visitFouls = 0;
  let period = 1; // number OR "PR"
  let timer = 600; // default 10:00
  let interval = null;
  let possession = "local"; // "local" | "visit"
  let audioUnlocked = false;
  let audioCtx = null; // para fallback WebAudio

  const timerEl = document.getElementById("timer");
  const buzzer = document.getElementById("buzzer");

  const logoLocal = document.getElementById("logoLocal");
  const logoVisit = document.getElementById("logoVisit");
  const uploadLocal = document.getElementById("uploadLocal");
  const uploadVisit = document.getElementById("uploadVisit");
  const btnLocal = document.getElementById("btnLocal");
  const btnVisit = document.getElementById("btnVisit");

  /****************************************************
     UTIL
  ****************************************************/
  function getMaxTimerForPeriod(p) {
    return p === "PR" ? 300 : 600;
  }

  function initAudioContextIfNeeded() {
    if (audioCtx) return;
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    } catch (e) {
      audioCtx = null;
    }
  }

  // Desbloqueo: intentamos reproducir y pausar el <audio> una vez por interacción
  function unlockAudio() {
    if (audioUnlocked) return;
    // Intentamos con <audio>
    if (buzzer) {
      buzzer.play().catch(()=>{}).then(() => {
        try { buzzer.pause(); buzzer.currentTime = 0; } catch(e){}
      });
    }
    // Preparamos WebAudio en segundo plano
    initAudioContextIfNeeded();
    audioUnlocked = true;
  }

  /****************************************************
     LOGOS (upload handling)
  ****************************************************/
  // Trigger file input when gear clicked
  if (btnLocal && uploadLocal) btnLocal.addEventListener("click", () => uploadLocal.click());
  if (btnVisit && uploadVisit) btnVisit.addEventListener("click", () => uploadVisit.click());

  // Read local logo
  if (uploadLocal) uploadLocal.addEventListener("change", function () {
    const f = this.files && this.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (e) => { if (logoLocal) logoLocal.src = e.target.result; };
    reader.readAsDataURL(f);
  });

  // Read visit logo
  if (uploadVisit) uploadVisit.addEventListener("change", function () {
    const f = this.files && this.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (e) => { if (logoVisit) logoVisit.src = e.target.result; };
    reader.readAsDataURL(f);
  });

  /****************************************************
     DISPLAY / POSESIÓN
  ****************************************************/
  function updatePossession() {
    const left = document.getElementById("arrowLeft");
    const right = document.getElementById("arrowRight");
    if (left) left.textContent = possession === "local" ? "←" : "";
    if (right) right.textContent = possession === "visit" ? "→" : "";
  }

  function updateDisplay() {
    const localScoreEl = document.getElementById("localScore");
    const visitScoreEl = document.getElementById("visitScore");
    const localFoulsEl = document.getElementById("localFouls");
    const visitFoulsEl = document.getElementById("visitFouls");
    const periodEl = document.getElementById("period");

    if (localScoreEl) localScoreEl.textContent = localScore;
    if (visitScoreEl) visitScoreEl.textContent = visitScore;
    if (localFoulsEl) localFoulsEl.textContent = localFouls;
    if (visitFoulsEl) visitFoulsEl.textContent = visitFouls;
    if (periodEl) periodEl.textContent = period;

    if (timerEl) {
      const m = String(Math.floor(timer / 60)).padStart(2, "0");
      const s = String(timer % 60).padStart(2, "0");
      timerEl.textContent = `${m}:${s}`;
    }

    updatePossession();
  }

  /****************************************************
     RELOJ / CONTROL PERIODO / CHICHARRA
  ****************************************************/
  function webAudioBeep(duration = 0.45, frequency = 1000, type = 'sine') {
    initAudioContextIfNeeded();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(frequency, now);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.6, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start(now);
    o.stop(now + duration + 0.02);
  }

  function playBuzzer() {
    // Intentamos con <audio> primero
    if (buzzer) {
      try {
        buzzer.pause();
        buzzer.currentTime = 0;
        const p = buzzer.play();
        if (p && p.catch) {
          p.catch((err) => {
            // si falla, fallback WebAudio
            console.warn("Audio element play failed:", err);
            webAudioBeep(0.45, 1200, 'sine');
          });
        }
        return;
      } catch (e) {
        console.warn("Buzzer play error:", e);
        webAudioBeep(0.45, 1200, 'sine');
        return;
      }
    }
    // Si no hay elemento <audio>, usamos WebAudio
    webAudioBeep(0.45, 1200, 'sine');
  }

  function autoNextPeriod() {
    playBuzzer();
    // si es PR, no avanzar auto
    if (period === "PR") return;

    // si estamos antes del 4, aumentamos
    if (typeof period === "number" && period < 4) {
      period++;
      localFouls = 0;
      visitFouls = 0;
      timer = getMaxTimerForPeriod(period);
      updateDisplay();
    } else {
      // en 4: no avanza automáticamente (fin del partido)
    }
  }

  function startClock() {
    if (interval) return;
    interval = setInterval(() => {
      if (timer > 0) {
        timer--;
        updateDisplay();
      } else {
        clearInterval(interval);
        interval = null;
        autoNextPeriod();
      }
    }, 1000);
  }

  function pauseClock() {
    clearInterval(interval);
    interval = null;
  }

  function resetClock() {
    timer = getMaxTimerForPeriod(period);
    updateDisplay();
  }

  function resetGame() {
    localScore = 0; visitScore = 0;
    localFouls = 0; visitFouls = 0;
    period = 1;
    timer = getMaxTimerForPeriod(period);
    possession = "local";
    updateDisplay();
  }

  function startOvertime() {
    period = "PR";
    localFouls = 0;
    visitFouls = 0;
    timer = getMaxTimerForPeriod("PR");
    updateDisplay();
    playBuzzer();
  }

  /****************************************************
     EVENTOS: teclado + primer click para desbloquear audio
  ****************************************************/
  // Intentamos desbloquear audio al primer click (útil en proyector/PC con mouse/touch)
  document.body.addEventListener("click", () => unlockAudio(), { once: true });
  // También desbloqueamos en la primera tecla
  document.addEventListener("keydown", (ev) => {
    unlockAudio();
    const key = (ev.key || "").toLowerCase();

    switch (key) {
      // Puntos Local
      case "q": localScore++; break;
      case "a": if (localScore > 0) localScore--; break;

      // Puntos Visita
      case "w": visitScore++; break;
      case "s": if (visitScore > 0) visitScore--; break;

      // Faltas Local
      case "e": localFouls++; break;
      case "d": if (localFouls > 0) localFouls--; break;

      // Faltas Visita
      case "r": visitFouls++; break;
      case "f": if (visitFouls > 0) visitFouls--; break;

      // Start / Pause (space)
      case " ":
        if (interval) pauseClock(); else startClock();
        break;

      // Reset reloj X
      case "x": resetClock(); break;

      // -1 segundo / +1 segundo
      case "z": timer = Math.max(0, timer - 1); break;
      case "c":
        const maxT = getMaxTimerForPeriod(period);
        timer = Math.min(maxT, timer + 1);
        break;

      // Reset total partido P
      case "p": resetGame(); break;

      // Cambiar posesión B
      case "b":
        possession = possession === "local" ? "visit" : "local";
        break;

      // Prórroga manual O
      case "o": startOvertime(); break;

      // Periodo flechas (manual)
      case "arrowright":
        // solo hasta 4 (no más)
        if (period === "PR") { /* no hacer nada */ }
        else if (typeof period === "number" && period < 4) {
          period++;
          localFouls = 0; visitFouls = 0; timer = getMaxTimerForPeriod(period);
        }
        break;
      case "arrowleft":
        if (period === "PR") { /* no hacer nada */ }
        else if (typeof period === "number" && period > 1) {
          period--;
          localFouls = 0; visitFouls = 0; timer = getMaxTimerForPeriod(period);
        }
        break;
    }

    updateDisplay();
  });

  // primer render
  timer = getMaxTimerForPeriod(period);
  updateDisplay();

  // utilidad interna expuesta en closure
  function getMaxTimerForPeriod(p) { return p === "PR" ? 300 : 600; }
  function unlockAudio() { // función ya definida arriba; la dejamos disponible
    if (audioUnlocked) return;
    if (buzzer) {
      buzzer.play().catch(()=>{}).then(()=> {
        try { buzzer.pause(); buzzer.currentTime = 0; } catch (e) {}
      });
    }
    initAudioContextIfNeeded();
    audioUnlocked = true;
  }

});
