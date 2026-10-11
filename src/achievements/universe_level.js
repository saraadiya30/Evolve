// universeLevel: total level achievement (umum dan per-universe). Modul daun: hanya bergantung pada core (vars, registries) dan functions/universe_utils, supaya functions/prestige_calc.js tidak meng-import achievement_logic.js.
import { global } from '../core/vars.js';
import { universeAffix } from '../functions/universe_utils.js';
import { achievements } from '../core/registries.js';

export function universeLevel(universe){
    universe = universe || global.race.universe;
    let affix = universeAffix(universe);
    let lvl = 0;
    let ulvl = 0;
    Object.keys(achievements).forEach(function (achievement){
        if (global.stats.achieve[achievement]){
            lvl += global.stats.achieve[achievement].l > 5 ? 5 : global.stats.achieve[achievement].l;
            if (global.stats.achieve[achievement][affix]){
                ulvl += global.stats.achieve[achievement][affix] > 5 ? 5 : global.stats.achieve[achievement][affix];
            }
        }
    });
    return { aLvl: lvl, uLvl: ulvl };
}
