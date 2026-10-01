import { global } from '../core/vars.js';
import { hooks } from '../core/registries.js';



export function loneSurvivor(){
    const $ctx = {};
    if (global.race['lone_survivor']){
        hooks.loneSurvivorSetup($ctx);
    }
}

