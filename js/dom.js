/*Made by Zachary Mitchell in 2020!
Time to build very knobs and buttons the user will be manipulating: the GUI.
I waited until all the core pieces were done to make this part, so words cannot describe
the excitement I've been having to see everything put together!!

Dependencies: Pretty much everything :P (see index.html)
*/

var dom = {
    selectedImage:undefined,
    customImageData:'',
    imageClick:function(){
        if(dom.selectedImage!=this){
            if(dom.selectedImage)dom.selectedImage.classList.remove('selected');
            dom.selectedImage = this;
            this.classList.add('selected');
            var axel = ui.wheelStuff.wheel.wheel.centerAxel;
            if(this.className.indexOf('custom') > 0){
                axel.coreImage = this;
            }
            else axel.coreImage = ui.assetList.img[this.dataset.asset];
            axel.renderMainCanvas();
            wheelFuncs.reset(ui.wheelStuff.wheel,1);
            dom.restartIdle();
        }
    },
    loadImagePreviews:()=>{
        for(var i in ui.assetList.img){
            var newImage = document.createElement('img');
            //Object url is copied over, so network is happy :)
            newImage.src = ui.assetList.img[i].src;
            newImage.className = 'preview';
            newImage.dataset.asset = i;
            newImage.onclick = dom.imageClick;
            //Append to DOM
            imagePreviews.appendChild(newImage);
        }
    },
    startIdling:()=>ui.wheelStuff.idleInterval = setInterval(()=>ui.wheelStuff.randomLightShow(),10000),
    restartIdle:()=>{
        clearInterval(ui.wheelStuff.idleInterval);
        delete ui.wheelStuff.idleInstance.generator;
        dom.startIdling();
        ui.wheelStuff.randomLightShow();
    }
}

spinButton.onclick = function(){
    var ws = ui.wheelStuff;
    clearInterval(ws.idleInterval);
    delete ws.idleInstance.generator;

    clearInterval(ws.wheel.loop);
    delete ws.wheel.currAnimation;

    var keys = Object.keys(wheelAnimations);
    var targetAnimation = boringModeCheck.checked? wheelAnimations.fakeSpin: wheelAnimations[keys[Math.floor(Math.random()*keys.length)]];
    wheelFuncs.playAnimationWithRng(ws.wheel,targetAnimation,!boringModeCheck.checked,
        (e,f)=>{
        f.currAnimation = winnerPiece(f,e);
        f.currAnimation.next();
        dom.startIdling();
    });
}

customImageFile.onchange = function(){
    //Custom image was loaded, so load it in with the othe icons and store it's data.
    var oldCustom = document.getElementsByClassName('preview custom')[0];
    if(oldCustom) imagePreviews.removeChild(oldCustom);

    // dom.selectedImage = undefined;
    var newCustom = document.createElement('img');
    newCustom.className = 'preview custom';
    newCustom.dataset.asset = 'custom';
    newCustom.onclick = dom.imageClick;
    imagePreviews.appendChild(newCustom);
    newCustom.onload = function(){
        dom.customImageData = imgToDataUrl(this);
        this.click();
    }
    newCustom.src=URL.createObjectURL(this.files[0]);
}

function imgToDataUrl(imgTag){
    // if(!height) height = width;
    var tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = imgTag.width, tmpCanvas.height = imgTag.height;
    var tmpCanvasCtx = tmpCanvas.getContext('2d');
    tmpCanvasCtx.drawImage(imgTag,0,0,imgTag.width,imgTag.height);
    return tmpCanvas.toDataURL();
}