//Made by Zachary Mitchell in 2019!
//A dump of functions that could be used in other things

function setObjProperties(targetObj,appendage){
    for(var i in appendage)
        targetObj[i] = appendage[i];
    return targetObj;
}

/*return an array of numbers that add up to the approximate number requested... with a twist
The numbers go up like a hill/curve upwards instead of an exactly divided piece*/
function swing(sum,pieces,strength = .1){
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