import { render, fullClear, setPixel, shouldWrite } from "./display.js";
import { isKeyPressed } from "./keyboard.js"

export class CPU {
    constructor(Keyboard, Display, Speed) {
        this.display = Display;
        this.keyboard = Keyboard;

        this.memory = new Uint8Array(4096);

        this.registers = new Uint8Array(16);

        this.pc = 0x200;
        this.i = 0;
        this.delay = 0;
        this.soundTimer = 0;

        this.stack = new Array();
        this.speed = Speed;
        this.paused = false;
    }
}

export const loadSpritesIntoMemory = (CPU) => {
    const spritesArr = [
        0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
        0x20, 0x60, 0x20, 0x20, 0x70, // 1
        0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
        0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
        0x90, 0x90, 0xF0, 0x10, 0x10, // 4
        0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
        0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
        0xF0, 0x10, 0x20, 0x40, 0x40, // 7
        0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
        0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
        0xF0, 0x90, 0xF0, 0x90, 0x90, // A
        0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
        0xF0, 0x80, 0x80, 0x80, 0xF0, // C
        0xE0, 0x90, 0x90, 0x90, 0xE0, // D
        0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
        0xF0, 0x80, 0xF0, 0x80, 0x80  // F
    ];

    for(let i = 0; i < spritesArr.length; i++){
        CPU.memory[i] = spritesArr[i];
    }
    
    return CPU;
}

const loadProgramIntoMemory = (program, CPU) => {
    for(let i = 0; i < program.length; i++)
        CPU.memory[0x200 + i] = program[i];

    return CPU;
}

export const loadROM = (romName, CPU) => {
    var request = new XMLHttpRequest;
        
    request.onload = function() {
        if (request.response) {
            let program = new Uint8Array(request.response);
    
            CPU = loadProgramIntoMemory(program, CPU);
            }
        }
    
    request.open('GET', 'roms/' + romName);
    request.responseType = 'arraybuffer';
    
    request.send();
}

export const cycle = (CPU) => {
    const f = (I) => {
        if(I == CPU.speed)
            return CPU;
        if(!CPU.paused){
            let Opcode = (CPU.memory[CPU.pc] << 8 | CPU.memory[CPU.pc + 1]);
            CPU = executeInstruction(Opcode, CPU);
        }
        f(I + 1);
    };
    f(0);

    if(!CPU.paused)
        CPU = updateTimers(CPU);

    render(CPU.display);
}
    
const updateTimers = (CPU) => {
    if(CPU.delay > 0)
        CPU.delay -= 1;
    
    return CPU;
    
}

const executeInstruction = (Opcode, CPU) => {
    CPU.pc += 2;
    
    let X = (Opcode & 0x0F00) >> 8;
    let Y = (Opcode & 0x00F0) >> 4;
    //if(Opcode != 0)
       // console.log(Opcode.toString(16));

    switch(Opcode & 0xF000) {
        case 0x0000:
            switch(Opcode) {
                case 0x00E0:
                    CPU.display.pixelArr = new Array(CPU.display.col * CPU.display.row);
                    CPU.display.ctx.clearRect(0, 0, CPU.display.canvas.width, CPU.display.canvas.height);
                    break;
                case 0x00EE:
                    CPU = RET(CPU); // RET
                    break;
                case 0x0000:
                    break;
                default: 
                    console.log("0 - Unknown opcode: ", Opcode.toString(16));
                    break;
            }
            break;
        case 0x1000:
            CPU = JMP(Opcode, CPU); // JMP
            break;
        case 0x2000:
            CPU = CALL(Opcode, CPU);
            break;
        case 0x3000: 
            CPU = SE1(Opcode, X, CPU);
            break;
        case 0x4000:
            CPU = SNE1(Opcode, X, CPU);
            break;
        case 0x5000:
            CPU = SE2(X, Y, CPU);
            break;
        case 0x6000: 
            CPU = LD1(Opcode, X, CPU);
            break;
        case 0x7000:
            CPU = ADD1(Opcode, X, CPU);
            break;
        case 0x8000:
            switch(Opcode & 0x000F) {
                case 0x0:
                    CPU = LD2(X, Y, CPU);
                    break;
                case 0x1:
                    CPU = OR(X, Y, CPU);
                    break;
                case 0x2:
                    CPU = AND(X, Y, CPU);
                    break;
                case 0x3: 
                    CPU = XOR(X, Y, CPU);
                    break;
                case 0x4:
                    CPU = ADD2(X, Y, CPU);
                    break;
                case 0x5:
                    CPU = SUB(X, Y, CPU);
                    break;
                case 0x6: 
                    CPU = SHR(X, Y, CPU);
                    break;
                case 0x7:
                    CPU = SUBN(X, Y, CPU); 
                    break;
                case 0xE:
                    CPU = SHL(X, Y, CPU);
                    break;
                default: 
                    console.log("8 - Unknown opcode: ", Opcode.toString(16));
                    break;
            }
            break;
        case 0x9000:
            CPU = SNE2(X, Y, CPU);
            break;
        case 0xA000:
            CPU = LDI(Opcode, CPU);
            break;
        case 0xB000:
            CPU = JP(Opcode, CPU);
            break;
        case 0xC000:
            CPU = RND(Opcode, X, CPU);
            break;
        case 0xD000:
            CPU = DRW(Opcode, X, Y, CPU);
            break;
        case 0xE000:
            switch(Opcode & 0x00FF) {
                case 0x9E:
                    CPU = SKP(X, CPU);
                    break;
                case 0xA1:
                    CPU = SKNP(X, CPU);
                    break;
                default: 
                    console.log("E - Unknown opcode: ", Opcode.toString(16));
                    break;
            }
            break;
        case 0xF000:
            switch(Opcode & 0x00FF) {
                case 0x07:
                    CPU = LDV(X, CPU);
                    break;
                case 0x0A:
                    CPU = LDK(X, CPU);
                    break;
                case 0x15:
                    CPU = LDD(X, CPU);
                    break;
                case 0x18:
                    CPU = LDS(X, CPU);
                    break;
                case 0x1E:
                    CPU = ADDI(X, CPU);
                    break;
                case 0x29:
                    CPU = LDF(X, CPU);
                    break;
                case 0x33:
                    CPU = LDB(X, CPU);
                    break;
                case 0x55:
                    CPU = LDIX(X, CPU);
                    break;
                case 0x65:
                    CPU = LDVX(X, CPU);
                    break;
                default: 
                    console.log("F - Unknown opcode: ", Opcode.toString(16));
                    break;
            }
        break;
        default: 
            console.log("Unknown opcode: ", Opcode.toString(16));
            break;
    }

    return CPU;
}

export const testFunc = (CPU) => {

    CPU.registers[5] = 0xF8;
    CPU.registers[4] = 0x0F;
    console.log("Register 5 should have value of F7");
    CPU = XOR(5, 4, CPU);
    CPU = getDefaultCPU(CPU);

    return CPU;
}

const getDefaultCPU = (CPU) => {
    CPU.memory = new Uint8Array(4096);

    CPU.registers = new Uint8Array(16);

    CPU.pc = 0;
    CPU.i = 0;
    CPU.delay = 0;
    CPU.soundTimer = 0;

    CPU.stack = new Array();
    CPU.paused = false;
    return CPU;
}

const RET = (CPU) => {
    CPU.pc = CPU.stack.pop();
    return CPU;
}

const JMP = (Opcode, CPU) => {
    let addr = Opcode & 0x0FFF;
    CPU.pc = addr;
    return CPU;
}

const CALL = (Opcode, CPU) => {
    CPU.stack.push(CPU.pc);
    CPU.pc = Opcode & 0x0FFF;
    return CPU;
}

const SE1 = (Opcode, X, CPU) => {
    if (CPU.registers[X] == (Opcode & 0x00FF))
        CPU.pc += 2;
    return CPU;
}

const SNE1 = (Opcode, X, CPU) => {
    if (CPU.registers[X] != (Opcode & 0x00FF))
        CPU.pc += 2;
    return CPU;
}

const SE2 = (X, Y, CPU) => {
    if (CPU.registers[X] == CPU.registers[Y])
        CPU.pc += 2;
    return CPU;
}

const LD1 = (Opcode, X, CPU) => {
    CPU.registers[X] = (Opcode & 0x00FF);
    return CPU;
}

const ADD1 = (Opcode, X, CPU) => {
    CPU.registers[X] += (Opcode & 0x00FF);
    return CPU;
}

const LD2 = (X, Y, CPU) => {
    CPU.registers[X] = CPU.registers[Y];
    return CPU;
}

const OR = (X, Y, CPU) => {
    CPU.registers[X] |= CPU.registers[Y];
    return CPU;
}

const AND = (X, Y, CPU) => {
    CPU. registers[X] &= CPU.registers[Y];
    return CPU;
}

const XOR = (X, Y, CPU) => {
    CPU. registers[X] ^= CPU.registers[Y];
    return CPU;
}
//
//
//
//

const ADD2 = (X, Y, CPU) => {
    let sum = CPU.registers[X] + CPU.registers[Y];

    CPU.registers[0xF] = 0;

    if (sum > 0xFF)
        CPU.registers[0xF] = 1;

    CPU.registers[X] = sum;
    return CPU;
}

const SUB = (X, Y, CPU) => {
    CPU.registers[0xF] = 0;

    if (CPU.registers[X] > CPU.registers[Y])
        CPU.registers[0xF] = 1;

    CPU.registers[X] -= CPU.registers[Y];
    return CPU;
}

const SHR = (X, Y, CPU) => {
    CPU.registers[0xF] = 0;

    if (CPU.registers[X] & 0x0001)
        CPU.registers[0xF] = 1;

    CPU.registers[X] >>= 1;
    return CPU;
}

const SUBN = (X, Y, CPU) => {
    CPU.registers[0xF] = 0;

    if (CPU.registers[Y] > CPU.registers[X])
        CPU.registers[0xF] = 1;

    CPU.registers[X] = CPU.registers[Y] - CPU.registers[X];
    return CPU;
}

const SHL = (X, Y, CPU) => {
    CPU.registers[0xF] = 0;

    if (CPU.registers[X] & 0x80)
        CPU.registers[0xF] = 1;

    CPU.registers[X] <<= 1;
    return CPU;
}

const SNE2 = (X, Y, CPU) => {
    if (CPU.registers[X] != CPU.registers[Y])
        CPU.pc += 2;
    return CPU;
}

const LDI = (Opcode, CPU) => {
    CPU.i = Opcode & 0x0FFF;
    return CPU;
}

const JP = (Opcode, CPU) => {
    CPU.pc = (Opcode & 0x0FFF) + CPU.registers[0];
    return CPU; 
}

const RND = (Opcode, X, CPU) => {
    CPU.registers[X] = (Opcode & 0x00FF) & Math.floor(Math.random() * 256);
    return CPU;
}

const DRW = (Opcode, X, Y, CPU) => {
    let width = 8;
    let height = (Opcode & 0xF);

    CPU.registers[0xF] = 0;

    for (let row = 0; row < height; row++) {
        let sprite = CPU.memory[CPU.i + row];

        for (let col = 0; col < width; col++) {
            // If the bit (sprite) is not 0, render/erase the pixel
            if ((sprite & 0x80) > 0) {
                // If setPixel returns 1, which means a pixel was erased, set VF to 1
                setPixel(CPU.registers[Y] + row, CPU.registers[X] + col, CPU.display);
                if (shouldWrite(CPU.registers[Y] + row, CPU.registers[X] + col, CPU.display)) {
                    CPU.registers[0xF] = 1;
                }
            }

            // Shift the sprite left 1. This will move the next next col/bit of the sprite into the first position.
            // Ex. 10010000 << 1 will become 0010000
            sprite <<= 1;
        }
    }
    return CPU;

}

const SKP = (X, CPU) => {
    if(isKeyPressed(CPU.keyboard, CPU.registers[X]))
        CPU.pc += 2;
    return CPU;
}

const SKNP = (X, CPU) => {
    if(!isKeyPressed(CPU.keyboard, CPU.registers[X]))
        CPU.pc += 2;
    return CPU;
}

const LDV = (X, CPU) => {
    CPU.registers[X] = CPU.delay;
    return CPU;
}

const LDK = (X, CPU) => {
    CPU.paused = true;

    CPU.keyboard.onNextKeyPress = (key) => {
        CPU.registers[X] = key;
        CPU.paused = false;
    }
    return CPU;
}


const LDD = (X, CPU) => {
    CPU.delay = CPU.registers[X];
    return CPU;
}

const LDS = (X, CPU) => {
    CPU.soundTimer = CPU.registers[X];
    return CPU;
}

const ADDI = (X, CPU) => {
    CPU.i += CPU.registers[X];
    return CPU;
}

const LDF = (X, CPU) => {
    CPU.i = CPU.registers[X] * 5;
    return CPU;
}

const LDB = (X, CPU) => {
    CPU.memory[CPU.i] = parseInt(CPU.registers[X] / 100);
    CPU.memory[CPU.i + 1] = parseInt((CPU.registers[X] % 100) / 10);
    CPU.memory[CPU.i + 2] = parseInt(CPU.registers[X] % 10);

    return CPU;
}

const LDIX = (X, CPU) => {
    for(let RegisterIndex = 0; RegisterIndex <= X; RegisterIndex++){
        CPU.memory[CPU.i + RegisterIndex] = CPU.registers[RegisterIndex];
    }
    return CPU;
}

const LDVX = (X, CPU) => {
    for (let registerIndex = 0; registerIndex <= X; registerIndex++) {
        CPU.registers[registerIndex] = CPU.memory[CPU.i + registerIndex];
    }
    return CPU;
}