//Made by Zachary Mitchell in 2019!
/*This work is licensed under the Creative Commons Attribution 4.0 International License.
To view a copy of this license, visit http://creativecommons.org/licenses/by/4.0/
or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.*/

//The core obejcts and helpful functions for creating a wheel
//General precaution, at least 95% of this code doesn't rely on width, due to most components being even both ways, it's taken out of the equation most of the time.

var wheelObjs = {

    wheelPiece:function(wh,fraction=3,color=[230,230,230],text=''){
        this.bitmap = document.createElement('canvas');
        this.wh = wh;
        //This should accept an rgb array:
        this.color = color;
        this.fraction = fraction;
        this.text = text;
        this.render = function(highlight = false){
            this.bitmap.width = this.wh;
            this.bitmap.height = this.wh/1.9;
            var ctx = this.bitmap.getContext("2d");
    
            var ridgeAvoid = Math.floor( (this.wh/2) * .967 );
    
            //Setup fill style and stroke:
            {
                let resultfill = '';
                let resultStroke = '';
                let start = true;
                /*Ideally, we want the stroke color to be a faded version of the main color
                Using this as our reference, we can find out if the color is too bright
                and have text still readable (and make the wheel more stylish)*/
                let brightColor = false;

                //Highlight yellow, this piece is a winner!
                if(highlight) resultStroke = resultfill = 'rgb(255,255,0';

                else{
                    for(var i of this.color){
                        //Intentionally left the comparison smaller than the actual brightness to keep vibrant colors
                        if(i*1.25 > 255){
                            brightColor = true;
                            break;
                        }
                    }

                    for(var i of this.color){
                        resultfill+=(start?'rgb(':',')+i;
                        resultStroke+=(start?'rgb(':',')+Math.floor(i*(brightColor?.75:1.5));
                        start = false;
                    }
                }
                //Complete the string for stroke and fill; initialize both.
                ctx.fillStyle=resultfill+')';
                ctx.strokeStyle=resultStroke+')';
            }

            //Using default height (300) as unit of measurement here
            var strokeThickness = this.fraction < 12 ? 300 : 25*this.fraction
            ctx.lineWidth=(10 / strokeThickness) * this.wh;
            var magicEquation = (2 - (2 / this.fraction) );
            //(magicEquation - (magicEquation/360 * -1))
            ctx.beginPath();
            ctx.moveTo(this.wh/2,this.wh/2);
            // ctx.lineTo(this.wh,this.wh/2);
            ctx.arc(this.wh/2,this.wh/2,ridgeAvoid,0, magicEquation * Math.PI,true);
            ctx.lineTo(this.wh/2,this.wh/2);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();

            //Set the text:
            var sizePercent = .1;
            var renderText = this.text;
            if(this.text.length > 5){
                sizePercent/=2;
                renderText = this.text.substr(0,12);
            }

            //The highlight will be to brilliant to see text :')
            if(!highlight){
                ctx.font=(this.wh * sizePercent)+'px Arial';
                ctx.fillStyle = ctx.strokeStyle;
                ctx.translate((this.wh/2)*1.25,(this.wh/2)*.95);
                //We're using a negative number here because the rotation system is counter clockwise
                ctx.rotate((0- (360 / this.fraction / 2)) * Math.PI/180);
                ctx.fillText(renderText,this.wh*.05,0);
    
                //Reset text:
                ctx.rotate( (360 / this.fraction / 2) * Math.PI/180);
                ctx.translate(0- (this.wh/2), 0- (this.wh/2) );
            }
        }
    
    },
    
    //Responsible for maintaining each piece. Each piece is rotated based on it's size and how many pieces are on the wheel.
    //Pieces can be either an existing array of pieces, or a number indicating the number to generate.
    wheelGroup:function(masterCanvas = document.createElement('canvas'),pieces = 3,setColor=[]){
        this.masterCanvas = masterCanvas; //Where everything will overlay.
        this.wheelCanvas = setObjProperties(document.createElement('canvas'),{
            width:this.masterCanvas.height,
            height:this.masterCanvas.height
        });// Where the wheel will render
        this.spinCanvas = setObjProperties(document.createElement('canvas'),{
           width:this.wheelCanvas.width,
           height:this.wheelCanvas.height 
        });
    
        this.pieces = typeof pieces == "number"?wheelObjs.generatePieces(this.masterCanvas.height,pieces,setColor):pieces;
        this.percent = 0; //Where the wheel actually is.

        this.setSize = function(size){
            this.wheelCanvas.width = 
            this.wheelCanvas.height = 
            this.spinCanvas.width = 
            this.spinCanvas.height = size;
        }

        //If lightUp is a number, light up that piece, otherwise assume it's an array and see if a piece in the index should be lit up.
        this.drawPieces = function(lightUp){
            for(var i = 0;i<this.pieces.length;i++){
                this.pieces[i].render((typeof(lightUp) == "number") && lightUp === i || typeof(lightUp) == "object" && lightUp[i]);
            }
         } //Should only be done when needed.
    
        this.renderWheel = function(){
            var ctx = this.wheelCanvas.getContext('2d');
            var wh = this.wheelCanvas.height;
            //Offset the canvas to rotate pieces into place:
            ctx.clearRect(0,0,wh,wh);
            ctx.translate(wh/2,wh/2);
            for(var i of this.pieces){
                //Have each piece rotated to stick to the other one.
                ctx.drawImage(i.bitmap,0 - (wh/2), 0 - (wh/2) );
                ctx.rotate((360 / this.pieces.length) * Math.PI / 180);
            }
            ctx.translate((0 - (wh/2)),(0 - (wh/2)));
        },
    
        this.renderSpin = function(){
            var ctx = this.spinCanvas.getContext('2d');
            var wh = this.spinCanvas.height;
            ctx.clearRect(0,0,wh,wh);
            ctx.translate(wh/2,wh/2);
            ctx.rotate(360 * (this.percent - 25) * .01 * Math.PI / 180); //subtract 90 degrees because the wheel is rendered sideways
            ctx.drawImage(this.wheelCanvas,0 - (wh/2), 0 - (wh/2));
    
            //Cleanup for next time:
            ctx.rotate((360 * (0 - (this.percent - 25)) * .01) * Math.PI / 180);
            ctx.translate((0 - (wh/2)),(0 - (wh/2)));
        }
    
        //It appears that the way the wheel is aligned is different then how it spins... therefore we need to invert this
        this.getCurrentPiece = function(offset = this.pieces.length-1){
            //This is a little sloppy... but does the job
            var result = Math.ceil((100 - this.percent) / (100 / (this.pieces.length)))-1 -offset;
            //Offset causes the result to be slightly different on purpose.
            if(result < 0) result = this.pieces.length + result;
            return result;
        }
    
        this.draw = function(percent){ //Draws all layers, can even update percentage
            var lastPercent = this.percent;
            if(percent !== undefined)
                this.percent = percent;
            
            var ctx = masterCanvas.getContext('2d');
            //Draw wheel
            if(lastPercent!=this.percent)
                this.renderSpin(percent);
            ctx.drawImage(this.spinCanvas,0,0);
            //draw accessories
        }
    
    },
    
    //A dumb function that I can use to debug stuff :P
    generatePieces:function(wh,count,colors=[]){
        //By default, an undefined index triggers the default value in JS arguments.
        var smoothColors = [];
        if(colors.length)
            smoothColors = colorTools.generateColors(colors,count);

        var resultArray = [];
        for(var i = 0;i<count;i++)
            resultArray.push(new this.wheelPiece(wh,count,smoothColors[i]));
        return resultArray;
    },

    pegSet:function(canvasSize = 300, count = 20){
        this.canvasSize = canvasSize;
        this.canvas = document.createElement('canvas');
        this.rotateCanvas = document.createElement('canvas');
        this.count = count;
        this.rotatePercent = 0;
        this.lightPattern=[];
        this.configure = function(canvasSize = this.canvasSize, count = this.count){
            var ctx = this.canvas.getContext('2d');
            this.canvas.width = this.canvas.height = this.canvasSize = canvasSize;
            this.count = count;
            ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

            ctx.translate(canvasSize / 2,canvasSize / 2);
            for(var i = 0; i<count;i++){
                ctx.fillStyle = ctx.strokeStyle = this.lightPattern[i]?'#FFFF00':'#000000'; //Light up the peg if it's address in lightPattern is true.
                ctx.beginPath();
                ctx.arc(canvasSize / 2.2,0, canvasSize / 60 ,0,2*Math.PI);
                ctx.stroke();
                ctx.fill();
                ctx.closePath();
                ctx.rotate((360 / count) * Math.PI / 180);
            }
            ctx.translate(0-(canvasSize / 2),0-(canvasSize / 2));
        }

        this.rotate = function(percent = 0){
            var ctx = this.rotateCanvas.getContext('2d');
            var wh = this.rotateCanvas.width = this.rotateCanvas.height = this.canvas.height; //oi :P
            this.rotatePercent = percent;
            ctx.clearRect(0,0,wh,wh);
            ctx.translate(wh/2,wh/2);
            ctx.rotate(360 * (percent * .01) * Math.PI / 180);
            ctx.drawImage(this.canvas,0 - (wh/2),0 - (wh/2));

            //Cleanup:
            ctx.translate(0 - (wh/2),0 - (wh/2));
            ctx.rotate( 360 *  ( (0 - percent) * .01 ) * Math.PI / 180);
        }

        //We poll this value to see if we either approach a peg, or go past one. It is offset by 50% to determine where it is after we hit it.
        this.detectPoint = (percent = this.rotatePercent, points = this.count)=>{
            var fullPercent = 100 / points;
            return 100/fullPercent * (((fullPercent/2) + percent) % fullPercent);
        }
    },

    //The triangle mount is what holds the wheel. The wheelheight is the reference to how large the final product will be (16% larger canvas)
    makeTriangleMount:function(wheelHeight = 300, canvasSrc = document.createElement('canvas')){
        var ctx = canvasSrc.getContext('2d');

        if(canvasSrc.height != wheelHeight){
            canvasSrc.height = wheelHeight;
            canvasSrc.width = wheelHeight;
        }

        ctx.clearRect(0,0,wheelHeight,wheelHeight);

        ctx.beginPath();
        ctx.fillStyle='lightgray';
        ctx.moveTo(wheelHeight , wheelHeight);

        ctx.lineTo(wheelHeight * .70, wheelHeight);
        ctx.lineTo(wheelHeight * .5, wheelHeight*.5);
        ctx.lineTo(wheelHeight * .3, wheelHeight);
        ctx.fill();
        ctx.closePath();

        return canvasSrc;
    },

    //The image in the center of the wheel. Probably gonna put some of the smilies from my site in here ;P
    //imgElement can be either an image or a canvas.
    centerAxel:function(canvasHeight,imgElement,spinCanvasSize = 1.5){
        this.size = canvasHeight;
        this.mainCanvas = document.createElement('canvas');
        this.mainCanvas.height = canvasHeight;
        this.mainCanvas.width = canvasHeight;

        this.spinningSize = spinCanvasSize;
        this.spinCanvas = document.createElement('canvas');
        this.spinCanvas.width = canvasHeight * this.spinningSize;
        this.spinCanvas.height = canvasHeight * this.spinningSize;
        this.coreImage = imgElement;

        this.renderMainCanvas = function(size = this.size,imgElement = this.coreImage){
            if(size != this.size){
                this.mainCanvas.width =
                this.mainCanvas.height = size;
                
                //spinCanvas needs a size adjustment because of this:
                this.spinCanvas.width = 
                this.spinCanvas.height = size * this.spinningSize;

                this.size = size;
            }
            var ctx = this.mainCanvas.getContext('2d');
            ctx.clearRect(0,0,size,size);

            //If there's no center, make one:
            if(!imgElement){
                if(this.coreImage) imgElement = this.coreImage;
                else{
                    imgElement = this.coreImage = document.createElement('canvas');
                    imgElement.width = size;
                    imgElement.height = size;

                    var imgCtx = imgElement.getContext('2d');
                    imgCtx.beginPath();
                    imgCtx.fillStyle = 'rgb(128,128,128)';
                    imgCtx.arc(size/2,size/2,size/2,0,2*Math.PI);
                    imgCtx.fill();
                    imgCtx.closePath();
                }
            }
            // console.log([imgElement,imgElement.height]);

            //resize the image depending on whether or not width or height is larger:
            var newWidth,newHeight;

            if(imgElement.width > imgElement.height){
                newWidth = size;
                newHeight = imgElement.height * (1 / imgElement.width * size);
            }
            else{
                newHeight = size;
                newWidth = imgElement.width * (1 / imgElement.height * size);
            }
                
            ctx.drawImage(imgElement,0,0,newWidth,newHeight);
        }

        this.renderSpin = function(percent = 0){
            var ctx = this.spinCanvas.getContext('2d');
            var spinningAdjustment = this.size * this.spinningSize;
            ctx.clearRect(0,0,spinningAdjustment,spinningAdjustment);

            //Setup for rotating
            ctx.translate(spinningAdjustment/2,spinningAdjustment/2);
            ctx.rotate((360 * percent * .01 ) * Math.PI / 180 );

            ctx.drawImage(this.mainCanvas,0-(this.size/2),0-(this.size/2));

            //Cleanup
            ctx.rotate((360 * ((0 - percent) * .01) ) * Math.PI / 180 );
            ctx.translate(0 - (spinningAdjustment/2), 0 - (spinningAdjustment/2));
        }
    },

    tickerTriangle:function(){
        this.mainCanvas = document.createElement('canvas');
        this.spinCanvas = document.createElement('canvas');

        this.render = function(height){
            if(height && this.mainCanvas.height != height){
                this.mainCanvas.width = height;
                this.mainCanvas.height = height;
            }
            
                var ctx = this.mainCanvas.getContext('2d');

                ctx.beginPath();
                ctx.fillStyle='#000';
                ctx.moveTo(height * .475, 0);
    
                ctx.lineTo(height * .525, 0);
                ctx.lineTo(height * .5,height*.1);
                ctx.lineTo(height * .475,0);
                ctx.fill();
                ctx.closePath();
        }

        this.renderTick = function(percent = 0,reverse = false){
            if(this.spinCanvas.height != this.mainCanvas.height){
                this.spinCanvas.width = this.mainCanvas.width;
                this.spinCanvas.height = this.mainCanvas.height;
            }
            var ctx = this.spinCanvas.getContext('2d');
            ctx.clearRect(0,0,this.spinCanvas.height,this.spinCanvas.height);
            ctx.translate(this.spinCanvas.height/2,0);
            //Ok... now we just need to emulate the triangle going across a peg
            if(percent > 50){
                percent = 50 - (percent-50);
            }
            var gloriousMath = 360 * (percent * .25 * .01);
            //If the wheel is going the normal direction, we just go backwards in rotation.
            if(!reverse) gloriousMath = 0 - gloriousMath;

            ctx.rotate(gloriousMath * Math.PI / 180);
            ctx.drawImage(this.mainCanvas,0-(this.spinCanvas.height/2),0);

            //Reset:
            ctx.rotate(0-gloriousMath * Math.PI / 180);
            ctx.translate(0-(this.spinCanvas.height/2),0);
        }

    },

    /*The core object that manages all the objects listed above. 
    Whenever the wheel rotates, so will everything else.
    Same goes for resolution, piece updates, etc.*/
    wheel:function(wheelHeight=300,pieces=3,axelImg,colors=[]){
        //Initialize!
        this.coreCanvas = document.createElement('canvas');
        this.coreCanvas.height = wheelHeight;
        this.coreCanvas.width = wheelHeight

        //Probably a bad design choice, but the wheel group is taking care of coreCanvas... :/
        this.wheelGroup = new wheelObjs.wheelGroup(this.coreCanvas,pieces,colors);
        this.pegSet = new wheelObjs.pegSet(wheelHeight);
        this.mount = document.createElement('canvas');
        this.centerAxel = new wheelObjs.centerAxel(wheelHeight / 3,axelImg);
        this.tickerTriangle = new wheelObjs.tickerTriangle();

        //Unlike the other objects above, this is an object that will constantly be animating. nevertheless, we want to warm up the assets before drawing.
        this.renderAssets = function(height=300){
            this.coreCanvas.height = this.coreCanvas.width = height;
            for(var i of this.wheelGroup.pieces) i.wh = height;
            this.wheelGroup.drawPieces();
            this.wheelGroup.setSize(height);
            this.wheelGroup.renderWheel();
            this.wheelGroup.renderSpin();
            this.pegSet.configure(height);
            wheelObjs.makeTriangleMount(height,this.mount);
            this.centerAxel.renderMainCanvas(height / 3);
            this.tickerTriangle.render(height);
        }

        this.draw = function(percent,reverse = false,lightUp){
            //Trick -> Didn't intend on programming this, but inserting anything other than a number or an object will effectively run this and clear any lights.
            if(typeof(lightUp)!="undefined"){
                this.wheelGroup.drawPieces(lightUp);
                this.wheelGroup.renderWheel();
                this.wheelGroup.renderSpin();
            }
            var ctx = this.coreCanvas.getContext('2d');
            ctx.clearRect(0,0,this.coreCanvas.width,this.coreCanvas.height);
            this.wheelGroup.draw(percent);

            //Overlay the other things:
            this.pegSet.rotate(percent);
            ctx.drawImage(this.pegSet.rotateCanvas,0,0);
            ctx.drawImage(this.mount,0,0);
            this.tickerTriangle.renderTick(this.pegSet.detectPoint(),reverse);
            ctx.drawImage(this.tickerTriangle.spinCanvas,0,0);

            this.centerAxel.renderSpin(percent);
            ctx.drawImage(this.centerAxel.spinCanvas,this.coreCanvas.height/(2.5+this.centerAxel.spinningSize),this.coreCanvas.height/(2.5+this.centerAxel.spinningSize));

        }

        this.renderAssets(wheelHeight);
    }


}