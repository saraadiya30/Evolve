import { global, p_on, quantum_level } from '../core/vars.js';
import { traits } from '../core/registries.js';

export function calcQuantumLevel(load){
    if (global.tech['high_tech'] && global.tech['high_tech'] >= 11){
        let k_base = global.resource.Knowledge.max;
        let k_inc = 250000;
        let qbits = 0;
        while (k_base > k_inc){
            k_base -= k_inc;
            k_inc *= 1.1;
            qbits++;
        }
        qbits += +(k_base / k_inc).toFixed(2);
        if (global.interstellar['citadel']){
            let citadel = load ? global.interstellar.citadel.on : p_on['citadel']
            if (global.tech['high_tech'] && global.tech['high_tech'] >= 15 && citadel > 0){
                qbits *= 1 + (citadel * 0.05);
            }
        }
        if (global.space['ai_core2']){
            let core = load ? global.space.ai_core2.on : p_on['ai_core2']
            if (global.tech['titan_ai_core'] && core > 0){
                qbits *= 1.25;
            }
        }
        if (global.stats.achieve['obsolete'] && global.stats.achieve[`obsolete`].l >= 5 && global.prestige.AICore.count > 0){
            qbits *= 2 - (0.99 ** global.prestige.AICore.count);
        }
        if (global.race['linked']){
            let factor = traits.linked.vars()[0] / 100 * global.resource[global.race.species].amount;
            if (factor > traits.linked.vars()[1] / 100){
                factor -= traits.linked.vars()[1] / 100;
                factor = factor / (factor + 200 - traits.linked.vars()[1]);
                factor += traits.linked.vars()[1] / 100;
            }
            qbits *= 1 + factor;
        }
        return +(qbits).toFixed(3);
    }
    return 0;
}

export function get_qlevel(wiki){
    return wiki ? calcQuantumLevel(wiki) : quantum_level;
}
