//Made by Zachary Mitchell in 2019!
//General settings the whole code makes use of.
var settings = {
    _fr:16.6, //Private value, do not touch
    get frameRate(){
        return settings._fr;
    },
    //Do not change this while the wheel is moving.
    set frameRate(value){
        //This rounds slightly lower which leans closer to the frame-rate I was working with before making this setter.
        var interval = Math.fround(1000 / value);
        settings._fr = interval;
        ui.wheelStuff.confettiInstance.frameRate = interval;
        ui.wheelStuff.quickConfetti.frameRate = interval;

    },
    get size(){
        return ui.wheelStuff.wheel.wheel.coreCanvas.height;
    },
    set size(value){
        confettiCanvas.width = value;
        confettiCanvas.height = value;
        ui.wheelStuff.wheel.wheel.renderAssets(value);
        ui.wheelStuff.wheel.wheel.draw();
    }
}
