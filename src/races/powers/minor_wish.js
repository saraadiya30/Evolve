import { minorWish_s1, minorWish_s2, minorWish_s3 } from '../../sections/wishes/minor_wish_parts.js';



export function minorWish(parent){
    const $ctx = {};
    $ctx.parent = parent;
    minorWish_s1($ctx);
        minorWish_s2($ctx);
        minorWish_s3($ctx);
}
