//Made by Zachary Mitchell from 2019-2020!
/*This work is licensed under the Creative Commons Attribution 4.0 International License.
To view a copy of this license, visit http://creativecommons.org/licenses/by/4.0/
or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.*/

//These are the things you can do with a wheel object. This assumes wheelObjs.js is included (It's the core reason for this file's existence).

var wheelFuncs = {
    /*This object contains variables that only really matter if we're puppeting the wheel object. wheelObjs.wheel is the minimum, where simply the objects we want to control are stored.*/
    wheelInstance: function(wheel = new wheelObjs.wheel()){
        this.wheel = wheel;
        this.expectedOutcome = 0;
        wheelFuncs.reset(this);
    },

    reset:function(wInst,draw = false,keepAnimation = false){
        wInst.lastTick = 0;
        wInst.loop = undefined;
        wInst.percent = 0;
        wInst.percentIncrease = 0;
        if(!keepAnimation)
            wInst.currAnimation = undefined;
        wInst.currMilliseconds = 0; //For animations, once this reaches a max, it can be cleared to 0.
        if(draw) wInst.wheel.draw(0);
    },

    playTickSound:(volume = 1)=>{
        simpleAudio.play(tickSound,undefined,0,volume);
    },

    cymbalOrEaster:()=>returnByChance([cymbalSfx,.95],[easterEgg,.05]),

    //An "organic" spin (a.k.a not an animation). Spin the wheel based on a variety of values you could change with a real wheel. 
    spin:function(wInst,speed = 2,pegPower = .02,axelDrag = .001){
        clearInterval(wInst.loop);
            var frameRateChange = (16.6 / settings.frameRate);
            wInst.percentIncrease = speed * frameRateChange;
            pegPower*=frameRateChange;
            axelDrag*=frameRateChange;
            wInst.loop = setInterval(()=>{
            wInst.wheel.draw(wInst.percent);
            wInst.percent+=wInst.percentIncrease;
            wInst.percentIncrease-=axelDrag;

            if(wInst.percent >= 100) wInst.percent = 0;
            var currTick = wInst.wheel.pegSet.detectPoint();
            if(wInst.lastTick < 50 && currTick > 50){
                this.playTickSound();
                wInst.percentIncrease-=pegPower;
            }
            wInst.lastTick = currTick;
            if(wInst.percentIncrease <= 0) clearInterval(wInst.loop);
        },settings.frameRate);
    },


    playAnimationWithRng:function(wheelInst,targetAnimation,reset,doneFunc=()=>{},rig = -1){
        //Alright, let's reference all objects in the array except the ones where rndGoTo == true:
        var animationRef = [];
        var pieceCount = wheelInst.wheel.wheelGroup.pieces.length;
        var expectedOutcome = 0;
        for(var i of targetAnimation){
            if(i.rndGoTo){
                lastRndNumber = Math.floor(Math.random()*pieceCount);
                animationRef.push(setObjProperties({},i));
                animationRef[animationRef.length-1].goTo += 100/pieceCount * lastRndNumber;
            }
            else animationRef.push(i);
            //predict where the wheel will go based on the instructions retrieved above:
            var animObj = animationRef[animationRef.length-1];
            if(! animObj.append) expectedOutcome += animObj.goTo;
            else expectedOutcome = animObj.goTo;
        }

        wheelInst.expectedOutcome = expectedOutcome;

        //If we rig the wheel, run it after the animation plays:
        var applyRig = typeof rig == "number" && rig > -1;

        //A function to run the done function :P
        var doneFuncWrapper = ()=>doneFunc(wheelInst.wheel.wheelGroup.getCurrentPiece(),wheelInst);
        wheelInst.currAnimation = this.animate({wheel:wheelInst,sectors:animationRef},reset,applyRig?()=>wheelFuncs.rig(wheelInst,rig,doneFuncWrapper):doneFuncWrapper);
        wheelInst.currAnimation.next();

    },
    //Due to rigging requiring some dynamic math, it has become a separate piece of the animation system.
    rig:function(wheelInst,targetPiece,doneFunc){
        this.resetNegativeNumbers(wheelInst.wheel.wheelGroup);
        var pieceCount = wheelInst.wheel.wheelGroup.pieces.length;
        var targetPercent = (100/pieceCount) * targetPiece;
        var currLocation = wheelInst.wheel.wheelGroup.percent;
        var finalDestination = (100 - currLocation) + (100-targetPercent);
        console.warn(100 + targetPercent);

        wheelInst.currAnimation = wheelFuncs.animate({wheel:wheelInst,sectors:[
            {goTo:0,append:1,duration:1000,preFunc:()=>this.resetNegativeNumbers(wheelInst),doneFunc:()=>{simpleAudio.play(whoopSfx);simpleAudio.play(drmRoll,.7)}},
            {goTo:-100 - (-100+targetPercent) + (100/pieceCount/2),append:0,swingIn:30,duration:500,playTick:1,doneFunc:()=>{/*wheelInst.wheel.draw(targetPercent - (100/pieceCount/2));*/simpleAudio.play(wheelFuncs.cymbalOrEaster())}}
        ]},0,doneFunc);
        wheelInst.currAnimation.next();
        //- (100/pieceCount/2)

    },
    resetNegativeNumbers:function(wheel){
        //If we hit a negative number, invert it:
        if(wheel.percent < 0){
            wheel.percent = 0 - wheel.percent;
            while(wheel.percent > 100){
                wheel.percent-=100;
            }
        }
    },

    /*Move the spinner in different directions dynamically based on a configuration provided:
    The config is an object with the following properties:
    wheel: the target wheel instance
    sectors: an array of objects, each containing some of the following keys:
        goTo - percent to which we stop on - float
        duration - duration in milliseconds - float
        playTick - allow tick to be detected - bool
        append - append percent instead of exact location - bool
        preFunc - function that's run before the wheel starts moving.
        doneFunc - function to execute upon completion
        swingIn - (Optional) slowly ramp up to normal speed for (percent value) of the beginning of the sector - float
        swingOut - (Optional) slam the brakes to stop the animation for (percent value) of the sector - float
        rndGoTo - (optional) used as a flag for playAnimationWithRng(). The wheel will stop in designated location + random percentage based on wheel piece count. - bool
    
    The end location as of this writing is only approximate due to how the animation is broken down.

    ...The fades were a pain to make, let's just put it at that X(
    */
    animate:function*(config,reset = false,doneFunc){
        if(reset) this.reset(config.wheel,true,true);

        //Loop until we pass through everything:
        for(var i of config.sectors){
            if(i.preFunc) i.preFunc();

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
                    swingNumbers[e.toLowerCase()] = index?swing(percentPercent,swingDur/settings.frameRate).reverse():swing(percentPercent,swingDur/settings.frameRate);
                    swingProgress[e.toLowerCase()] = 0;
                    // console.log(['swingDur',swingDur,swingNumbers[e.toLowerCase()]]);
                    speedEquation-=percentPercent;
                }
            });

            //slash down to frames when done:
            speedEquation/=settings.frameRate;

            // console.log([(i.goTo - previousPercent) / i.duration,previousPercent,i.goTo,i.duration]);
            //Nested function that will iterate within this scope:
            config.wheel.loop = setInterval(()=>{
                var currSpeed = speedEquation;
                config.wheel.currMilliseconds+=settings.frameRate;
                var targetChange = 0;
                var fadeIO = false;

                //If swinging was defined, perform one
                //swingIn
                if(swingProgress && swingNumbers.in && typeof swingNumbers.in[swingProgress.in] == "number"){
                    fadeIO = true;
                    currSpeed = swingNumbers.in[swingProgress.in];
                    swingProgress.in++;
                }
                //SwingOut
                //Sorry, the math is a monster X(
                else if(swingNumbers.out && typeof swingNumbers.out[swingProgress.out] == 'number' 
                && (100 / i.duration) * config.wheel.currMilliseconds >= 100 / i.duration * (i.duration * ( (100-i.swingOut) * .01) )){
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

                if(config.wheel.percent > 100){
                    while(config.wheel.percent > 100)
                        config.wheel.percent -= 100;
                }

                config.wheel.wheel.draw(config.wheel.percent,targetChange < 0);
                var currTick = config.wheel.wheel.pegSet.detectPoint();

                if(i.playTick){
                    var isTickReady = targetChange < 0 ?
                    (config.wheel.lastTick < 50 && currTick > 50):
                    (config.wheel.lastTick > 50 && currTick < 50);

                    //Tick sound as defined in the main page.
                    if(isTickReady) this.playTickSound();
                }
                config.wheel.lastTick = currTick;

                if(config.wheel.currMilliseconds >= i.duration){
                    clearInterval(config.wheel.loop);
                    //execute a function if it's available
                    if(typeof i.doneFunc == 'function') i.doneFunc(config.wheel);
                    //NEXT sector!
                    config.wheel.currAnimation.next();
                }

            },settings.frameRate);
            yield; //To be honest, we don't need to return anything special, we just need to know when to proceed to the next section.
        }
        //Finally, execute whatever you wanna do next:
        if(doneFunc) doneFunc();
    }


}