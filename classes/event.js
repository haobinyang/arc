import Tools from './tools.js';

export class Event{
    constructor(canvasInstance){
        this.eventStack = [];
        this.canvasInstance = canvasInstance;

        const mouseEventList = ['click', 'contextmenu', 'dblclick', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 'mouseup']; // 鼠标事件
        const keyEventList = ['keydown', 'keypress', 'keyup']; // 键盘事件

        mouseEventList.forEach((event) => {
            this.canvasInstance.addEventListener(event, (e) => {
                this.eventStack.forEach((currentEvent) => {
                    if(currentEvent.input.type == e.type && currentEvent.input.button == e.button){
                        currentEvent.callback && currentEvent.callback(e);
                    }
                });
            });
        });

        keyEventList.forEach((event) => {
            this.canvasInstance.addEventListener(event, (e) => {
                const key = e.key.toLowerCase();

                if((e.ctrlKey && key != 'control') || (e.shiftKey && key != 'shift') || (e.altKey && key != 'alt')){ // 组合事件
                    this.eventStack.forEach((currentEvent) => {
                        if(Tools.isArray(currentEvent.input)){
                            let combinationKeys = [e.keyCode];
                            if(e.shiftKey){
                                combinationKeys.push(16); // shift
                            }
                            if(e.ctrlKey){
                                combinationKeys.push(17); // ctrl
                            }
                            if(e.altKey){
                                combinationKeys.push(18); // alt
                            }

                            currentEvent.input.forEach((input) => {
                                const index = combinationKeys.indexOf(input.keyCode);
                                if(index >= 0){
                                    if(index == 0 && input.type != e.type){
                                        return;
                                    }
                                    combinationKeys.splice(index, 1);
                                }
                            });

                            if(combinationKeys.length == 0){
                                currentEvent.callback && currentEvent.callback(e);
                            }
                        }
                    });
                }else{
                    this.eventStack.forEach((currentEvent) => {
                        if(currentEvent.input.type == e.type && currentEvent.input.keyCode == e.keyCode){
                            currentEvent.callback && currentEvent.callback(e);
                        }
                    });
                }
            });
        });
    }

    attach(input, callback){
        this.eventStack.push({
            'input': input,
            'callback': callback
        });
    }

    detach(){

    }
}

export const Input = {
    Mouse: {
        Left: {
            Click: {type: 'click', button: 0},
            DblClick: {type: 'dblclick', button: 0},
            Down: {type: 'mousedown', button: 0},
            Enter: {type: 'mouseenter', button: 0},
            Leave: {type: 'mouseleave', button: 0},
            Move: {type: 'mousemove', button: 0},
            Out: {type: 'mouseout', button: 0},
            Over: {type: 'mouseover', button: 0},
            Up: {type: 'mouseup', button: 0}
        },
        Wheel: {
            Down: {type: 'mousedown', button: 1},
            Up: {type: 'mouseup', button: 1}
        },
        Right: {
            Menu: {type: 'contextmenu', button: 2},
            Down: {type: 'mousedown', button: 2},
            Up: {type: 'mouseup', button: 2}
        }
    },
    Keyboard: (function(){
        const keyCodes = {'Backspace':8, 'Tab':9, 'Enter':13, 'Shift':16, 'Ctrl':17, 'Alt':18,
            'Pause/Break':19, 'CapsLock':20, 'Esc':27, 'Space':32, 'PgUp':33, 'PgDn':34,
            'End':35, 'Home':36, 'Left':37, 'Up':38, 'Right':39, 'Down':40, 'Insert':45, 'Delete':46,
            '0':48, '1':49, '2':50, '3':51, '4':52, '5':53, '6':54, '7':55, '8':56, '9':57,
            'A':65, 'B':66, 'C':67, 'D':68, 'E':69, 'F':70, 'G':71, 'H':72, 'I':73, 'J':74,
            'K':75, 'L':76, 'M':77, 'N':78, 'O':79, 'P':80, 'Q':81, 'R':82, 'S':83, 'T':84,
            'U':85, 'V':86, 'W':87, 'X':88, 'Y':89, 'Z':90,
            'LeftWindow':91, 'RightWindow':92, 'Select':93,
            'NumPad0':96, 'NumPad1':97, 'NumPad2':98, 'NumPad3':99, 'NumPad4':100, 'NumPad5':101, 'NumPad6':102, 'NumPad7':103, 'NumPad8':104, 'NumPad9':105,
            'Multiply':106, 'Add':107, 'Subtract':109, 'DecimalPoint':110, 'Divide':111,
            'F1':112, 'F2':113, 'F3':114, 'F4':115, 'F5':116, 'F6':117, 'F7':118, 'F8':119, 'F9':120, 'F10':121, 'F11':122, 'F12':123,
            'NumLock':144, 'ScrollLock':145, 'Semicolon':186, 'Equal':187, 'Comma':188, 'Dash':189, 'Period':190,
            'ForwardSlash':191, 'GraveAccent':192, 'OpenBracket':219, 'BackSlash':220, 'CloseBracket':221, 'SingleQuote':222
        };

        let result = {};

        Object.keys(keyCodes).forEach((keyCode) => {
            result[keyCode] = {
                Down: {type: 'keydown', keyCode: keyCodes[keyCode]},
                Press: {type: 'keypress', keyCode: keyCodes[keyCode]},
                Up: {type: 'keyup', keyCode: keyCodes[keyCode]}
            };
        });

        return result;
    }())
};