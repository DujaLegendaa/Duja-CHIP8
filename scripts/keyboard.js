export class Keyboard {
    constructor(){
        this.keyMap = {
            48:  0x0,
            49:  0x1,
            87: 0x2,
            51:  0x3,
            90: 0xA,
            65:  0x4,
            53:  0x5,
            68: 0x6,
            88: 0xB,
            55:  0x7,
            83: 0x8,
            57:  0x9,
            67:  0xC,
            86: 0xD,
            66:  0xE,
            78: 0xF
        }

        this.keysPressed = new Array(17);

        this.onNextKeyPress = null;

        window.addEventListener("keydown", this.onKeyDown.bind(this), false);
        window.addEventListener("keyup", this.onKeyUp.bind(this), false);
    }

    onKeyDown(event) {
        let Key = this.keyMap[event.which];
        this.keysPressed[Key] = true;

        if (this.onNextKeyPress !== null && Key) {
            this.onNextKeyPress(parseInt(Key));
            this.onNextKeyPress = null;
        }
    }

    onKeyUp(event) {
        let Key = this.keyMap[event.which];
        this.keysPressed[Key] = false;
    }

}

export const isKeyPressed = (Keyboard, KeyCode) => {
    return Keyboard.keysPressed[KeyCode];
}

