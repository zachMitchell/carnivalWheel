//Made by Zachary Mitchell in 2019!
/*This work is licensed under the Creative Commons Attribution 4.0 International License.
To view a copy of this license, visit http://creativecommons.org/licenses/by/4.0/
or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.*/

/*This file aims to handle several things one watches on screen.
it is extremely general, so as it's being written to, other pieces will probably break into separate files...*/

//Dependencies: confetti.js, simpleAudio.js
var ui = {
    confettiPieces:[],
    loadedConfetti:0,
    totalAssets:0,
    assetsLoaded:0,
    //Links to all of these assets are here, then loaded in the list.
    assetLinks:{
        //Sounds:
        audio:{
            tickSound:'tick5.mp3',
            whoopSfx:'Whoop.mp3',
            drmRoll:'DrumRollQuick.mp3',
            cymbalSfx:'Cymbal.mp3',
            confettiSfx:'noiseMaker.mp3',
            quickConfetti:'noiseMakerQuick.mp3',
            wooshSmack:'wooshSmack.mp3',
            clunk:'clunk.mp3',
            easterEgg:'easterEgg.mp3' //For some reason my friend wanted this here, and have no Idea what it will do!
        },
        //Images:
        img:{
            smileHappy:'smileHappy.svg',
            spiralAxel:'spiralAxel.svg',
            starAxel:'starAxel.svg',
            heartAxel:'heartAxel.svg'
        }
    },
    //Actual elements go here.
    assetList:{
        audio:{},
        img:{},
    },
    //Load everything into the asset list where each can be called by name
    loadAssets:function(onAssetLoad,doneLoading){
        this.totalAssets = Object.keys(this.assetLinks.audio).length + Object.keys(this.assetLinks.img).length;
        this.assetsLoaded = 0;

        for(var i in this.assetLinks){
            for(var j in this.assetLinks[i]){
                //Load the thing!
                ui.loadSpecificAsset(j,i,'assets/'+i+'/'+this.assetLinks[i][j],onAssetLoad,doneLoading);
            }
        }

        //Load confetti; this isn't required up front:
        var rainbow = 'ROYGBIV';
        for(var i = 0;i<rainbow.length;i++){
            this.confettiPieces[i] = document.createElement('img');
            this.confettiPieces[i].src = 'assets/img/confetti/conf'+rainbow[i]+'.svg';
        }
    },
    //Load a specific asset, required here because variables can't be transferred over promise.then
    loadSpecificAsset: async function(objName,elementType,url,onAssetLoad,doneLoading){
        //Retrieve everything through blobs; this is done to keep those dasterdly stubborn audio clips in memory (and not load everytime... LOOKING AT YOU SAFARI >:( )
        var query = await fetch(url);
        var assetData = await query.blob();
        var newAsset;
        var doneLoadingFunc = function(){
            if(onAssetLoad) onAssetLoad(newAsset);
            ui.assetsLoaded++;
            if(ui.assetsLoaded == ui.totalAssets && doneLoading)
                doneLoading(newAsset);
        }
        //Grab the asset type from the index before the filename
        if(elementType == "img"){
            newAsset = document.createElement(elementType);
            // console.log(assetData);
            //Trigger onload (images only)
            newAsset.onload = doneLoadingFunc
            newAsset.src = URL.createObjectURL(assetData);
        }

        else if(elementType == "audio"){
            newAsset = await new simpleAudio.sound(assetData,doneLoadingFunc);
        }
        ui.assetList[elementType][objName] = newAsset;
        /*Bring assets to window scope. This is an error on my end; when testing the code, assets were global...
        If you're reading this code, hi! you're the target audience! Don't do this. XP
        Also, I did this so you can play with my testing code and undesrtand the innerworkings (see ../testDocs to look behind the scenes)*/
        window[objName] = newAsset;
    },
    wheelStuff:{
        wheel:undefined,
        //To make the wheel interesting while nothing's happening, a random light show can happen. First, keep tabs on the random idleness
        idleInterval:undefined,
        idleInstance:undefined,
        confettiInstance:undefined,
        quickConfetti:undefined,
        //function to play a random animation
        randomLightShow:function(idleInstance = this.idleInstance){
            var animationKeys = Object.keys(pegAnimations).filter(e=>e[0]!='_');
            idleInstance.playAnimation(pegAnimations[animationKeys[Math.floor(Math.random()*animationKeys.length)]]);
        }

    }
}
