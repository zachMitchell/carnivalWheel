/*Made by Zachary Mitchell in 2020!
Time to build very knobs and buttons the user will be manipulating: the GUI.
I waited until all the core pieces were done to make this part, so words cannot describe
the excitement I've been having to see everything put together!!

Dependencies: Pretty much everything :P (see index.html)
*/

/*This work is licensed under the Creative Commons Attribution 4.0 International License.
To view a copy of this license, visit http://creativecommons.org/licenses/by/4.0/
or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.*/

var dom = {
    selectedImage:undefined,
    customImageData:'',
    wheelGroup:undefined,
    wSpinning:false, //Do not set manually, check dom.spinFlag()!
    getRiggedPiece:function(){
        var riggedPiece;
        var rigRadios = document.getElementsByClassName('riggedPiece'); 
        //Look for rigged piece if applicable:
        for(var i = 0;i < rigRadios.length;i++){
            if(rigRadios[i].checked){
                riggedPiece = i;
                break;
            }
        }
        return riggedPiece;
    },
    imageClick:function(){
        if(dom.selectedImage!=this && !dom.wSpinning){
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
        pieceDom.innerHTML='<input><input type="color"><button class="pieceDel">X</button><input type="radio" class="riggedPiece" name="riggedPiece"/>';
        for(var i of pieceDom.getElementsByTagName('input'))
            if(i.type!='radio') i.onchange=dom.pieceDomChange;
        var targetPiece = dom.wheelGroup.pieces[pieceIndex];
        if(!targetPiece) throw new Error("Piece doesn't exist, please make it first!");
        pieceDom.children[0].value = targetPiece.text;
        var resultColor = '#';
        targetPiece.color.forEach(e=>resultColor+=(e<16?'0':'')+toHex(e));
        pieceDom.children[1].value = resultColor;
        pieceDom.getElementsByClassName('pieceDel')[0].onclick=dom.removePieceBtn;

        return pieceDom;
    },
    pieceDomChange:function(){
        if(!this.parentElement) throw new Error("insert this element into a parent DOM element to work");

        var targetPiece = dom.wheelGroup.pieces[[...this.parentElement.parentElement.children].indexOf(this.parentElement)];
        targetPiece.text = this.parentElement.children[0].value;
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
    },
    removePiece:function(index){
        if(dom.wheelGroup.pieces.length > 2){
            delete dom.wheelGroup.pieces[index];
            dom.wheelGroup.pieces = dom.wheelGroup.pieces.filter(e=>e);
            //Update piece count
            for(var i of dom.wheelGroup.pieces) i.fraction = dom.wheelGroup.pieces.length;
            dom.refreshPieceDom(true);
        }
    },
    removePieceBtn:function(){
        var parent = this.parentElement.parentElement;
        dom.removePiece([...parent.children].indexOf(this.parentElement));
    },
    loadThemePicker:function(){
        themePicker.innerHTML = '';
        for(var i in colorPresets){
            var targetTheme = document.createElement('option');
            targetTheme.innerHTML=i;
            themePicker.appendChild(targetTheme);
        }
    },
    applyTheme:function(themeName){
        var colorCount = dom.wheelGroup.pieces.length;
        var rgbArray = colorTools.generateColors(colorTools.hex2RgbArray(colorPresets[themeName]),colorCount);
        for(var i = 0;i<colorCount;i++)
            dom.wheelGroup.pieces[i].color = rgbArray[i];
        
        dom.refreshPieceDom(true);
    },
    spinFlag:function(tf){
        dom.wSpinning = tf;
        imagePreviews.classList[tf?"add":"remove"]('disabled');
        document.body[(tf?"add":"remove")+"EventListener"]("keydown",dom.quickVictoryListener);
    },
    //When you manage to win so fast the confetti can't keep up
    quickVictory:function(){
        var wInst = ui.wheelStuff.wheel
        var riggedPiece = dom.getRiggedPiece();
        var qC = ui.wheelStuff.quickConfetti;
        clearInterval(wInst.loop);
        delete wInst.currAnimation;
        wInst.wheel.draw(wInst.expectedOutcome);
        wInst.percent = wInst.expectedOutcome;
        //Time for a fancy trick, we use resetNegativeNumbers to fix a negative OR positive number to something of 0 to 100:
        if(dom.wheelGroup.percent > -1) dom.wheelGroup.percent = 0 - dom.wheelGroup.percent;
        wheelFuncs.resetNegativeNumbers(wInst.wheel.wheelGroup);
        // console.warn(dom.wheelGroup.getCurrentPiece());

        //manually invoking a custom confetti throw; probably should have this built in :P
        simpleAudio.play(qC.sfx);
        qC.confettiObj.currAnimation = qC.confettiObj.throwUpwards(settings.frameRate,10,500);
        qC.confettiObj.currAnimation.next();
        var doneFunc = ()=>{
            wInst.currAnimation = winnerPiece(wInst,riggedPiece || dom.wheelGroup.getCurrentPiece(),()=>{dom.startIdling();dom.spinFlag(0)});
            wInst.currAnimation.next();
        }

        if(riggedPiece !== undefined)
            wheelFuncs.rig(wInst,riggedPiece,doneFunc);
        else setTimeout(doneFunc,300);
    },
    quickVictoryListener: function(e){
        if(e.key == " "){
            e.preventDefault();
            dom.quickVictory();
        }
        document.body.removeEventListener('keydown',dom.quickVictoryListener);
    }
}

spinButton.onclick = function(){
    dom.spinFlag(true);
    var ws = ui.wheelStuff;

    //Clear confetti prompt
    if(ws.confettiInstance.isActive) ws.confettiInstance.deactivate();
    if(easterEgg.playing) simpleAudio.stop(easterEgg);


    clearInterval(ws.idleInterval);
    delete ws.idleInstance.generator;
    ui.wheelStuff.wheel.wheel.pegSet.lightPattern = [];
    ui.wheelStuff.wheel.wheel.pegSet.configure();

    clearInterval(ws.wheel.loop);
    delete ws.wheel.currAnimation;

    var riggedPiece = dom.getRiggedPiece();

    var keys = Object.keys(wheelAnimations);
    var targetAnimation = boringModeCheck.checked? wheelAnimations.fakeSpin: wheelAnimations[keys[Math.floor(Math.random()*keys.length)]];
    wheelFuncs.playAnimationWithRng(ws.wheel,targetAnimation,!boringModeCheck.checked,
        (e,f)=>{
            // console.log(e,ws.wheel.percent,ws.wheel.wheel.wheelGroup.percent);
            setTimeout(()=>{
                f.currAnimation = winnerPiece(f,e,()=>{ws.confettiInstance.activate();dom.spinFlag(false);});
                f.currAnimation.next();
                dom.startIdling();
            },200);
    },riggedPiece);
}

customImageFile.onchange = function(){
    //Custom image was loaded, so load it in with the othe icons and store it's data.
    changeCustomImage(URL.createObjectURL(this.files[0]));
}

function changeCustomImage(dataUrl){
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
    newCustom.src = dataUrl;
}

addPieceBtn.onclick = function(){
    var newPieceCount = dom.wheelGroup.pieces.length+1;
    //Make a new piece.
    dom.wheelGroup.pieces.push(
        new wheelObjs.wheelPiece(dom.wheelGroup.masterCanvas.height,
            newPieceCount,
            dom.wheelGroup.pieces[newPieceCount-2].color
        ));
    
    //update the other pieces in the group with the same number
    for(var i of dom.wheelGroup.pieces) i.fraction = newPieceCount;

    //Update DOM and re-draw:
    dom.refreshPieceDom(true);
}

rigCheck.onclick = function(){
    var showHide = this.checked*1;
    var boolVars = [['remove','add'],['unset','none']];
    for(var i of pieceEditor.getElementsByClassName('riggedPiece'))
        i.classList[boolVars[0][showHide]]('show');
    
    for(var i of pieceEditor.getElementsByClassName('pieceDel'))
        i.style.display = boolVars[1][showHide];
    
    dontRig.classList[boolVars[0][showHide]]('show');
}

dontRig.onclick = ()=>{
    for(var i of pieceEditor.getElementsByClassName('riggedPiece')){
        if(i.checked){
            i.checked = false;
            break;
        }
    }
}

//Save wheel for use later. Things to grab: pieces (name and color), image
saveWh.onclick = function(){
    var saveJson = {pieces:[]};
    //Piece information:
    for(var i of dom.wheelGroup.pieces)
        saveJson.pieces.push([i.text,i.color]);
    
    //Images work a little differently, if the selected image is a built-in, we save the name, otherwise the dataURL of a custom image.
    var selectedImage = imagePreviews.getElementsByClassName('selected')[0];
    if(selectedImage.dataset.asset == "custom")
        saveJson.image = dom.customImageData;
    else saveJson.image = selectedImage.dataset.asset;
    
    var fileLink = document.createElement('a');
    fileLink.href = URL.createObjectURL(new Blob([JSON.stringify(saveJson)]));
    fileLink.download = 'wheelConfig.json';
    fileLink.click();
}

loadWh.onchange = function(){
    var fReader = new FileReader();
    fReader.onload = e=>{
        try{
            var loadedJson = JSON.parse(e.srcElement.result);
            if(loadedJson.pieces.length){
                var pieceResults = [];
                for(var i of loadedJson.pieces)
                    pieceResults.push(new wheelObjs.wheelPiece(ui.wheelStuff.wheel.wheel.coreCanvas.height,loadedJson.pieces.length,i[1],i[0]));
                
                dom.wheelGroup.pieces = pieceResults;
            }

            //Image wizzardy
            if(loadedJson.image){
                //Check to see if we have a png or not
                if(loadedJson.image.indexOf('data:image/png;base64') === 0){
                    //Treat this as a custom image
                    dom.customImageData = loadedJson.image;
                    changeCustomImage(loadedJson.image);
                }
                else{
                    //This is a built-in image
                    for(var i of imagePreviews.children)
                        if(i.dataset.asset == loadedJson.image){
                            i.click();
                        }
                }
            }

            dom.refreshPieceDom(true);
        }
        catch(e){
            alert("Sorry, this file won't do :( Please insert a wheel configuration file or fix the file you have to work with the wheel");
            console.error(e);
        }

    }
    fReader.readAsText(loadWh.files[0]);
}

document.onfullscreenchange = function(){
    //Determine what's larger: width or height: (.95 to leave room for buttons)
    var targetSize = document.fullscreen?
        (fullScreenContainer.scrollHeight < fullScreenContainer.scrollWidth? fullScreenContainer.scrollHeight*.9:fullScreenContainer.scrollWidth*.9):
        wheelSize.value;
    settings.size = targetSize;
    spinButton.parentElement.style.color = document.fullscreen?"white":"";
}