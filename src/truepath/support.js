import { global, p_on, support_on } from '../core/vars.js';
import { calcPrestige } from '../functions/prestige_calc.js';
import { traits } from '../core/registries.js';
import { BLACKHOLE_STORAGE_BONUS_PER_LEVEL } from '../config/constants.js';
import { loc } from '../core/locale.js';

// Fungsi pendukung true-path yang berdiri sendiri (tidak menyentuh region/registry), dipisah dari truepath.js supaya region
// bisa mengimpornya tanpa circular import. tpStorageMultiplier/calcAIDrift/tauEnabled di-re-export oleh truepath.js.

export function tpStorageMultiplier(type,heavy,wiki){
    let multiplier = 1;
    if (global.race['pack_rat']){
        multiplier *= 1 + (traits.pack_rat.vars()[1] / 100);
    }
    if (global.stats.achieve['blackhole']){
        multiplier *= 1 + global.stats.achieve.blackhole.l * BLACKHOLE_STORAGE_BONUS_PER_LEVEL;
    }
    if (global.tech['world_control']){
        multiplier *= 3;
    }
    switch (type){
        case 'storehouse':
        {
            let titan_spaceport_on = wiki ? (global.space?.titan_spaceport?.on ?? 0) : p_on['titan_spaceport'];
            if (titan_spaceport_on){
                multiplier *= 1 + (titan_spaceport_on * 0.25);
            }
            if (heavy && global.tech['shelving']){
                multiplier *= 2;
            }
            if (global.tech['shelving'] && global.tech.shelving >= 3){
                multiplier *= 1.5;
            }
        }
        case 'repository':
        {
            if (global.tech['isolation']){
                multiplier *= 3;
                if (global.tech['tp_depot']){
                    multiplier *= 1 + (global.tech['tp_depot'] / 20);
                }
            }
        }
        break;
    }
    return multiplier;
}

export function calcAIDrift(wiki){
    let drift = 0;
    let ai_colonist_on = wiki ? global.space.ai_colonist.on : p_on['ai_colonist'];
    let decoder_on = wiki ? global.space.decoder.on : support_on['decoder'];
    let shock_trooper_on = wiki ? global.space.shock_trooper.on : support_on['shock_trooper'];
    let tank_on = wiki ? global.space.tank.on : support_on['tank'];
    if (ai_colonist_on && decoder_on){
        drift += ai_colonist_on * decoder_on * 0.35;
    }
    if (shock_trooper_on){
        drift += shock_trooper_on * 2;
    }
    if (tank_on){
        drift += tank_on * 2;
    }
    if (drift > 100){
        drift = 100;
    }
    return drift;
}

export function tauEnabled(){
    if (global.tech['tauceti'] && global.tech.tauceti >= 4){
        return true;
    }
    return false;
}

export function wom_recycle(v){
    if (global.tech['womling_tech'] && global.tech['womling_recycling'] && global.tech.womling_recycling >= 1){
        v *= (global.tech['isolation'] ? 0.97 : 0.98) ** global.tech.womling_tech;
    }
    return v;
}

export function wom_repulse(v){
    if (global.tech['womling_tech'] && global.tech['womling_logistics'] && global.tech.womling_logistics >= 2){
        v *= 0.94 ** global.tech.womling_tech;
    }
    return v;
}

export function matrixProjection(){
    let gains = calcPrestige('matrix');
    let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
    let skilled = global.stats.retire === global.stats.matrix + 1 ? `<div class="has-text-advanced">${loc('tau_star_matrix_skilled',[1])}</div>` : ``;
    return `<div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.plasmid,plasmidType])}</div><div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.phage,loc('resource_Phage_name')])}</div><div class="has-text-advanced">${loc('tau_star_matrix_servants',[1])}</div>${skilled}`;
}

export function edenProjection(){
    let gains = calcPrestige('eden');
    let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
    return `<div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.plasmid,plasmidType])}</div><div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.phage,loc('resource_Phage_name')])}</div><div class="has-text-advanced">${loc('tau_star_matrix_servants',[1])}</div>`;
}

export function retireProjection(){
    let gains = calcPrestige('retired');
    let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
    let skilled = global.stats.retire + 1 === global.stats.matrix ? `<div class="has-text-advanced">${loc('tau_star_matrix_skilled',[1])}</div>` : ``;
    return `<div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.plasmid,plasmidType])}</div><div class="has-text-advanced">${loc('interstellar_ascension_trigger_effect2',[gains.phage,loc('resource_Phage_name')])}</div><div class="has-text-advanced">${loc('tau_star_matrix_servants',[1])}</div>${skilled}`;
}
