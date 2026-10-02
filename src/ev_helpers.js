import { loc } from './locale.js';
import { global } from './vars.js';

// Dipindah dari events.js: dipakai saat LOAD oleh file bagian (events parts), jadi tidak boleh bergantung pada body events.js.

export function basicEvent(title,tech,func,cond){
    return {
        reqs: {
            tech: tech,
        },
        condition(){
            let val = true;
            if (typeof cond === 'function'){
                val = cond();
            }
            return val;
        },
        type: 'minor',
        effect(){
            let val = false;
            if (typeof func === 'function'){
                val = func();
            }
            return val ? loc(`event_${title}`,[val]) : loc(`event_${title}`);
        }
    };
}

export function slaveLoss(type,string){
    return {
        reqs: { 
            trait: 'slaver',
            tech: 'slaves'
        },
        condition(){
            return global.race['cataclysm'] || global.race['orbit_decayed'] || global.tech['isolation'] ? false : true;
        },
        type: type,
        effect(){
            if (global.city['slave_pen'] && global.resource.Slave.amount > 0){
                global.resource.Slave.amount--;
                return loc(`event_slave_${string}`);
            }
            else {
                return loc('event_slave_none');
            }
        }
    };
}
