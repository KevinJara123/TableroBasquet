/****************************************************
   VARIABLES
****************************************************/ 
let localScore = 0;
let visitScore = 0;
let localFouls = 0;
let visitFouls = 0;
let period = 1;
let timer = 600; // 10 minutos
let interval = null;

const timerEl = document.getElementById("timer");

/****************************************************
   FUNCIONES
****************************************************/
function updateDisplay() {
    // puntos
    document.getElementById("localScore").textContent = localScore;
    document.getElementById("visitScore").textContent = visitScore;

    // faltas
    document.getElementById("localFouls").textContent = localFouls;
    document.getElementById("visitFouls").textContent = visitFouls;

    // periodo
    document.getElementById("period").textContent = period;

    // reloj
    let m = Math.floor(timer / 60).toString().padStart(2, "0");
    let s = (timer % 60).toString().padStart(2, "0");
    timerEl.textContent = `${m}:${s}`;
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
        }
    }, 1000);
}

function pauseClock() {
    clearInterval(interval);
    interval = null;
}

function resetClock() {
    timer = 600;
    updateDisplay();
}

/****************************************************
   CONTROLES POR TECLADO
****************************************************/
// Puntos Local → Q (+1) / A (-1)
// Puntos Visita → W (+1) / S (-1)
// Faltas Local → E (+1) / D (-1)
// Faltas Visita → R (+1) / F (-1)
// Reloj → Space (Start/Pause), X Reset
// Periodo → → aumenta | ← reduce


document.addEventListener("keydown", (e) => {
    switch (e.key.toLowerCase()) {

        // Puntos Local
        case "q": localScore++; break;
        case "a": if(localScore>0) localScore--; break;

        // Puntos Visita
        case "w": visitScore++; break;
        case "s": if(visitScore>0) visitScore--; break;

        // Faltas Local
        case "e": localFouls++; break;
        case "d": if(localFouls>0) localFouls--; break;

        // Faltas Visita
        case "r": visitFouls++; break;
        case "f": if(visitFouls>0) visitFouls--; break;

        // Reloj Start/Pause
        case " ":
            if (interval) pauseClock(); else startClock();
            break;

        // Reset reloj
        case "x": resetClock(); break;

        // Periodo
        case "arrowright": period++; break;
        case "arrowleft": if(period>1) period--; break;
    }

    updateDisplay();
});
<audio id="buzzer" src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQgAAAAA////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"></audio>
updateDisplay();
