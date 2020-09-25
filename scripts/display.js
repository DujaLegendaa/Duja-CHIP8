export class Display {
    constructor(Col, Row, Scale) {
        this.col = Col;
        this.row = Row;
        this.scale = Scale;
        this.scaledY = Col * Scale;
        this.scaledX = Row * Scale;
        this.pixelArr = new Array(Col * Row);
        this.canvas = document.querySelector("canvas");
        this.canvas.width = this.scaledY;
        this.canvas.height = this.scaledX;
        this.ctx = this.canvas.getContext("2d");
    }
}

const wrapAround = (X, Y, Display) => {
    if(Y >= Display.col)
        Y -= Display.col;
    else if (Y < 0)
        Y += Display.col;
    
    if (X >= Display.row)
        X -= Display.row;
    else if (X < 0)
        X += Display.row;
    
    return [X, Y];
}

const setPixel = (X, Y, Display) => {
    let [NX, NY] = wrapAround(X, Y, Display);
    Display.pixelArr[NX * Display.col + NY] ^= 1;

    return Display.pixelArr;
}

const shouldWrite = (X, Y, Display) => {
    let [NX, NY] = wrapAround(X, Y, Display);
    return !Display.pixelArr[NX * Display.row + NY];
}

export const render = (Display) => {
    // Poboljsati clear
    Display.ctx.clearRect(0, 0, Display.canvas.width, Display.canvas.height);

    drawFrame(Display);
}

const drawFrame = (Display, I = 0) => {
    if (I == (Display.row * Display.col))
        return 
    let Y = Math.floor(I / Display.col) * Display.scale;
    let X = (I % Display.col) * Display.scale;

    if (Display.pixelArr[I] == 1){
        Display.ctx.fillStyle = "#000";
        console.log(X, Y, I);
        Display.ctx.fillRect(X, Y, Display.scale, Display.scale);
    }
    drawFrame(Display, I + 1);
}

const fullClear = (Display) => {
    return new Array(Display.row * Display.col);
}

export const testRender = (Display) => {
    setPixel(5, 0, Display);
    setPixel(1, 1, Display);
    setPixel(2, 2, Display);
    setPixel(15, 31, Display);
    console.log(Display.pixelArr);
}