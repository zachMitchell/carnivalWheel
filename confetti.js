//Made by Zachary Mitchell in 2019!
/*Writing this right after everything about the wheel wrapped up!
When the wheel is done doing it's thing, the user gets an opportunity for some euphoria - confetti!
This file will focus soley on that.*/

//Dependencies: colorTools.js,colorPresets.js
var confetti = {
    prompt:function(primaryCanvas = document.createElement('canvas')){
        this.currColor;
        this.colorPercent = 0;
        this.primaryCanvas = primaryCanvas;
        this.currInterval;

        this.breathe = function(){
            if(colorPercent === 0){
                this.currColor = colorTools.percentToColor(
                    Math.floor(Math.random()*colorPresets.rgb.length),
                    false,1,colorTools.hex2RgbArray(colorPresets.rgb));
            }
            
        }

    }
}