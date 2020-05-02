//Made by Zachary Mitchell in 2019!
/*This work is licensed under the Creative Commons Attribution 4.0 International License.
To view a copy of this license, visit http://creativecommons.org/licenses/by/4.0/
or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.*/

/*Writing this right after everything about the wheel wrapped up!
When the wheel is done doing it's thing, the user gets an opportunity for some euphoria - confetti!
This file will focus soley on that.*/

//Dependencies: colorTools.js,colorPresets.js,generalFuncs.js,simpleAudio.js
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
            ctx.font ='bold '+ (15 * sizeChange)+'px Arial';
            ctx.fillStyle='rgb('+this.currColor[0]+','+this.currColor[1]+','+this.currColor[2]+')';
            ctx.globalAlpha = this.colorPercent * .01;
            ctx.fillText('Press spacebar to throw confetti!',w*.15,h*.9);
        }
    },

    //The conductor for thowing confetti. Due to the assets being loaded asynchronously, they are a separate argument and will need to be provided.
    confettiObj:function(srcCanvas,assets = []){
        this.srcCanvas = srcCanvas;
        this.assets = assets;
        this.currInterval = undefined;
        this.currAnimation = undefined;

        //Exactly what you might expect.
        this.throwUpwards = function*(frameRate = 16.6, pieceCount = 30, duration=1000){
            var ctx = srcCanvas.getContext('2d'),
                pieceArray = [];
            //Randomly get colors:
            for(var i = 0;i < pieceCount;i++)
                pieceArray.push(this.assets[Math.floor(Math.random()*this.assets.length)]);

            //each confetti piece will have size, target location, and rotation speed randomly determined:
            var sizes = pieceArray.map(()=>40+(Math.random()*60)), //Used for depth perception. Won't get smaller than you can see.
                endPoint = pieceArray.map(()=>10+(Math.random()*40)), //Confetti isn't going higher than half of the screen.
                rotationSpeed = pieceArray.map(()=>Math.random()*25), //out of 360, the max speed is almost a 3rd of a rotation XP (a.k.a REALLY fast)
                horAxis = pieceArray.map(Math.random); //Horizontal axis position. 0 to 1 decimal

                //Generate swinging numbers, in other words, create a slow drag effect.
            var frameCount = Math.floor(duration / frameRate),
                endSwing = endPoint.map(e=>swing(e,frameCount).reverse()),
                percentSum = [], //Keep track of the total percentage each confetti slice is on.
                w = this.srcCanvas.width,
                h = this.srcCanvas.height;

            ctx.globalAlpha = 1;
            //Commense animation!
            for(var i = 0; i < frameCount;i++){
                ctx.clearRect(0,0,w,h);
                //if 50% of the animation is done, fade
                if( i > frameCount*.5){
                    ctx.globalAlpha = (100 / (frameCount * .5)) * (frameCount - i) * .01;
                }

                //Each confetti piece is drawn:
                for(var j = 0; j < pieceArray.length;j++){
                    if(!percentSum[j]) percentSum[j] = 0;
                    percentSum[j]+=endSwing[j][i];
                    ctx.translate(w * horAxis[j],h - (h * (percentSum[j] * .01)));

                    var currRotation = rotationSpeed[j] * (i+1);
                    ctx.rotate( currRotation * (Math.PI/180));

                    var newSize = [pieceArray[j].width * (sizes[j] * .01),pieceArray[j].height * (sizes[j] * .01)]; //indexes -> 0 == width, 1 == height
                    //Draw the thing; aligning the axis by half the image w/h causes it to be centered. If both x and y are 0, it rotates funny.
                    ctx.drawImage(
                        pieceArray[j],
                        0 - (newSize[0]/2),
                        0 - (newSize[1]/2),
                        newSize[0],
                        newSize[1]
                    );

                    //Cleanup:
                    ctx.rotate(0-currRotation * (Math.PI/180));
                    ctx.translate(0-(w * horAxis[j]),0 - (h - (h * (percentSum[j] * .01))));
                }

                //Stop this function until the waiting time is done
                setTimeout(()=>this.currAnimation.next(),frameRate);
                yield;
            }
            //suppressing a bug :( (Screen doesn't completely fade upon finishing)
            ctx.clearRect(0,0,w,h);
        }
    },

    /*The main way one would invoke everything at once. The following occurrs when this is used:
        Event listener is added to body of the DOM (attaching to canvas doesn't seem to work :/) that listens to spacebar
        Prompt is created and displayed on screen
        when spacebar is pressed, CONFETTI! (whee!)
    */
    confettiInstance:function(srcCanvas = document.createElement('canvas'), assets = [], sfx = undefined, frameRate = 16.6){
        this.prompt = new confetti.prompt(srcCanvas);
        this.confettiObj = new confetti.confettiObj(srcCanvas, assets);
        this.frameRate = frameRate;
        this.sfx = sfx;
        this.isActive = false;

        //To interface with the DOM, we need to keep track of the functions in use.
        this.bodyListener = e=>{

            if(e.code == 'Space'){
                e.preventDefault()
                this.deactivate();
                if(sfx) simpleAudio.play(sfx);
                this.confettiObj.currAnimation = this.confettiObj.throwUpwards(this.frameRate);
                this.confettiObj.currAnimation.next();
            }

        }

        this.activate = function(){
            document.body.addEventListener('keydown',this.bodyListener);
            this.prompt.colorPercent = 0;
                this.prompt.breatheIn = true;

                this.prompt.currInterval = setInterval(()=>{
                    this.prompt.breathe(1 * (frameRate/16.6) );
                    this.prompt.render();

                },this.frameRate);
            this.isActive = true;
        }

        this.deactivate = function(){
            document.body.removeEventListener('keydown',this.bodyListener);
            clearInterval(this.prompt.currInterval);
            var canvasElement = this.prompt.primaryCanvas;
            canvasElement.getContext('2d').clearRect(0,0,canvasElement.width,canvasElement.height);
            this.isActive = false;
        }

    }

}