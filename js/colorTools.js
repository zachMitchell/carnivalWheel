//Made by Zachary Mitchell from 2018-2019!
/*This work is licensed under the Creative Commons Attribution 4.0 International License.
To view a copy of this license, visit http://creativecommons.org/licenses/by/4.0/
or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.*/

/*An improved version of the color techniques found in rick astley-fy.
Heavily developed through previous projects, this should allow for granular control over all your colors ^_^*/

var colorTools = {
    //return an rgb-based color string based on a percentage provided by the user:
    percentToColor:function(percentage=50,transparency=false,returnType=0,colors=[[0,0,255],[0,255,0],[255,0,0]],smoothColors = true){
        //We need a minimum of two colors; if There isn't two, we just make the second one the first:
        if (colors.length == 0 || typeof(colors) != "object"){
            console.error("A minimum of 1-2 colors is required via array format (e.g [r,g,b])");
            return undefined;
        }
        if(colors.length < 2)
            colors[1] = colors[0];
        if(percentage > 100)
            percentage=100;
        let subtractValue = 100 / (colors.length-1);
        let difference = 0;//This will represet a certain percentage of subtractValue.
        let colorIndex=0; //The color we will be transitioning from.
    
        //Add up the subtract values until we have one that's greater than (or matches) the percentage:
            for(let i=0;i<colors.length;i++){
                if(percentage >= subtractValue * i){
                    colorIndex = i;
                    difference = (subtractValue * (i+1) ) - percentage;
                }
                else break;
            }
        let resultColor=colors[colorIndex].slice(); //Make a copy of the colors array to make a new one.
        //This makes a smooth transition
        if(smoothColors){
            let colorPercent = .01 * ( (100 / subtractValue) * (subtractValue-difference));
            if(percentage!=100){
                for(let i=0;i<resultColor.length;i++){
                    resultColor[i]-=Math.floor( (resultColor[i] - colors[colorIndex+1][i]) * colorPercent );
                }
            }
        }
        //This value is optional; if returnType is > 0, you optionally get the raw values as well.
        let resultColorString;
        if(returnType!=1)
            resultColorString = "rgba("+resultColor[0]+","+resultColor[1]+","+resultColor[2]+","+(transparency?transparency:1)+")";
        return (returnType == 0?resultColorString:returnType==1?resultColor:[resultColorString,resultColor]);
    },

    //Grabs the ratio of all values inserted, and compares them.
    arrayToPercentages:function(arrayIn,rankMode = false){
        let ratioVals=[];
        //Default mode:
        if(!rankMode){
            //Compare the node count, find the largest, and make percentages based off of those numbers
            let biggestNumber = 0;
            arrayIn.forEach(element=>{
                if(element > biggestNumber)
                    biggestNumber = element;
            });
        
            arrayIn.forEach(element=>ratioVals.push((100/biggestNumber)*element))
        }
        else{
            //Percentages are based on what order the values in the given array would be in. (e.g from 1-3: 3 == 99% 1 == 33% 2 == 66%)
            let indexArray = [];
            arrayIn.forEach( (element,index)=>indexArray.push([element,index]));
            //Sort numbers from greatest to least:
            indexArray.sort((a,b)=>a[0]>b[0]);
            //Create new percentages:
            let basePercent = 100/indexArray.length;
            indexArray.forEach( (element,index) =>{
                ratioVals[element[1]] = basePercent*(index+1);
            });
        }
        return ratioVals;
    },
    
    //Javascript already can read hex; we can use that to help make a quick conversion to rgb:
    //Note to self: I seem to have programmed this to avoid "#"
    hex2RgbArray:function(hexArray){
        //Take in all hex strings from the function arguments:
        let resultArray=[];
        for(let i=0;i<hexArray.length;i++){
            let subStart = 1;
            let currArray = [];
            for(let j=0;j<3;j++){
                currArray.push( ("0x"+hexArray[i].substr(subStart,2)) *1);
                subStart+=2;
            }
            resultArray.push(currArray);
        }
        return resultArray
    },

    /*A generalized function that does basically everything.
    Insert a list of rgb arrays (or hex) in the order you want, and how many colors you want partitioned
    This will return a list of colors based on that input.*/
    generateColors:function(colorList,splitCount = 1){
        var convertedColors = [];

        {
            let hexStore=[];
            //Go through all color elements; if we have some hex, convert it:
            for(var i of colorList){
                if(typeof i == 'object' && typeof i.length == 'number') //Assume this is an array
                    convertedColors.push(i);
                else if(typeof i == 'string')
                    hexStore.push(i);
            }
            if(hexStore.length)
                convertedColors.push(...colorTools.hex2RgbArray(hexStore));
        }

        var percentSplit = 100 / (splitCount-1);
        var currPercent = 0;
        var resultArray = [];

        for(var i = 0;i<splitCount;i++){
            resultArray.push(colorTools.percentToColor(currPercent,false,1,convertedColors));
            currPercent+=percentSplit;
        }

        return resultArray;
    }
}