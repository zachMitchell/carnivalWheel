/*Made by Zachary Mitchell in 2020!
Time to build very knobs and buttons the user will be manipulating: the GUI.
I waited until all the core pieces were done to make this part, so words cannot describe
the excitement I've been having to see everything put together!!

Dependencies: Pretty much everything :P (see index.html)
*/

var dom = {
    selectedImage:undefined,
    customImageData:'',
    wheelGroup:undefined,
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
    },
    /*Make a ui-element for the user to modify a pice of the wheel.
    This element doesn't care where it is as long as it's inside a parent element.
    The index of the element's position is how it knows which piece of the wheel to update.*/
    makePieceDom:pieceIndex=>{
        var pieceDom = document.createElement('div');
        pieceDom.className = 'pieceDom';
        //Create elements to change the target piece index
        pieceDom.innerHTML='<input><input type="color"><button class="piceDel"></button>';
        for(var i of pieceDom.getElementsByTagName('input')) i.onchange=dom.pieceDomChange;
        var targetPiece = dom.wheelGroup.pieces[pieceIndex];
        if(!targetPiece) throw new Error("Piece doesn't exist, please make it first!");
        pieceDom.children[0].value = targetPiece.text;
        var resultColor = '#';
        targetPiece.color.forEach(e=>resultColor+=(e<16?'0':'')+toHex(e));
        pieceDom.children[1].value = resultColor;

        return pieceDom;
    },
    pieceDomChange:function(){
        if(!this.parentElement) throw new Error("insert this element into a parent DOM element to work");

        var targetPiece = dom.wheelGroup.pieces[[...this.parentElement.parentElement.children].indexOf(this.parentElement)];
        targetPiece.text = this.parentElement.children[0].value;
        console.log(this);
        console.log('test');
        targetPiece.color = colorTools.hex2RgbArray([this.parentElement.children[1].value])[0];

        //Re-render the wheel:
        targetPiece.render();
        dom.wheelGroup.renderWheel();
        dom.wheelGroup.renderSpin();
        ui.wheelStuff.wheel.wheel.draw();
    },
    refreshPieceDom:draw=>{
        pieceEditor.innerHTML = '';
        for(var i = 0;i<dom.wheelGroup.pieces.length;i++)
            pieceEditor.appendChild(dom.makePieceDom(i));

        if(draw){
            dom.wheelGroup.drawPieces()
            dom.wheelGroup.renderWheel();
            dom.wheelGroup.renderSpin();
            ui.wheelStuff.wheel.wheel.draw();
        }
    },
    //two indexes are the arguments. When they swap values out, the whole wheel will refresh.
    swapPieceIndexes:function(p1,p2){
        for(var i = 0;i< arguments.length;i++){
            var currDom = pieceEditor.children[arguments[!(i*1)]];
            dom.wheelGroup.pieces[i].text = currDom.children[0].value;
            dom.wheelGroup.pieces[i].color = currDom.children[1].value;
        }
        dom.refreshPieceDom(true);
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