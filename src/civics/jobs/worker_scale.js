// workerScale / teamsterCap: skala pekerja dan batas teamster.
import { global } from '../../core/vars.js';
import { traits } from '../../core/registries.js';
import { govActive } from '../../governor/gov_active.js';

export function workerScale(num,job){
    if (global.race['strong'] && ['hunter','forager','farmer','lumberjack','quarry_worker','crystal_miner','scavenger'].includes(job)){
        num *= traits.strong.vars()[1];
    }
    if ((global.race['swift'] || global.race['living_tool']) && ['hunter','forager','farmer','lumberjack','quarry_worker','crystal_miner','scavenger'].includes(job)){
        num *= traits.strong.vars(0.25)[1];
    }
    let teacher = govActive('teacher',1);
    if(teacher && ['professor'].includes(job)){
        num *= 1 + (teacher / 100);
    }
    if (global.race['lone_survivor']){
        if (['hunter','forager','farmer','lumberjack','quarry_worker','crystal_miner','scavenger'].includes(job)){
            num *= 80;
        }
        else if (['craftsman'].includes(job)){
            num *= 60;
        }
        else if (['miner','coal_miner','cement_worker','banker','entertainer','priest','pit_miner'].includes(job)){
            num *= 45;
        }
        else if (['professor','scientist'].includes(job)){
            num *= 125;
        }
    }
    return num;
}

export function teamsterCap(){
    let transport = 0;
    if (global.race['gravity_well']){
        transport = global.tech['transport'] ? global.tech.transport : 0;
        transport = Math.round(global.race.teamster / transport * 1.5);
    }
    if (global.tech['railway']){
        transport -= global.tech['railway'] * 2;
    }
    if (transport < 0){ transport = 0; }
    return transport;
}
