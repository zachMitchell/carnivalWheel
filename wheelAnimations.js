//Made by Zachary Mitchell in 2019!
//FINALLY that animation stuff is done! :D Now it's time to get creative and make the wheel do fun stuff

//Reference: on an organic spin (wheelFuncs.spin() defaults), it takes about 4.25 rotations and 9.33 seconds for the wheel to stop*
var wheelAnimations = {
    inverseSpin:[
        {goTo:500,duration:5000,swingIn:100,playTick:1,append:true}
    ],
    fakeSpin:[
        {goTo:425,duration:9000,swingOut:100,playTick:1,append:true,doneFunc:()=>console.log('test')}
    ]
};