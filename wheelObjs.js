//Made by Zachary Mitchell in 2019!
//The core obejcts and helpful functions for creating a wheel
//General precaution, at least 95% of this code doesn't rely on width, due to most components being even both ways, it's taken out of the equation most of the time.

var wheelObjs = {

    wheelPiece:function(wh,fraction=3,color=[230,230,230]){
    
        this.bitmap = document.createElement('canvas');
        this.wh = wh;
        //This should accept an rgb array:
        this.color = color;
        this.fraction = fraction;
        this.render = function(){
            this.bitmap.width = wh;
            this.bitmap.height = wh/1.9;
            var ctx = this.bitmap.getContext("2d");
    
            var ridgeAvoid = Math.floor( (wh/2) * .967 );
    
            //Setup fill style and stroke:
            {
                let resultfill = '';
                let resultStroke = '';
                let start = true;
                
                for(var i of this.color){
                    resultfill+=(start?'rgb(':',')+i;
                    resultStroke+=(start?'rgb(':',')+Math.floor((i * 1.5));
                    start = false;
                }
                ctx.fillStyle=resultfill+')';
                ctx.strokeStyle=resultStroke+')';
            }

            ctx.lineWidth=10;
            var magicEquation = (2 - (2 / fraction) );
            //(magicEquation - (magicEquation/360 * -1))
            ctx.beginPath();
            ctx.moveTo(wh/2,wh/2);
            ctx.lineTo(wh,wh/2);
            ctx.arc(wh/2,wh/2,ridgeAvoid,0, magicEquation * Math.PI,true);
            ctx.lineTo(wh/2,wh/2);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
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
        this.drawPieces = ()=>this.pieces.forEach(e=>e.render()); //Should only be done when needed.
    
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
            ctx.rotate((360 * this.percent * .01) * Math.PI / 180);
            ctx.drawImage(this.wheelCanvas,0 - (wh/2), 0 - (wh/2));
    
            //Cleanup for next time:
            ctx.rotate((360 * (0 - this.percent) * .01) * Math.PI / 180);
            ctx.translate((0 - (wh/2)),(0 - (wh/2)));
        }
    
        this.getCurrentPiece = function(){
            return Math.floor(this.pieces.length * (this.percent * .01));
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

        this.configure = function(canvasSize = this.canvasSize, count = this.count){
            var ctx = this.canvas.getContext('2d');
            this.canvas.width = this.canvas.height = canvasSize;
            this.count = count;

            ctx.translate(canvasSize / 2,canvasSize / 2);
            ctx.fillStyle='#000000';
            for(var i = 0; i<count;i++){
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
        var netHeight = wheelHeight * 1.166;

        if(canvasSrc.height != netHeight){
            canvasSrc.height = netHeight;
            canvasSrc.width = netHeight;
        }

        ctx.clearRect(0,0,netHeight,netHeight);

        ctx.beginPath();
        ctx.fillStyle='lightgray';
        ctx.moveTo(netHeight * .25, 350);

        ctx.lineTo(netHeight * .65, 350);
        ctx.lineTo(netHeight * .45, 350*.5);
        ctx.lineTo(netHeight * .25, 350);
        ctx.fill();
        ctx.closePath();

        return canvasSrc;
    },

    //The image in the center of the wheel. Probably gonna put some of the smilies from my site in here ;P
    //imgElement can be either an image or a canvas.
    centerAxel:function(canvasHeight,imgElement){
        this.size = canvasHeight
        this.mainCanvas = document.createElement('canvas');
        this.mainCanvas.height = canvasHeight;
        this.mainCanvas.width = canvasHeight;

        this.spinCanvas = document.createElement('canvas');
        this.spinCanvas.width = canvasHeight;
        this.spinCanvas.height = canvasHeight;
        this.coreImage = imgElement;

        this.renderMainCanvas = function(size = this.size,imgElement = this.coreImage){
            if(size != this.size){
                this.mainCanvas.width = size;
                this.mainCanvas.height = size;
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
            ctx.clearRect(0,0,this.size,this.size);

            //Setup for rotating
            ctx.translate(this.size/2,this.size/2);
            ctx.rotate((360 * percent * .01 ) * Math.PI / 180 );

            ctx.drawImage(this.mainCanvas,0-(this.size/2),0-(this.size/2));

            //Cleanup
            ctx.rotate((360 * ((0 - percent) * .01) ) * Math.PI / 180 );
            ctx.translate(0 - (this.size/2), 0 - (this.size/2));
        }
    },

    tickerTriangle:function(){
        this.mainCanvas = document.createElement('canvas');
        this.spinCanvas = document.createElement('canvas');

        this.render = function(height){
            if(this.mainCanvas.height != height){
                this.mainCanvas.width = width;
                this.mainCanvas.height = height;
            }
            
                var ctx = mainCanvas.getContext('2d');

                ctx.beginPath();
                ctx.fillStyle='#000';
                ctx.moveTo(height * .45, 5);
    
                ctx.lineTo(height * .55, 5);
                ctx.lineTo(height * .5,height*.2);
                ctx.lineTo(height * .45,5);
                ctx.fill();
                ctx.closePath();
        }

        this.renderTick = function(percent = 0,reverse = false){
            if(this.spinCanvas.height != this.mainCanvas.height){
                this.spinCanvas.width = this.mainCanvas.width;
                this.spinCanvas.height = this.mainCanvas.height;
            }
            var ctx = spinCanvas.getContext('2d');
            ctx.translate(0,this.spinCanvas.height/2);
            //Ok... now we just need to emulate the triangle going across a peg
        }

    },

    //The core object that manages all the objects listed above. Whenever the wheel rotates, so will everything else. sames goes for resolution, piece updates, etc.
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

        //Unlike the other objects above, this is an object that will constantly be animating. nevertheless, we want to warm up the assets before drawing.
        this.renderAssets = function(height=300){
            this.coreCanvas.height = height;
            this.wheelGroup.drawPieces();
            this.wheelGroup.renderWheel();
            this.wheelGroup.renderSpin();
            this.pegSet.configure(height);
            wheelObjs.makeTriangleMount(height,this.mount);
            this.centerAxel.renderMainCanvas(height / 3);
        }

        this.draw = function(percent){
            var ctx = this.coreCanvas.getContext('2d');
            ctx.clearRect(0,0,this.coreCanvas.width,this.coreCanvas.height);
            this.wheelGroup.draw(percent);

            //Overlay the other things:
            this.pegSet.rotate(percent);
            ctx.drawImage(this.pegSet.rotateCanvas,0,0);
            ctx.drawImage(this.mount,0,0);

            this.centerAxel.renderSpin(percent);
            ctx.drawImage(this.centerAxel.spinCanvas,this.coreCanvas.height/2.75,this.coreCanvas.height/2.75);
        }

        this.renderAssets(wheelHeight);
    }


}

function setObjProperties(targetObj,appendage){
    for(var i in appendage)
        targetObj[i] = appendage[i];
    return targetObj;
}