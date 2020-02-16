//Made by Zachary Mitchell in 2019!
/*This file aims to handle several things one watches on screen.
it is extremely general, so as it's being written to, other pieces will probably break into separate files...*/

//Dependencies: confetti.js
var ui = {
    confettiPieces:[],
    loadedConfetti:0,
    //Links to all of these assets are here, then loaded in the list.
    assetLinks:{
        //Sounds:
        audio:{
            tickSound:'tick5.mp3',
            whoopSfx:'Whoop.mp3',
            drmRool:'DrumRollQuick.mp3',
            cymbalSfx:'Cymbal.mp3',
            confettiSfx:'noiseMaker.mp3',
            wooshSmack:'wooshSmack.mp3',
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
    loadAssets:function(onAssetLoad){

        for(var i in this.assetLinks){
            for(var j in this.assetLinks[i]){
                //Load the thing!
                ui.loadSpecificAsset(j,i,'assets/'+i+'/'+this.assetLinks[i][j]);
            }
        }


        //Load confetti; this isn't required up front:
        var rainbow = 'ROYGBIV';
        for(var i = 0;i<rainbow.length;i++){
            this.confettiPieces[i] = document.createElement('img');
            this.confettiPieces[i].src = 'assets/img/confetti/conf'+rainbow[i]+'.svg';
        }

        /*Bring assets to window scope. This is an error on my end; when testing the code, assets were global...
        If you're reading this code, hi! you're the target audience! Don't do this. XP
        Also, I did this so you can play with my testing code and undesrtand the innerworkings (see ../testDocs to look behind the scenes)*/
        console.warn(ui.assetList);
        for(var i of ui.assetList)
            console.log(i);// for(var j in i)window[j] = i[j];
    },
    //Load a specific asset, required here because variables can't be transferred over promise.then
    loadSpecificAsset: async function(objName,elementType,url,onAssetLoad){
        //Retrieve everything through blobs; this is done to keep those dasterdly stubborn audio clips in memory (and not load everytime... LOOKING AT YOU SAFARI >:( )
        var query = await fetch(url);
        //Grab the asset type from the index before the filename
        var newAsset = document.createElement(elementType);
        var assetData = await query.blob();
        // console.log(assetData);
        //Trigger onload (images only)
        newAsset.src = URL.createObjectURL(assetData);
        ui.assetList[elementType][objName] = newAsset;
        if(onAssetLoad) onAssetLoad(newAsset);
    }
}