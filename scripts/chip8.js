import {Display, testRender, render} from "./display.js"

let Chip8Display = new Display(64, 32, 10);

let loop;

let fps = 60, fpsInterval, startTime, now, then, elapsed;

const init = () => {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;

    // TESTING CODE. REMOVE WHEN DONE TESTING.
    testRender(Chip8Display);
    render(Chip8Display);
    // END TESTING CODE

    loop = requestAnimationFrame(step);
}

const step = () => {
    now = Date.now();
    elapsed = now - then;

    if (elapsed > fpsInterval) {
        // Cycle the CPU. We'll come back to this later and fill it out.
    }

    loop = requestAnimationFrame(step);
}

init();