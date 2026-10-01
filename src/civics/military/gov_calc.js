// govTitle / govPrice / spyCost / trainSpy / govRelationFactor: kalkulasi pemerintahan asing dan mata-mata.
import { global } from '../../core/vars.js';
import { genCivName } from '../../functions/civ_name.js';
import { loc } from '../../core/locale.js';
import { astrologySign, astroVal } from '../../functions/astrology.js';

export function govTitle(id){
    if (typeof global.civic.foreign[`gov${id}`]['name'] === "undefined"){
        let nameFrags = genCivName();
        global.civic.foreign[`gov${id}`]['name'] = {
            s0: nameFrags.s0,
            s1: nameFrags.s1
        };
    }

    return loc(`civics_gov${global.civic.foreign[`gov${id}`].name.s0}`,[global.civic.foreign[`gov${id}`].name.s1]);
}

export function govPrice(gov){
    let price = global.civic.foreign[`gov${gov}`].eco * 15384;
    price *= 1 + global.civic.foreign[`gov${gov}`].hstl * 1.6 / 100;
    price *= 1 - global.civic.foreign[`gov${gov}`].unrest * 0.25 / 100;
    return +price.toFixed(0);
}

export function spyCost(i){
    let base = Math.round((global.civic.foreign[`gov${i}`].mil / 2) + (global.civic.foreign[`gov${i}`].hstl / 2) - global.civic.foreign[`gov${i}`].unrest) + 10;
    if (base < 50){
        base = 50;
    }
    if (global.race['infiltrator']){
        base /= 3;
    }
    if (astrologySign() === 'scorpio'){
        base *= 1 - (astroVal('scorpio')[0] / 100);
    }
    return Math.round(base ** (global.civic.foreign[`gov${i}`].spy + 1)) + 500;
}

export function trainSpy(i){
    if (global.tech['spy'] && global.civic.foreign[`gov${i}`].trn === 0){
        let cost = spyCost(i)
        if (global.resource.Money.amount >= cost){
            global.resource.Money.amount -= cost;
            let time = 300;
            if (global.tech['spy'] >= 3 && global.city['boot_camp']){
                time -= (global.race['orbit_decayed'] && global.space['space_barracks'] ? global.space.space_barracks.on : global.city['boot_camp'].count) * 10;
                if (time < 10){
                    time = 10;
                }
            }
            if (global.race['infiltrator']){
                time = Math.round(time / 2);
            }
            global.civic.foreign[`gov${i}`].trn = time;
        }
    }
}

export function govRelationFactor(id){
    if (global.race['truepath']){
        if (global.civic.foreign[`gov${id}`].hstl < 10){
            return 1 + (10 - global.civic.foreign[`gov${id}`].hstl) / 40;
        }
        else if (global.civic.foreign[`gov${id}`].hstl > 60){
            return 1 - (-60 + global.civic.foreign[`gov${id}`].hstl) / 160;
        }
    }
    return 1;
}
