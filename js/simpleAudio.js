//Made by Zachary Mitchell in 2020!
/*As of this writing... let's just say safari is a pain to work with regarding audio.
This is a compilation of what I learned about AudioContext (and "webkitAudioContext"), and attempts to make something that will
hopefully make safari work well with rapid sound playing.

Browser Requirements:
fetc, async & promise support
FileReader <- if this goes obsolete for some reason, blobs have native support for converting to an ArrayBuffer.

Developer requirements:
Please do not invoke webkitAudioContext yourself when using this file. Safari holds up to 4 of these objects at one time (as of 2020), and it's crucial that they can all be used.
If one is used up, a drop in audio quality will inevitably occur.*/

//Safari has a hard limit, but to future proof; the absolute max the program will take in is 10 (or at least until we use 'em all up)

var simpleAudio = {
    _targetContext:(window.AudioContext || window.webkitAudioContext),
    //Hog all available contexts:
    contextList:[],
    //Add a new context to the contextList. If none are left, don't do anything. Returns new context.
    _contextObj:function(){
        this.ctx = new simpleAudio._targetContext();
        if(this.ctx !== null)
            simpleAudio.contextList.push(this);

        //This map is backwards; if a sound is playing, it can be traced back via the key, which will simply return true.
        this.soundsPlaying=new Map();

    },
    //Based on the array above, discover the first context not being used to play a buffer
    _firstContextNotPlaying:function(soundObj){
        for(var i of this.contextList)
            if(!i.soundsPlaying.get(soundObj)) return i;
    },
    _makeArrayBuffer:function(blobIn,onload){
        var newFilereader = new FileReader();
        newFilereader.onload = onload;
        newFilereader.readAsArrayBuffer(blobIn);
    },
    options:{
        //Specify how many contexts are allowed given you can have as many as you want. -1 for unlimited.
        limit:-1
    },
    //This object's first argument takes in one of three things: a string (link to the file), a blob, or an existing arrayBuffer.
   sound:function(soundSrc,onload = ()=>{}){
        this.isLoaded = false;
        this.playing = 0;
        this.linkedSources = [];
        this.sourcesToContext = new Map();
        this.onload = onload;
        this.onDonePlaying = undefined;
        /*For sounds that don't need to play through the entire duration and are friendly to starting over, toggle this on:
        In other words - the default setting causes multiple instances of this sound to play (if possible), while setting this to true always cuts off audio and starts from the beginning*/
        this.alwaysReset = false;

        //Not storing audio buffer because safari will read the arrayBuffer and render it unusable later. Future use of this will be copies of the buffer.
        this.arrayBuffer = undefined;
        //Determine what the src is:
        if(typeof soundSrc == 'string'){
            //Proceed with loading the element from scratch
            fetch(soundSrc).then(file=>file.blob().then(srcBlob=>simpleAudio._makeArrayBuffer(srcBlob,e=>{
                this.arrayBuffer = e.srcElement.result;
                this.onload(this);
            })));

        }
        else if(Blob.prototype.isPrototypeOf(soundSrc)){
            //convert to arrayBuffer
            simpleAudio._makeArrayBuffer(soundSrc,e=>{
                this.arrayBuffer = e.srcElement.result;
                this.onload(this);
            });
        }
        else if(ArrayBuffer.prototype.isPrototypeOf(soundSrc)){
            //Good to go here
            this.arrayBuffer = soundSrc;
            this.isLoaded = true;
            this.onload(this);
        }
        else throw Error('Unknown format; provide me with a link to audio (string), a blob or arrayBuffer please. :)');
    },
    //Allocate resources and play the file:
    play:async function(soundObj,duration,startAt=0,volume=1){
        var makeCtx = false;
        var context;
        //Make a context if there are none, all are taken, or the sound isn't reset friendly
        if(!this.contextList.length) makeCtx = true;
        if(soundObj.playing){
            //Maxed out contexts
            if(soundObj.playing == this.contextList.length)
                makeCtx = true;
            //Stop latest sound and remove the reference. Play again.
            else if(soundObj.alwaysReset)
                this.stop(soundObj,1);
        }
        //When we figure out what context to use, play it, then reference it in the sound object.
        if(makeCtx) context = new simpleAudio._contextObj();
        else context = this._firstContextNotPlaying(soundObj);
        //If all contexts are playing, reset the oldest one
        if(soundObj.playing && (typeof context == "undefined" || context.ctx === null || this.options.limit > -1 && this.contextList.length >= this.options.limit)){
            context = soundObj.sourcesToContext.get(soundObj.linkedSources[0]);
            this.stop(soundObj,1);
        }
        context.ctx.decodeAudioData(await soundObj.arrayBuffer.slice(),data=>{
            var source = context.ctx.createBufferSource();
            var gain;
            if(volume != 1){
                gain = context.ctx.createGain();
                source.connect(gain);
                gain.gain.setValueAtTime(volume,0);
            }
            source.buffer = data;
            source.onended = ()=>simpleAudio.stop(soundObj,1);
            (volume!=1?gain:source).connect(context.ctx.destination);
            source.start(0,startAt,duration);
            
            context.soundsPlaying.set(soundObj,true);
            soundObj.sourcesToContext.set(source,context);
            soundObj.linkedSources.push(source);
            soundObj.playing++;
            
            // console.warn(soundObj);
        });

    },
    //Stop playing a sound. If count isn't defined, stop all the things
    stop:function(soundObj,count){
        var stopAt = count;
        if(!stopAt) stopAt = soundObj.playing;
        for(var i = 0;i<stopAt;i++){
            // console.warn(this.contextList);
            //To prevent a recursion error, remove the listener now that we're inside
            soundObj.linkedSources[0].onended = null;
            soundObj.linkedSources[0].stop();
            soundObj.playing--;
            soundObj.sourcesToContext.get(soundObj.linkedSources[0]).soundsPlaying.delete(soundObj);
            soundObj.sourcesToContext.delete(soundObj.linkedSources[0]);
            soundObj.linkedSources.shift();
            if(soundObj.onDonePlaying) soundObj.onDonePlaying(soundObj);
        }
    }

}