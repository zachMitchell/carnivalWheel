//Made by Zachary Mitchell in 2019!
/*FINALLY that animation stuff is done! :D Now it's time to get creative and make the wheel do fun stuff
The majority of this file will just be raw data. For a reference on how to make these animations yourself, see: wheelFuncs.js -> animate()*/

//Reference: on an organic spin (wheelFuncs.spin() defaults), it takes about 4.25 rotations and 9.33 seconds for the wheel to stop*
var wheelAnimations = {
    inverseSpin:[
        {goTo:800,duration:5000,swingIn:100,playTick:1,append:true}
    ],
    fakeSpin:[
        {goTo:425,duration:9000,swingOut:100,playTick:1,append:true}
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
        {goTo:-50,duration:500,swingIn:50,swingOut:50,append:1},
        {goTo:525,duration:250,swingIn:50,swingOut:50,append:1,playTick:1}, //...TWO BITS! :O
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
        {goTo:-50,duration:1000,swingOut:50,swingIn:50,append:1},
        //Whee!
        {goTo:450,duration:2000,swingIn:100,playTick:1,append:true}
    ]
};