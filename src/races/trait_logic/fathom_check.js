import { global } from '../../core/vars.js';

export function fathomCheck(race){
    if (global.race['unfathomable'] && global.city['surfaceDwellers'] && global.city.surfaceDwellers.includes(race) && global.city['captive_housing']){
        let idx = global.city.surfaceDwellers.indexOf(race);
        let active = global.city.captive_housing[`race${idx}`];
        if (active > 100){ active = 100; }
        if (active > global.civic.torturer.workers){
            let unsupervised = active - global.civic.torturer.workers;
            active -= Math.ceil(unsupervised / 3);
        }
        let rank = (global.stats.achieve['nightmare'] && global.stats.achieve.nightmare['mg'] ? global.stats.achieve.nightmare.mg : 0) / 5;
        return active / 100 * rank;
    }
    return 0;
}
