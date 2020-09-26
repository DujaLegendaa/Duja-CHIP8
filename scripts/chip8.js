import {Display, testRender, render} from "./display.js"
import {Keyboard, isKeyPressed} from "./keyboard.js"
import {CPU, loadSpritesIntoMemory, loadROM, cycle, testFunc} from "./cpu.js"

let CHIP8 = new CPU(new Keyboard(), new Display(64, 32, 10), 10);

let loop;

let fps = 60, fpsInterval, startTime, now, then, elapsed;

const init = () => {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;

    // TESTING CODE. REMOVE WHEN DONE TESTING.
    loadSpritesIntoMemory(CHIP8);
    loadROM("ADM.ch8", CHIP8);
    //console.log(CHIP8);
    // END TESTING CODE

    loop = requestAnimationFrame(step);
}

const step = () => {
    now = Date.now();
    elapsed = now - then;

    if (elapsed > fpsInterval) {
        cycle(CHIP8);
    }
    loop = requestAnimationFrame(step);
}

const printRegisters = (CHIP8) => {
    for(let i = 0; i < CHIP8.registers.length; i++){
        document.querySelector("#registers").textContent += "V"+i.toString(16)+": "+CHIP8.registers[i];
    }
}

init();