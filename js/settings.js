//Made by Zachary Mitchell: 2019 - 2020!
/*This work is licensed under the Creative Commons Attribution 4.0 International License.
To view a copy of this license, visit http://creativecommons.org/licenses/by/4.0/
or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.*/

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
