wheelThing.currAnimation = wheelFuncs.animate(
    {
        wheel:wheelThing,
        sectors:[
            { goTo:50, duration:1000, playTick:1, swingIn:20, doneFunc:()=>console.log('hi'),strength:.3 }
        ]
    }
)