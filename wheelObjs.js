//Made by Zachary Mitchell in 2019!
//The core obejcts and helpful functions for creating a wheel

var wheelObjs = {

    wheelPiece:function(wh,fraction=3,color=[230,230,230]){
    
        this.bitmap = document.createElement('canvas');
        this.wh = wh;
        //This should accept an rgb array:
        this.color = color;
        this.fraction = fraction;
        this.render = function(){
            this.bitmap.width = wh;
            this.bitmap.height = Math.floor(wh/2);
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
    
            // console.log([ridgeAvoid,wh]);
            ctx.lineWidth=7.5;
    
            ctx.beginPath();
            ctx.moveTo(wh/2,wh/2);
            ctx.lineTo(wh,wh/2);
            ctx.arc(wh/2,wh/2,ridgeAvoid,0,(2 - (2 / fraction) )*Math.PI,true);
            ctx.lineTo(wh/2,wh/2);
            ctx.stroke();
            ctx.closePath();
            ctx.fill();
        }
    
    },
    
    //Responsible for maintaining each piece. Each piece is rotated based on it's size and how many pieces are on the wheel.
    //Pieces can be either an existing array of pieces, or a number indicating the number to generate.
    wheelGroup:function(masterCanvas = document.createElement('canvas'),pieces = 3,setColor){
        this.masterCanvas = masterCanvas; //Where everything will overlay.
        this.wheelCanvas = setObjProperties(document.createElement('canvas'),{
            width:this.masterCanvas.height,
            height:this.masterCanvas.height
        });// Where the wheel will render
        this.spinCanvas = setObjProperties(document.createElement('canvas'),{
           width:this.wheelCanvas.width,
           height:this.wheelCanvas.height 
        });
    
        this.pieces = typeof pieces == "number"?wheelObjs.generatePieces(this.masterCanvas.height,pieces):pieces;
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
    generatePieces:function(wh,count){
        var resultArray = [];
        for(var i = 0;i<count;i++)
            resultArray.push(new this.wheelPiece(wh,count));
        return resultArray;
    },

    pegSet:function(canvasSize = 300, count = 20){
        this.canvasSize = canvasSize;
        this.canvas = document.createElement('canvas');
        this.rotateCanvas = document.createElement('canvas');
        this.count = count;
        this.rotatePercent = 0;

        this.configure = function(count,canvasSize = this.canvasSize){
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
                ctx.rotate((count / 20) * Math.PI / 180);
            }
            ctx.translate(0-(canvasSize / 2),0-(canvasSize / 2));
        }

        this.rotate = function(percent = 0){
            var ctx = this.rotateCanvas.getContext('2d');
            var wh = this.rotateCanvas.width = this.rotateCanvas.height = this.canvas.height; //oi :P
            this.percent = percent;
            ctx.clearRect(0,0,wh,wh);
            ctx.translate(wh/2,wh/2);
            ctx.rotate(360 * (percent * .01) * Math.PI / 180);
            ctx.drawImage(this.canvas,0 - (wh/2),0 - (wh/2));

            //Cleanup:
            ctx.translate(0 - (wh/2),0 - (wh/2));
            ctx.rotate( 360 *  ( (0 - percent) * .01 ) * Math.PI / 180);
        }

        this.detectPoint = function(percent = this.rotatePercent, points = this.count){
            var section = 100 / points;
            console.log(section);
            var hitNumber = percent % (section + (section/2) );
            return (100 / section) * hitNumber;
        }
    }
}

function setObjProperties(targetObj,appendage){
    for(var i in appendage)
        targetObj[i] = appendage[i];
    return targetObj;
}