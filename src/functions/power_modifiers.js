import { global } from '../core/vars.js';
import { astrologySign, astroVal } from './astrology.js';
import { universeAffix } from './universe_utils.js';

export function powerModifier(energy){
    if (global.race.universe === 'antimatter'){
        energy *= darkEffect('antimatter');
        energy = +energy.toFixed(2);
    }
    if (astrologySign() === 'leo'){
        energy *= 1 + (astroVal('leo')[0] / 100);
        energy = +energy.toFixed(2);
    }
    return energy;
}

export function powerCostMod(energy){
    if (global.race['emfield']){
        return +(energy * 1.5).toFixed(2);
    }
    return energy;
}

export function darkEffect(universe, flag, info, inputs){
    if (!inputs) { inputs = {}; }
    let dark = inputs.dark !== undefined ? inputs.dark : global.prestige.Dark.count;
    let harmony = inputs.harmony !== undefined ? inputs.harmony : global.prestige.Harmony.count;
    let sludge = inputs.sludge !== undefined ? inputs.sludge : (global.stats.achieve['extinct_sludge'] && global.stats.achieve.extinct_sludge[universeAffix(universe)]) ? global.stats.achieve.extinct_sludge[universeAffix(universe)] : 0;

    switch (universe){
        case 'standard':
            if (global.race.universe === 'standard' || info){
                if (harmony > 0){
                    dark *= 1 + (harmony * 0.001);
                }
                if (sludge){
                    dark *= 1 + (sludge * 0.03);
                }
                return 1 + (dark / 200);
            }
            return 0;

        case 'evil':
            if (global.race.universe === 'evil' || info){
                if (harmony > 0){
                    dark *= 1 + (harmony * 0.01);
                }
                if (sludge){
                    dark *= 1 + (sludge * 0.03);
                }
                return (1 + ((Math.log2(10 + dark) - 3.321928094887362) / (flag ? 10 : 5)));
            }
            return 1;

        case 'micro':
            if (global.race.universe === 'micro' || info){
                if (flag){
                    if (harmony > 0){
                        dark *= 1 + (harmony * 0.01);
                    }
                    dark = 0.01 + (Math.log(100 + dark) - 4.605170185988092) / 35;
                    if (sludge){
                        dark *= 1 + (sludge * 0.03);
                    }
                    if (dark > 0.04){
                        dark = 0.04;
                    }
                    return +(dark).toFixed(5);
                }
                else {
                    if (harmony > 0){
                        dark *= 1 + (harmony * 0.01);
                    }
                    dark = 0.02 + (Math.log(100 + dark) - 4.605170185988092) / 20;
                    if (sludge){
                        dark *= 1 + (sludge * 0.03);
                    }
                    if (dark > 0.06){
                        dark = 0.06;
                    }
                    return +(dark).toFixed(5);
                }
            }
            return 0;

        case 'heavy':
            if (global.race.universe === 'heavy' || info){
                if (harmony > 0){
                    dark *= 1 + (harmony * 0.01);
                }
                if (sludge){
                    dark *= 1 + (sludge * 0.03);
                }
                return 0.995 ** dark;
            }
            return 1;

        case 'antimatter':
            if (global.race.universe === 'antimatter' || info){
                if (harmony > 0){
                    dark *= 1 + (harmony * 0.01);
                }
                if (sludge){
                    dark *= 1 + (sludge * 0.03);
                }
                return 1 + (Math.log(50 + dark) - 3.912023005428146) / 5;
            }
            return 0;

        case 'magic':
            if (global.race.universe === 'magic' || info){
                if (harmony > 0){
                    dark *= 1 + (harmony * 0.01);
                }
                if (sludge){
                    dark *= 1 + (sludge * 0.03);
                }
                return 1 + (Math.log(50 + dark) - 3.912023005428146) / 3;
            }
            return 0;
    }

    return 0;
}
