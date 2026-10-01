// Isi: genCivName(), costMultiplier(), spaceCostMultiplier(), harmonyEffect(), timeCheck(), arpaTimeCheck(), clearElement(), vBind(), timeFormat(), powerModifier(), powerCostMod(), calcQuantumLevel(), get_qlevel(), darkEffect()
import { global } from '../core/vars.js';
import { races } from '../core/registries.js';
import { loc } from '../core/locale.js';

// Fungsi-fungsi dipindah dari functions.js (urutan sumber dipertahankan). functions.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function genCivName(alt){
    let genus = global.race.maintype || races[global.race.species].type;
    switch (genus){
        case 'animal':
            genus = 'animalism';
            break;
        case 'small':
            genus = 'dwarfism';
            break;
        case 'giant':
            genus = 'gigantism';
            break;
        case 'avian':
        case 'reptilian':
            genus = 'eggshell';
            break;
        case 'fungi':
            genus = 'chitin';
            break;
        case 'insectoid':
            genus = 'athropods';
            break;
        case 'angelic':
            genus = 'celestial';
            break;
        case 'organism':
            genus = 'sentience';
            break;
    }

    const filler = alt ? [
        loc(`civics_gov_tp_name0`),
        loc(`civics_gov_tp_name1`),
        loc(`civics_gov_tp_name2`),
        loc(`civics_gov_tp_name3`),
        loc(`civics_gov_tp_name4`),
        loc(`civics_gov_tp_name5`),
        loc(`civics_gov_tp_name6`),
        loc(`civics_gov_tp_name7`),
        loc(`civics_gov_tp_name8`),
        loc(`civics_gov_tp_name9`),
    ] : [
        races[global.race.species].name,
        races[global.race.species].home,
        loc(`biome_${global.city.biome}_name`),
        loc(`evo_${genus}_title`),
        loc(`civics_gov_name0`),
        loc(`civics_gov_name1`),
        loc(`civics_gov_name2`),
        loc(`civics_gov_name3`),
        loc(`civics_gov_name4`),
        loc(`civics_gov_name5`),
        loc(`civics_gov_name6`),
        loc(`civics_gov_name7`),
        loc(`civics_gov_name8`),
        loc(`civics_gov_name9`),
        loc(`civics_gov_name10`),
        loc(`civics_gov_name11`),
    ];

    return {
        s0: Math.rand(0,14),
        s1: filler[Math.rand(0,filler.length)]
    };
}













