// Produksi womling (tau red) per tick.
import { global, breakdown } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { production } from '../../resources/prod.js';
import { loc } from '../../core/locale.js';

export function fastLoopWomlingProduction($ctx){
        // Womling Production
        if (global.race['truepath'] && global.tech['tau_red'] && global.tech.tau_red >= 5){
            if (global.tauceti['womling_mine'] && global.tauceti['overseer']){
                let miner_base = global.tauceti.womling_mine.miners * production('womling_mine','unobtainium') * production('psychic_boost','Unobtainium');
                let prod = global.tauceti.overseer.prod / 100;
                let miner_delta = miner_base * prod * $ctx.global_multiplier;

                breakdown.p['Unobtainium'][loc('tau_red_womlings')] = miner_base + 'v';
                if (miner_base > 0){
                    breakdown.p['Unobtainium'][`ᄂ${loc('tau_red_womling_prod_label')}`] = -((1 - prod) * 100) + '%';
                }
                modRes('Unobtainium', miner_delta * $ctx.time_multiplier);

                if (global.tech['isolation']){
                    let uranium_base = global.tauceti.womling_mine.miners * production('womling_mine','uranium') * production('psychic_boost','Uranium');
                    breakdown.p['Uranium'][loc('tau_red_womlings')] = uranium_base + 'v';
                    let uranium_delta = uranium_base * prod * $ctx.global_multiplier;

                    if (uranium_base > 0){
                        breakdown.p['Uranium'][`ᄂ${loc('tau_red_womling_prod_label')}`] = -((1 - prod) * 100) + '%';
                    }
                    modRes('Uranium', uranium_delta * $ctx.time_multiplier);

                    let titanium_base = global.tauceti.womling_mine.miners * production('womling_mine','titanium') * production('psychic_boost','Titanium');
                    breakdown.p['Titanium'][loc('tau_red_womlings')] = titanium_base + 'v';
                    let titanium_delta = titanium_base * prod * $ctx.shrineMetal.mult * $ctx.global_multiplier;

                    if (titanium_base > 0){
                        breakdown.p['Titanium'][`ᄂ${loc('tau_red_womling_prod_label')}`] = -((1 - prod) * 100) + '%';
                    }
                    modRes('Titanium', titanium_delta * $ctx.time_multiplier);

                    if (global.race['lone_survivor']){
                        let copper_base = global.tauceti.womling_mine.miners * production('womling_mine','copper') * production('psychic_boost','Copper');
                        breakdown.p['Copper'][loc('tau_red_womlings')] = copper_base + 'v';
                        let copper_delta = copper_base * prod * $ctx.shrineMetal.mult * $ctx.global_multiplier;

                        if (copper_delta > 0){
                            breakdown.p['Copper'][`ᄂ${loc('tau_red_womling_prod_label')}`] = -((1 - prod) * 100) + '%';
                        }
                        modRes('Copper', copper_delta * $ctx.time_multiplier);

                        let alumina_base = global.tauceti.womling_mine.miners * production('womling_mine','aluminium') * production('psychic_boost','Aluminium');
                        breakdown.p['Aluminium'][loc('tau_red_womlings')] = alumina_base + 'v';
                        let alumina_delta = alumina_base * prod * $ctx.shrineMetal.mult * $ctx.global_multiplier;

                        if (alumina_base > 0){
                            breakdown.p['Aluminium'][`ᄂ${loc('tau_red_womling_prod_label')}`] = -((1 - prod) * 100) + '%';
                        }
                        modRes('Aluminium', alumina_delta * $ctx.time_multiplier);

                        let iridium_base = global.tauceti.womling_mine.miners * production('womling_mine','iridium') * production('psychic_boost','Iridium');
                        breakdown.p['Iridium'][loc('tau_red_womlings')] = iridium_base + 'v';
                        let iridium_delta = iridium_base * prod * $ctx.hunger * $ctx.shrineMetal.mult * $ctx.global_multiplier;

                        if (iridium_base > 0){
                            breakdown.p['Iridium'][`ᄂ${loc('tau_red_womling_prod_label')}`] = -((1 - prod) * 100) + '%';
                        }
                        modRes('Iridium', iridium_delta * $ctx.time_multiplier);

                        let neutronium_base = global.tauceti.womling_mine.miners * production('womling_mine','neutronium') * production('psychic_boost','Neutronium');
                        breakdown.p['Neutronium'][loc('tau_red_womlings')] = neutronium_base + 'v';
                        let neutronium_delta = neutronium_base * prod * $ctx.hunger * $ctx.global_multiplier;

                        if (neutronium_base > 0){
                            breakdown.p['Neutronium'][`ᄂ${loc('tau_red_womling_prod_label')}`] = -((1 - prod) * 100) + '%';
                        }
                        modRes('Neutronium', neutronium_delta * $ctx.time_multiplier);
                    }
                }
            }
        }
}
