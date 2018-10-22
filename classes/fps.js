import {CanvasFont} from './font.js';

export class FPS{
    constructor(liteGlContext){
        this.currentTime = 0;
        this.lastTime = 0;
        this._fps = 0;
        this.fps = 0;
        this.liteGlContext = liteGlContext;
        this.font = liteGlContext.createFont(new CanvasFont(
            'FPS: ' + this.fps,
            {'font-size': '14px',color: 'cyan'},
            {left: 10, top: 10}
        ));
    }

    start(){
        this.currentTime = 0;
        this.lastTime = Date.now();
    }

    update(){
        this.currentTime = Date.now();
        this._fps++;

        if(this.currentTime - this.lastTime >= 1000){ // update per second
            this.fps = this._fps;
            this._fps = 0;
            this.lastTime = this.currentTime;
            this.font.setText('FPS: ' + this.fps);
            console.log(this.fps);
        }

        this.font.renderToScreen();
    }
}