//Made by Zachary Mitchell in 2019!
//These are the things you can do with a wheel object. This assumes wheelObjs.js is included (It's the core reason for this file's existence).

var wheelFuncs = {
    /*This object contains variables that only really matter if we're puppeting the wheel object. wheelObjs.wheel is the minimum, where simply the objects we want to control are stored.*/
    wheelInstance: function(wheel = new wheelObjs.wheel()){
        this.wheel = wheel;
        wheelFuncs.reset(this);
    },

    reset:function(wInst,draw = false){
        wInst.lastTick = 0;
        wInst.loop = undefined;
        wInst.percent = 0;
        wInst.percentIncrease = 0;
        wInst.currAnimation = undefined;
        wInst.currMilliseconds = 0; //For animations, once this reaches a max, it can be cleared to 0.
        if(draw) wInst.wheel.draw(0);
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

    /*Move the spinner in different directions dynamically based on a configuration provided:
    The config is an object with the following properties:
    wheel: the target wheel instance
    sectors: an array of objects, each containing some of the following keys:
        goTo - percent to which we stop on - float
        duration - duration in milliseconds - float
        playTick - allow tick to be detected - bool
        append - append percent instead of exact location - bool
        doneFunc - function to execute upon completion
        swingIn - (Optional) slowly ramp up to normal speed for (percent value) of the beginning of the sector - float
        swingOut - (Optional) slam the brakes to stop the animation for (percent value) of the sector - float
    
    The end location as of this writing is only approximate due to how the animation is broken down.

    ...The fades were a pain to make, let's just put it at that X(
    */
    animate:function*(config){
        //Loop until we pass through everything:
        for(var i of config.sectors){
            config.wheel.currMilliseconds = 0;
            var previousPercent = config.wheel.percent;
            var swingNumbers = {};
            var swingProgress = {};
            //Equation for speed depends on if we have a fadeIn/fadeOut
            var speedEquation = i.duration;

            ['In','Out'].forEach((e,index)=>{
                if(i['swing'+e] != undefined){
                    //Create the numbers to do a proper swing. If it's swingOut, enter the results in reverse:
                    var swingDur = i.duration * (i['swing'+e] * .01);
                    var percentPercent = (i.goTo - (i.append ? 0 : previousPercent)) * (i['swing'+e] * .01); //A percent of our total time.
                    swingNumbers[e.toLowerCase()] = index?swing(percentPercent,swingDur/16.6,i.strength):swing(percentPercent,swingDur/16.6,i.strength).reverse();
                    swingProgress[e.toLowerCase()] = 0;
                    // console.log(['swingDur',swingDur,swingNumbers[e.toLowerCase()]]);
                    speedEquation-=swingDur;
                }
            });

            //slash down to frames when done:
            speedEquation/=16.6;

            // console.log([(i.goTo - previousPercent) / i.duration,previousPercent,i.goTo,i.duration]);
            //Nested function that will iterate within this scope:
            config.wheel.loop = setInterval(()=>{
                var currSpeed = speedEquation;
                config.wheel.currMilliseconds+=16.6;
                var targetChange = 0;
                var fadeIO = false;

                //If we can't swingOut yet, swingIn...
                if(swingNumbers.in && typeof swingNumbers.in[swingProgress.in] == "number"){
                    fadeIO = true;
                    currSpeed = swingNumbers.in[swingProgress.in];
                    swingProgress.in++;
                }
                //If swinging was defined, perform one, with swingOut Prioritized first:
                else if(swingNumbers.out && typeof swingNumbers.out[swingProgress.out] == 'number' 
                && 100 / i.duration * config.wheel.currMilliseconds >= 100/i.duration * (100-i.swingOut)){
                    fadeIO = true;
                    currSpeed = swingNumbers.out[swingProgress.out];
                    swingProgress.out++;
                }

                /*For fading in and out, we have special formulas that take care of the speed change. (A.K.A fadeIO)
                Otherwise, alternate formulas will be calculated based on if we're appending the wheel's percentage or not.
                (Not a math genius, so probably not a detailed description :P)*/
                targetChange = 
                    fadeIO? currSpeed:
                    i.append? i.goTo / currSpeed:
                    (i.goTo - previousPercent) / currSpeed;

                config.wheel.percent+=targetChange;
                if(config.wheel.percent > 100)
                    config.wheel.percent -= 100;
                config.wheel.wheel.draw(config.wheel.percent,targetChange < 0);
                var currTick = config.wheel.wheel.pegSet.detectPoint();

                if(i.playTick){
                    var isTickReady = targetChange < 0 ?
                    (config.wheel.lastTick < 50 && currTick > 50):
                    (config.wheel.lastTick > 50 && currTick < 50);

                    if(isTickReady){
                        //Tick sound as defined in the main page.
                        tickSound.currentTime = 0;
                        if(tickSound.paused) tickSound.play();
                    }
                }
                config.wheel.lastTick = currTick;

                if(config.wheel.currMilliseconds >= i.duration){
                    clearInterval(config.wheel.loop);
                    //execute a function if it's available
                    if(typeof i.doneFunc == 'function') i.doneFunc(config.wheel);
                    //NEXT sector!
                    config.wheel.currAnimation.next();
                }

            },16.6);
            yield; //To be honest, we don't need to return anything special, we just need to know when to proceed to the next section.
        }
    }

}