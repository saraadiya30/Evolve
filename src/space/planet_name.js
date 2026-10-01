// planetName: nama planet dari genus.
import { races } from '../core/registries.js';
import { global } from '../core/vars.js';
import { genusVars } from '../races/planet_data.js';

export function planetName(){
    let type = races[global.race.species].type === 'hybrid' ? global.race.maintype : races[global.race.species].type;
    let names = {
        red: races[global.race.species].solar.red,
        hell: races[global.race.species].solar.hell,
        gas: races[global.race.species].solar.gas,
        gas_moon: races[global.race.species].solar.gas_moon,
        dwarf: races[global.race.species].solar.dwarf,
        titan: genusVars[type].solar.titan,
        enceladus: genusVars[type].solar.enceladus,
        triton: genusVars[type].solar.triton,
        eris: genusVars[type].solar.eris,
    };
    if (global.race.species === 'custom'){
        for (let p of ['titan','enceladus','triton','eris']){
            if (global.custom.race0.hasOwnProperty(p)){
                names[p] = global.custom.race0[p];
            }
        }
    }
    if (global.race.species === 'hybrid'){
        for (let p of ['titan','enceladus','triton','eris']){
            if (global.custom.race1.hasOwnProperty(p)){
                names[p] = global.custom.race1[p];
            }
        }
    }
    return names;
}
