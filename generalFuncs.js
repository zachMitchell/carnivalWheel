//Made by Zachary Mitchell in 2019!
//A dump of functions that could be used in other things

function setObjProperties(targetObj,appendage){
    for(var i in appendage)
        targetObj[i] = appendage[i];
    return targetObj;
}

/*return an array of numbers that add up to the approximate number requested... with a twist
The numbers go up like a hill/curve upwards instead of an exactly divided piece*/
//Intended for use with sums >=1. I think it would theoretically work with other numbers (like decimals < 1), but it most likely wouldn't swing.
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

    return negativeSum? resultArray.map(e=>0-e):resultArray;
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