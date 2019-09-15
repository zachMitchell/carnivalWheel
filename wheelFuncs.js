//Made by Zachary Mitchell in 2019!
//These are the things you can do with a wheel object. This assumes wheelObjs.js is included (It's the core reason for this file's existence).

var wheelFuncs = {
    /*This object contains variables that only really matter if we're puppeting the wheel object. wheelObjs.wheel is the minimum, where simply the objects we want to control are stored.*/
    wheelInstance: function(wheel = new wheelObjs.wheel()){
        this.wheel = wheel;
        wheelFuncs.reset(this);
    },

    reset:function(wInst){
        wInst.lastTick = 0;
        wInst.loop = undefined;
        wInst.percent = 0;
        wInst.percentIncrease = 0;
    },

    spin:function(wInst,speed = 2,pegPower = .02,axelDrag = .001){
        clearInterval(wInst.loop);
            wInst.percentIncrease = speed;
            wInst.loop = setInterval(()=>{
            wInst.wheel.draw(wInst.percent);
            wInst.percent+=wInst.percentIncrease;
            wInst.percentIncrease-=axelDrag;

            if(wInst.percent >= 100) wInst.percent = 0;
            var currTick = wInst.wheel.pegSet.detectPoint();
            if(wInst.lastTick < 50 && currTick > 50){
                tickSound.currentTime = 0;
                wInst.percentIncrease-=pegPower;
                if(tickSound.paused)
                    tickSound.play();
            }
            wInst.lastTick = currTick;
            if(wInst.percentIncrease <= 0) clearInterval(wInst.loop);
        },16.6);
    },

    inverseSpin:function(wInst){

    },

    /*Move the spinner in different directions dynamically based on 3 things:
    percent: Location where it will end up
    time: milliseconds for the animation duration
    sfx: sound you want to make when done.
    
    All arguments will be inserted in to an array, and multiple arrays can go in one function call.
    The first argument can optionally be a bool stating if you want to reset the wheel's posistion.
    */
    animate:function(){

    }

}