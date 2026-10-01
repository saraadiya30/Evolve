
export function deepClone(obj){
    //in case of premitives
    if(obj===null || typeof obj !== "object"){
        return obj;
    }

    //date objects should be
    if(obj instanceof Date){
        return new Date(obj.getTime());
    }

    //handle Array
    if(Array.isArray(obj)){
        let clonedArr = [];
        obj.forEach(function(element){
            clonedArr.push(deepClone(element))
        });
        return clonedArr;
    }

    //lastly, handle objects
    let clonedObj = new obj.constructor();
    for(let prop in obj){
        if(obj.hasOwnProperty(prop)){
            clonedObj[prop] = deepClone(obj[prop]);
        }
    }
    return clonedObj;
}
