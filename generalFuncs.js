//Made by Zachary Mitchell in 2019!
//A dump of functions that could be used in other things

function setObjProperties(targetObj,appendage){
    for(var i in appendage)
        targetObj[i] = appendage[i];
    return targetObj;
}

/*return an array of numbers that add up to the approximate number requested... with a twist
The numbers go up like a hill/curve upwards instead of an exactly divided piece*/
function swing(sum,pieces,goUpTo){
    //Check if arguments exist:
    if(sum === undefined || pieces === undefined)
        throw Error("Some arguments wern't provided");
    if(goUpTo === undefined)
        goUpTo = pieces;
    
    var result = [];
    //Create an array of evenly placed numbers:
    for(var i = 0; i < goUpTo;i++){
        var gradualNum = sum / pieces;
        result.push(gradualNum);
        sum-=gradualNum;
    }

    return result;
}