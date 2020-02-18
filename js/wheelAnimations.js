//Made by Zachary Mitchell in 2019!
/*FINALLY that animation stuff is done! :D Now it's time to get creative and make the wheel do fun stuff
The majority of this file will just be raw data. For a reference on how to make these animations yourself, see: wheelFuncs.js -> animate()*/

//Reference: on an organic spin (wheelFuncs.spin() defaults), it takes about 4.25 rotations and 9.33 seconds for the wheel to stop*
var wheelAnimations = {
    inverseSpin:[
        {goTo:800,duration:5000,swingIn:100,playTick:1,append:true,rndGoTo:1,doneFunc:()=>simpleAudio.play(cymbalSfx)}
    ],
    fakeSpin:[
        {goTo:425,duration:9000,swingOut:100,playTick:1,append:true,rndGoTo:1}
    ],
    doorKnock:[
        {goTo:-12.5,duration:1000,swingIn:50,swingOut:50,append:true},
        {goTo:25,duration:250,swingIn:80,doneFunc:()=>wheelFuncs.playTickSound()}, //Shave
        {goTo:12.5,duration:50,swingOut:50},
        // {goTo:12.5,duration:50},
        {goTo:25,duration:100,swingIn:100,doneFunc:()=>wheelFuncs.playTickSound() }, //And
        {goTo:12.5,duration:25,swingOut:50},
        {goTo:25,duration:100,swingIn:100,doneFunc:()=>wheelFuncs.playTickSound() }, //A
        {goTo:12.5,duration:25,swingOut:50},
        {goTo:25,duration:100,swingIn:100,doneFunc:()=>wheelFuncs.playTickSound() }, //Hair-
        {goTo:12.5,duration:100,swingOut:50},
        {goTo:25,duration:100,swingIn:100,doneFunc:()=>wheelFuncs.playTickSound() }, //Cut...
        {goTo:-50,duration:500,swingIn:50,swingOut:50,append:1,doneFunc:()=>{simpleAudio.play(drmRoll,.4);setTimeout(()=>simpleAudio.play(cymbalSfx),100)}}, //Wow, that's weird delay :P
        {goTo:525,duration:250,swingIn:50,swingOut:50,append:1,rndGoTo:1}, //...TWO BITS! :O
    ],
    backCrack:[
        {goTo:12.5,duration:700,swingIn:50,swingOut:50},
        //Crack Left
        {goTo:-25,duration:1000,append:1,swingIn:100,doneFunc:()=>wheelFuncs.playTickSound(.3)},
        {goTo:0,duration:10,append:1},
        {goTo:-8.3,duration:100,append:1,doneFunc:()=>wheelFuncs.playTickSound(.6)},
        {goTo:0,duration:1,append:1},
        {goTo:-8.3,duration:100,append:1,doneFunc:()=>wheelFuncs.playTickSound(1)},

        {goTo:25,append:true,duration:100,swingOut:100},
        //Crack again
        {goTo:-8.3,duration:100,append:1,swingIn:100,doneFunc:()=>wheelFuncs.playTickSound(.3)},
        {goTo:0,duration:10,append:1},
        {goTo:-8.3,duration:100,append:1,doneFunc:()=>wheelFuncs.playTickSound(.6)},
        {goTo:0,duration:1,append:1},
        {goTo:-8.3,duration:100,append:1,doneFunc:()=>wheelFuncs.playTickSound(1)},
        //Return
        {goTo:0,duration:500,swingOut:100},
        //Crack Right:
        {goTo:8.3,duration:100,append:1,swingIn:100,doneFunc:()=>wheelFuncs.playTickSound(.3)},
        {goTo:0,duration:10,append:1},
        {goTo:8.3,duration:100,append:1,doneFunc:()=>wheelFuncs.playTickSound(.6)},
        {goTo:0,duration:1,append:1},
        {goTo:8.3,duration:100,append:1,doneFunc:()=>wheelFuncs.playTickSound(1)},

        {goTo:0,duration:100,swingOut:100},
        //Crack again
        {goTo:8.3,duration:100,append:1,swingIn:100,doneFunc:()=>wheelFuncs.playTickSound(.3)},
        {goTo:0,duration:10,append:1},
        {goTo:8.3,duration:100,append:1,doneFunc:()=>wheelFuncs.playTickSound(.6)},
        {goTo:0,duration:1,append:1},
        {goTo:8.3,duration:100,append:1,doneFunc:()=>wheelFuncs.playTickSound(1)},

        //Return again
        {goTo:0,duration:500,swingOut:100},
        //Swing left...
        {goTo:-50,duration:1000,swingOut:50,swingIn:50,append:1,doneFunc:()=>setTimeout(()=>simpleAudio.play(drmRoll,1),1000)},
        //Whee!
        {goTo:450,duration:2000,swingIn:100,playTick:1,append:true},
        {goTo:0,duration:1,append:true,rndGoTo:1,doneFunc:()=>simpleAudio.play(cymbalSfx)},
    ],
    smack:[
        {goTo:50,duration:200,rndGoTo:1,append:true,preFunc:()=>simpleAudio.play(wooshSmack)},
        {goTo:-50,duration:400,append:true,swingOut:100},
        {goTo:50,duration:400,append:true,swingIn:100,doneFunc:()=>wheelFuncs.playTickSound()},
        {goTo:-25,duration:200,append:true,swingOut:100},
        {goTo:25,duration:200,append:true,swingIn:100,doneFunc:()=>wheelFuncs.playTickSound(.7)},
        {goTo:-12.5,duration:100,append:true,swingOut:100},
        {goTo:12.5,duration:100,append:true,swingIn:100,doneFunc:()=>wheelFuncs.playTickSound(.4)},
        {goTo:-6.25,duration:50,append:true,swingOut:100},
        {goTo:6.25,duration:50,append:true,swingIn:100,doneFunc:()=>wheelFuncs.playTickSound(.4)},
        {goTo:0,duration:250,append:true,doneFunc:()=>simpleAudio.play(cymbalSfx)},
    ]
};

/*Display fun peg lighting when the wheel is idle. Each function has two arguments:
    idleInstance: that object on the bottom of the code there. It holds current animation and the wheel responsible for it.
    doneFunc: what to do after the animation is complete.
*/
var pegAnimations = {
    _drawPegs:wheel=>{
        wheel.pegSet.configure();
        wheel.draw();
    },
    _clearPegs:wheel=>{
        //Clear the array:
        wheel.pegSet.lightPattern = [];
        pegAnimations._drawPegs(wheel);
    },

    //loop around the wheel once
    lapSingle:function*(idleInstance,doneFunc){
        var targetPegs = idleInstance.wheel.pegSet;
        targetPegs.lightPattern = [];
        for(var i = 0;i<targetPegs.count;i++){
            targetPegs.lightPattern[i] = true;
            if(i>0) targetPegs.lightPattern[i-1] = false;
            pegAnimations._drawPegs(idleInstance.wheel);
            //Move after this alloted amount of time:
            setTimeout(()=>idleInstance.generator.next(),40);
            yield;
        }
        pegAnimations._clearPegs(idleInstance.wheel);
        doneFunc?doneFunc():0;
    },
    //Flicker odd and even lights:
    flicker:function*(idleInstance,doneFunc){
        var targetPegs = idleInstance.wheel.pegSet;
        targetPegs.lightPattern = [];
        for(var i = 0;i<10;i++){
            for(var j=0;j<targetPegs.count;j++){
                targetPegs.lightPattern[j] = (j+i)%2==1;
            }
            pegAnimations._drawPegs(idleInstance.wheel);
            setTimeout(()=>idleInstance.generator.next(),500);
            yield;
        }
        pegAnimations._clearPegs(idleInstance.wheel);
        doneFunc?doneFunc():0;
    },
    //loop around the wheel with two lights crossing roads:
    lapDouble:function*(idleInstance,doneFunc){
        var targetPegs = idleInstance.wheel.pegSet;
        targetPegs.lightPattern = [];

        targetPegs.lightPattern[0] = true;
        targetPegs.lightPattern[targetPegs.count-1] = true;

        var frontPlacement = 0, backPlacement = targetPegs.count-1;
        var addSubtract = true;
        for(var i = 0;i<2;i++){
            do{
                pegAnimations._drawPegs(idleInstance.wheel);
                setTimeout(()=>idleInstance.generator.next(),20);
                yield;

                targetPegs.lightPattern[frontPlacement] = false;
                targetPegs.lightPattern[backPlacement] = false;
                if(addSubtract){
                    frontPlacement++;
                    backPlacement--;
                }
                else{
                    frontPlacement--;
                    backPlacement++;
                }
                targetPegs.lightPattern[frontPlacement] = true;
                targetPegs.lightPattern[backPlacement] = true;
            }while(!targetPegs.lightPattern[0] && !targetPegs.lightPattern[targetPegs.count-1]);
            addSubtract = false;  
        }
        pegAnimations._clearPegs(idleInstance.wheel);
        doneFunc?doneFunc():0;
    },
    //Light up everything like a water dropplet
    ripple:function*(idleInstance,doneFunc){
        var targetPegs = idleInstance.wheel.pegSet;
        targetPegs.lightPattern = [];

        var lightUp = true;

        for(var i = 0;i<2;i++){
            var frontPlacement = 0, backPlacement = targetPegs.count-1;
            targetPegs.lightPattern[0] = lightUp;
            targetPegs.lightPattern[targetPegs.count-1] = lightUp;
            for(var j = 0;j<targetPegs.count/2;j++){
                pegAnimations._drawPegs(idleInstance.wheel);
                setTimeout(()=>idleInstance.generator.next(),40);
                yield;

                frontPlacement++;
                backPlacement--;

                targetPegs.lightPattern[frontPlacement] = lightUp;
                targetPegs.lightPattern[backPlacement] = lightUp;
            }
            lightUp = false;  
        }        

        pegAnimations._clearPegs(idleInstance.wheel);
        doneFunc?doneFunc():0;
    }

}

function pegIdleInstance(wheel){
    this.generator = undefined;
    this.wheel = wheel;
    this.playAnimation = (animtion,doneFunc)=>{
        this.generator = animtion(this,doneFunc);
        this.generator.next();
    }
}

//Winner winner; chicken dinner!!
function* winnerPiece(wheelInst,targetPiece=0,doneFunc,timesToClunk=6,speed=65){
    for(var i = 0;i<timesToClunk*2;i++){
        var lightUp = i%2==0;
        wheelInst.wheel.draw(wheelInst.percent,undefined,(lightUp?targetPiece:true));
        if(lightUp) simpleAudio.play(clunk);
        setTimeout(()=>wheelInst.currAnimation.next(),speed);
        yield;
    }
    doneFunc?doneFunc():0;
}