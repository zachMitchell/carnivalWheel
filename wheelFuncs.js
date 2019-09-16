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
        wInst.currAnimation = undefined;
        wInst.currMilliseconds = 0; //For animations, once this reaches a max, it can be cleared to 0.
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

    /*Move the spinner in different directions dynamically based on a configuration provided:
    The config is an object with the following properties:
    wheel: the target wheel
    sectors: an array of arrays, each containing some of the following indexes:
        [0] percent to which we stop on - float
        [1] duration in milliseconds - float
        [2] allow tick to be detected - bool
        [3] append percent instead of exact location - bool
        [4] function to execute upon completion
    
    The end location as of this writing is only approximate due to how the animation is broken down.
    */
    animate:function*(config){
        //Loop until we pass through everything:
        for(var i of config.sectors){
            config.wheel.currMilliseconds = 0;
            var previousPercent = config.wheel.percent;
            // console.log([(i[0] - previousPercent) / i[1],previousPercent,i[0],i[1]]);
            config.wheel.loop = setInterval(()=>{
                config.wheel.currMilliseconds+=16.6;
                var targetChange = 0;
                //If we want to append percentage:
                if(i[3]) targetChange = i[0] / (i[1] / 16.6);
                else targetChange = (i[0] - previousPercent) / (i[1] / 16.6);
                // console.log(targetChange);

                config.wheel.percent+=targetChange;
                if(config.wheel.percent > 100)
                    config.wheel.percent -= 100;
                config.wheel.wheel.draw(config.wheel.percent,targetChange < 0);
                var currTick = config.wheel.wheel.pegSet.detectPoint();

                var playTick = targetChange < 0 ?
                (config.wheel.lastTick < 50 && currTick > 50):
                (config.wheel.lastTick > 50 && currTick < 50);

                if(i[2] && playTick){
                    //Tick sound as defined in the main page.
                    tickSound.currentTime = 0;
                    if(tickSound.paused) tickSound.play();
                }
                config.wheel.lastTick = currTick;

                if(config.wheel.currMilliseconds >= i[1]){
                    clearInterval(config.wheel.loop);
                    //execute a function if it's available
                    if(typeof i[4] == 'function') i[4](config.wheel);
                    //NEXT sector!
                    config.wheel.currAnimation.next();
                }

            },16.6);
            yield; //To be honest, we don't need to return anything special, we just need to know when to proceed to the next section.
        }
    }

}