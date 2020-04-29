//Made by Zachary Mitchell in 2019!
//A dump of functions that could be used in other things

//Create an object that has values in one line of your code. (e.g a new dom element with values already set)
//...or just clone an object
function setObjProperties(targetObj={},appendage) {
    for(var i in appendage)
        targetObj[i] = appendage[i];
    return targetObj;
}

/*return an array of numbers that add up to the approximate number requested... with a twist
The numbers go up like a hill/curve upwards instead of an exactly divided piece*/
function swing(sum,pieces){
    if(pieces % 1 > 0) pieces = Math.ceil(pieces);

    //Negative numbers will be inversed until the end of the function:
    var negativeSum = false;
    if(sum < 0){
        negativeSum = true;
        sum = 0-sum;
    }

    else if(sum == 0){
        var resultArray = [];
        for(var i=0;i<pieces;i++)
            resultArray.push(0);
        
        return resultArray;
    }

    //For optimal swaying, we need the number to be at least >= 1. This is solved by multiplying by 10 until it's ready.
    var decimalEquation = 1;
    while(sum > 0 && sum < 1){
        sum *= 10;
        decimalEquation*=.1;
    }

    // I forgot to document this step, so here's a snippet from an experiment I did:

    /*count up until we reach total. If we can't go higher and there's numbers left over, place the remainder in the array (sorted).
    Split into X number of clumps. If the number of clumps > actual numbers, divide current results, double array size.*/
    var numArray = [];
    var forSum = 0;
    for(var i=1; forSum + i < sum; i++){
        forSum+=i;
        numArray.push(i);
    }
    if(forSum < sum)
        numArray.push(sum - forSum);
    
    //If there more pieces than indexes, divide and double entries:
    while(numArray.length < pieces){
        for(var i in numArray) numArray[i]/=2;
        numArray.push(...numArray.map(e=>e));
    }

    //Sort for a smooth swing:
    numArray.sort();
    // console.log(numArray);

    var clumps = numArray.length / pieces; //This is how many indexes we merge into one new slot of the result array.
    //If there's an odd number of slots, just add the final slot to the last clump.
    if(clumps % 1 > 0){
        clumps = Math.ceil(clumps);
    }

    var resultArray = [];
    //Finally, make the resulting numbers!
    var rAIndex = 0;
    var clumpTrack = 1;
    for(var i in numArray){
        if(!resultArray[rAIndex]) resultArray[rAIndex] = 0;
        resultArray[rAIndex]+=numArray[i];

        clumpTrack++;
        if(clumpTrack > clumps){
            clumpTrack = 1;
            // console.log(rAIndex < pieces-1);
            if(rAIndex < pieces-1) rAIndex++;
            // else console.log('hi');
        }
    }

    if(resultArray.length < pieces){
        var remainingPieces = pieces - resultArray.length;
        // console.log('pieces left:', remainingPieces);
        //The Math wasn't perfect :( What we can do is spread out some extra numbers in the array.
        var extraArray = [];
        for(var i = 0;i< remainingPieces;i++){
            var targetIndex = Math.floor((resultArray.length-1) * ( (100 / remainingPieces * (i+1)) *.01) );
            resultArray[targetIndex]/=2;
            extraArray.push(resultArray[targetIndex]);
        }


        resultArray = [...extraArray,...resultArray].sort();
        
    }

    //We're going to do allot of array mapping on this stage if conditions are weird. One function will return the numbers to what we want.
    if(negativeSum || decimalEquation !==1){
        //Nested function that depends on negativeSum and decimalEquation
        var normalizeNumbers = function(e){
            if(negativeSum) e = 0-e;
            if(decimalEquation !==1) e *= decimalEquation
            
            return e;
        }
        resultArray = resultArray.map(normalizeNumbers);
    }

    return resultArray;
}

//Tried this approach, didn't work as nicely, but fun to watch :P
function oldSwing(sum,pieces,strength = .1){
    //Check if arguments exist:
    if(sum === undefined || pieces === undefined)
        throw Error("Some arguments wern't provided");
    
    var result = [];
    //Create an array of evenly placed numbers:
    for(var i = 0; i < pieces;i++){
        if(i>0){
            var sliver = result[0] * strength;
            result[i] = sliver;
            result[0]*= 1-strength;
        }
        else{
            result.push(sum);
        }
    }

    return result;
}

/*Probably the only section of code that isn't original:
Wikipedia's example implementation of a hex converter (Wikipedia uses Creative Commons like I do):
https://en.wikipedia.org/wiki/Hexadecimal#Division-remainder_in_source_base*/
function toHex(d) {
    var r = d % 16;
    if (d - r == 0) {
      return toChar(r);
    }
    return toHex( (d - r)/16 ) + toChar(r);
  }
  
function toChar(n) {
  const alpha = "0123456789ABCDEF";
  return alpha.charAt(n);
}

function imgToDataUrl(imgTag){
    // if(!height) height = width;
    var tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = imgTag.width, tmpCanvas.height = imgTag.height;
    var tmpCanvasCtx = tmpCanvas.getContext('2d');
    tmpCanvasCtx.drawImage(imgTag,0,0,imgTag.width,imgTag.height);
    return tmpCanvas.toDataURL();
}

/*For every argument, send back something based on custom probabilty. Odds must add up to 1.
Example call: returnByChance(['item1',.3],['item2',.7]); where item 2 should pop up more frequently.*/
function returnByChance(){
    var rndNumber = Math.random();
    var totalScore = 0;
    var currValue;
    for(var i of arguments){
        totalScore+=i[1];
        currValue = i[0];
        if(totalScore >= rndNumber) break;
    }

    return currValue;
}