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
        this.breatheIn = true;

        //Create a new color if it doesn't exist, then slowly increment to 100 and back to 0.
        this.breathe = function(incrementBy = 1){
            if(this.colorPercent <= 0){
                this.currColor = colorTools.percentToColor(
                    Math.floor(Math.random()*100),
                    false,1,colorTools.hex2RgbArray(colorPresets.rgb));
            }
            this.colorPercent+= this.breatheIn?incrementBy:0-incrementBy;
            if(this.colorPercent >= 100){
                this.colorPercent = 100;
                this.breatheIn = false;
            }
            else if(this.colorPercent <=0){
                this.colorPercent = 0;
                this.breatheIn = true;
            }

        }
        this.render = function(){
            var ctx = this.primaryCanvas.getContext('2d');
            var w = this.primaryCanvas.width,h = this.primaryCanvas.height;
            //Based on default width of canvas:
            var sizeChange = (1 / 300) * w;
            ctx.clearRect(0,0,w,h);
            ctx.font = 15 * sizeChange+'px Arial';
            ctx.fillStyle='rgb('+this.currColor[0]+','+this.currColor[1]+','+this.currColor[2]+')';
            ctx.globalAlpha = this.colorPercent * .01;
            ctx.fillText('Press spacebar to throw confetti!',w*.15,h*.9);
        }
    }
}