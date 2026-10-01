// Produksi Mana per tick (wizard, ritual casting, dan sumber lain).
import { global, breakdown, active_rituals } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { darkEffect } from '../../functions/power_modifiers.js';
import { govEffect } from '../../civics/gov_effect.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';
import { loc } from '../../core/locale.js';
import { jobName } from '../../civics/jobs/job_name.js';
import { workerScale } from '../../civics/jobs/worker_scale.js';
import { ritual_types } from '../../industry/industry.js';
import { manaCost, maxRitualNum } from '../../industry/industry_panels.js';

export function fastLoopMana($ctx){
        // Mana
        if (global.resource.Mana.display){
            if (global.race['casting']){
                ritual_types.forEach(function (spell){
                    if (global.race.casting[spell]){
                        if (global.race.casting[spell] > 0){
                            const consume_mana = manaCost(global.race.casting[spell]);
                            const consume_mana_dt = consume_mana * $ctx.time_multiplier;
                            if (consume_mana_dt > global.resource.Mana.amount){
                                active_rituals[spell] = maxRitualNum(global.resource.Mana.amount, $ctx.time_multiplier);
                            }
                            else {
                                active_rituals[spell] = global.race.casting[spell];
                            }
                            breakdown.p.consume.Mana[loc(`modal_pylon_spell_${spell}`)] = -(consume_mana);

                            modRes('Mana', -(consume_mana_dt));
                        }
                        else {
                            active_rituals[spell] = 0;
                        }
                    }
                });
            }

            if (global.city['pylon'] || global.space['pylon'] || global.tauceti['pylon']){
                let mana_base = 0;
                let name = 'city_pylon';
                if ((global.race['cataclysm'] || global.race['orbit_decayed']) && global.space['pylon']){
                    mana_base = global.space.pylon.count * 0.005;
                    name = 'space_red_pylon';
                }
                else if (global.tech['isolation'] && global.tauceti['pylon']){
                    mana_base = global.tauceti.pylon.count * 0.0125;
                    name = 'tau_home_pylon';
                }
                else if (global.city['pylon']){
                    mana_base = global.city.pylon.count * 0.01;
                }

                mana_base *= darkEffect('magic');

                let delta = mana_base * $ctx.hunger * $ctx.global_multiplier;
                breakdown.p['Mana'][loc(name)] = mana_base+'v';

                if (global.tech['nexus']){
                    let nexus = global.tech['nexus'] * 5;
                    delta *= 1 + (nexus / 100);
                    breakdown.p['Mana'][`ᄂ${loc('arpa_projects_nexus_title')}`] = nexus+'%';
                }

                modRes('Mana', delta * $ctx.time_multiplier);
            }

            if (global.tech['cleric'] && global.civic.priest.display){
                let mana_base = workerScale(global.civic.priest.workers,'priest') * 0.0025;
                if (global.race['high_pop']){
                    mana_base = highPopAdjust(mana_base);
                }
                mana_base *= darkEffect('magic');
                let delta = mana_base * $ctx.hunger * $ctx.global_multiplier;

                breakdown.p['Mana'][jobName('priest')] = mana_base+'v';
                modRes('Mana', delta * $ctx.time_multiplier);
            }

            if (global.race.universe === 'magic' && global.civic.scientist.display){
                let mana_base = workerScale(global.civic.scientist.workers,'scientist') * 0.025;
                if (global.race['high_pop']){
                    mana_base = highPopAdjust(mana_base);
                }
                mana_base *= darkEffect('magic');

                let delta = mana_base * $ctx.hunger * $ctx.global_multiplier;
                breakdown.p['Mana'][jobName('wizard')] = mana_base+'v';

                if (global.civic.govern.type === 'magocracy'){
                    delta *= 1 + (govEffect.magocracy()[0] / 100);
                    breakdown.p['Mana'][`ᄂ${loc('govern_magocracy')}`] = govEffect.magocracy()[0] + '%';
                }

                modRes('Mana', delta * $ctx.time_multiplier);
            }

            if (global.race.universe === 'magic' && global.tech['syphon']){
                let mana_base = global.tech.syphon / 3;
                mana_base *= darkEffect('magic');

                let delta = mana_base * $ctx.hunger * $ctx.global_multiplier;
                breakdown.p['Mana'][loc('arpa_syphon_title')] = mana_base+'v';

                modRes('Mana', delta * $ctx.time_multiplier);
            }

            breakdown.p['Mana'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';
        }
}
