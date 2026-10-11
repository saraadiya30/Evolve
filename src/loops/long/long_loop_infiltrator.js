// Infiltrator dan moldling: pencurian tech per detik. Dulu bagian dari longLoop_s2.
import { global } from '../../core/vars.js';
import { defineIndustry } from '../../industry/industry_smelter.js';
import { actions, hooks, traits } from '../../core/registries.js';
import { drawTech } from '../../actions/core/action_runner.js';
import { checkTechRequirements } from '../../actions/challenge/tech_requirements.js';
import { initStruct } from '../../actions/core/structure_ui.js';
import { fathomCheck } from '../../races/trait_logic/fathom_check.js';
import { messageQueue } from '../../functions/message_log.js';
import { loc } from '../../core/locale.js';
import { loadFoundry } from '../../civics/jobs/foundry_panel.js';
import { govTitle } from '../../civics/military/gov_calc.js';

export function longLoopInfiltrator($ctx){
        if (global.race['infiltrator']){
            let tech_source = global.tech['world_control'] ? `trait_infiltrator_steal_alt` : `trait_infiltrator_steal`;
            let know_adjust = traits.infiltrator.vars()[0] / 100;
            if (global.resource.Knowledge.max >= (actions.tech.steel.cost.Knowledge() * know_adjust) && !global.race['steelen'] && global.tech['smelting'] && global.tech.smelting === 1){
                messageQueue(loc(tech_source,[loc('tech_steel')]),'info',false,['progress']);
                global.resource.Steel.display = true;
                global.tech.smelting = 2;
                defineIndustry();
                drawTech();
            }
            if (global.resource.Knowledge.max >= (actions.tech.electricity.cost.Knowledge() * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 1){
                messageQueue(loc(tech_source,[loc('tech_electricity')]),'info',false,['progress']);
                global.tech.high_tech = 2;
                global.city['power'] = 0;
                global.city['powered'] = true;
                initStruct(actions.city.coal_power);
                global.settings.showPowerGrid = true;
                hooks.setPowerGrid();
                drawTech();
                hooks.drawCity();
            }
            if (global.resource.Knowledge.max >= (actions.tech.electronics.cost.Knowledge() * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 3 && global.tech['titanium']){
                messageQueue(loc(tech_source,[loc('tech_electronics')]),'info',false,['progress']);
                global.tech.high_tech = 4;
                if (global.race['terrifying']){
                    global.tech['gambling'] = 1;
                    initStruct(actions.city.casino);
                    initStruct(actions.space.spc_hell.spc_casino);
                }
                drawTech();
                hooks.drawCity();
            }
            if (global.resource.Knowledge.max >= (actions.tech.fission.cost.Knowledge() * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 4 && global.tech['uranium']){
                messageQueue(loc(tech_source,[loc('tech_fission')]),'info',false,['progress']);
                global.tech.high_tech = 5;
                initStruct(actions.city.fission_power);
                drawTech();
                hooks.drawCity();
            }
            if (global.resource.Knowledge.max >= (actions.tech.rocketry.cost.Knowledge() * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 6){
                messageQueue(loc(tech_source,[loc('tech_rocketry')]),'info',false,['progress']);
                global.tech.high_tech = 7;
                if (global.race['truepath'] && !global.tech['rival']){
                    global.tech['rival'] = 1;
                    messageQueue(loc(`civics_rival_unlocked`,[govTitle(3)]),'info',false,['progress','combat']);
                }
                hooks.arpa('Physics');
                drawTech();
                hooks.drawCity();
            }
            if (global.resource.Knowledge.max >= (actions.tech.artifical_intelligence.cost.Knowledge() * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 9){
                messageQueue(loc(tech_source,[loc('tech_artificial_intelligence')]),'info',false,['progress']);
                global.tech.high_tech = 10;
                drawTech();
                hooks.drawCity();
            }
            if (global.resource.Knowledge.max >= (actions.tech.quantum_computing.cost.Knowledge() * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 10 && global.tech['nano']){
                messageQueue(loc(tech_source,[loc('tech_quantum_computing')]),'info',false,['progress']);
                global.tech.high_tech = 11;
                drawTech();
                hooks.drawCity();
            }
            if (
                global.resource.Knowledge.max >= (actions.tech[global.race['truepath'] ? 'virtual_reality_tp' : 'virtual_reality'].cost.Knowledge() * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 11 && global.tech['stanene']
                    && ((global.tech['infernite'] && global.tech['alpha'] && global.tech['alpha'] >= 2) || (global.race['truepath']))
                ){
                messageQueue(loc(tech_source,[loc('tech_virtual_reality')]),'info',false,['progress']);
                global.tech.high_tech = 12;
                drawTech();
                hooks.drawCity();
            }
            if (global.race['truepath']){
                if (global.resource.Knowledge.max >= (actions.tech.quantium.cost.Knowledge() * know_adjust) && global.tech['supercollider'] && global.tech.supercollider >= 10 && global.tech['enceladus'] && global.tech.enceladus >= 3 && !global.tech['quantium']){
                    messageQueue(loc(tech_source,[loc('tech_quantium')]),'info',false,['progress']);
                    global.tech['quantium'] = 1;
                    global.resource.Quantium.display = true;
                    drawTech();
                    loadFoundry();
                }
                if (global.resource.Knowledge.max >= (actions.tech.alien_biotech.cost.Knowledge() * know_adjust) && global.tech['genetics'] && global.tech.genetics >= 8 && global.tech['kuiper'] && !global.tech['biotech']){
                    messageQueue(loc(tech_source,[loc('tech_alien_biotech')]),'info',false,['progress']);
                    global.tech['biotech'] = 1;
                    drawTech();
                }
            }
            else {
                if (global.resource.Knowledge.max >= (actions.tech.shields.cost.Knowledge() * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 13){
                    messageQueue(loc(tech_source,[loc('tech_shields')]),'info',false,['progress']);
                    global.tech.high_tech = 14;
                    global.settings.space.neutron = true;
                    global.settings.space.blackhole = true;
                    drawTech();
                    hooks.drawCity();
                }
                if (global.resource.Knowledge.max >= (actions.tech.ai_core.cost.Knowledge() * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 14 && global.tech['blackhole'] && global.tech['blackhole'] >= 3){
                    messageQueue(loc(tech_source,[loc('tech_ai_core')]),'info',false,['progress']);
                    global.tech.high_tech = 15;
                    initStruct(actions.interstellar.int_neutron.citadel);
                    drawTech();
                    hooks.drawCity();
                }
                if (global.resource.Knowledge.max >= (actions.tech.graphene_processing.cost.Knowledge() * know_adjust) && global.tech['ai_core'] && global.tech.ai_core === 2){
                    messageQueue(loc(tech_source,[loc('tech_graphene_processing')]),'info',false,['progress']);
                    global.tech.ai_core = 3;
                    drawTech();
                }
                if (global.resource.Knowledge.max >= (actions.tech.nanoweave.cost.Knowledge() * know_adjust) && global.tech['science'] && global.tech.science >= 18 && !global.tech['nanoweave']){
                    messageQueue(loc(tech_source,[loc('tech_nanoweave')]),'info',false,['progress']);
                    global.tech['nanoweave'] = 1;
                    global.resource.Nanoweave.display = true;
                    drawTech();
                    loadFoundry();
                }
                if (global.resource.Knowledge.max >= (actions.tech.orichalcum_analysis.cost.Knowledge() * know_adjust) && global.tech['high_tech'] && global.tech.high_tech === 16 && global.tech['chthonian'] && global.tech['chthonian'] >= 3){
                    messageQueue(loc(tech_source,[loc('tech_orichalcum_analysis')]),'info',false,['progress']);
                    messageQueue(loc('tech_orichalcum_analysis_result'),'info',false,['progress']);
                    global.tech.high_tech = 17;
                    drawTech();
                    hooks.drawCity();
                }
                if (global.resource.Knowledge.max >= (actions.tech.infernium_fuel.cost.Knowledge() * know_adjust) && global.tech['smelting'] && global.tech.smelting === 7 && global.tech['hell_ruins'] && global.tech['hell_ruins'] >= 4){
                    messageQueue(loc(tech_source,[loc('tech_infernium_fuel')]),'info',false,['progress']);
                    global.tech.smelting = 8;
                    defineIndustry();
                    drawTech();
                }
            }
        }

        let moldFathom = fathomCheck('moldling');
        if (moldFathom > 0){
            let tech_source = `trait_infiltrator_thrall`;
            let know_adjust = 1 - (100 - traits.infiltrator.vars(1)[0]) * moldFathom / 100;
            if (moldFathom >= 0.02 && global.resource.Knowledge.max >= (actions.tech.smelting.cost.Knowledge() * know_adjust) && checkTechRequirements('smelting',false) && !global.tech['smelting']){
                messageQueue(loc(tech_source,[loc('tech_smelting')]),'info',false,['progress']);
                global.tech['smelting'] = 1;
                initStruct(actions.city.smelter);
                if (global.race['steelen']){
                    global.tech['smelting'] = 2;
                }
                drawTech();
                hooks.drawCity();
            }
            if (moldFathom >= 0.04 && global.resource.Knowledge.max >= (actions.tech.dynamite.cost.Knowledge() * know_adjust) && checkTechRequirements('dynamite',false) && global.tech['explosives'] && global.tech.explosives === 1){
                messageQueue(loc(tech_source,[loc('tech_dynamite')]),'info',false,['progress']);
                global.tech.explosives = 2;
                drawTech();
            }
            if (moldFathom >= 0.08 && global.resource.Knowledge.max >= (actions.tech.portland_cement.cost.Knowledge() * know_adjust) && checkTechRequirements('portland_cement',false) && global.tech['cement'] && global.tech.cement === 3){
                messageQueue(loc(tech_source,[loc('tech_portland_cement')]),'info',false,['progress']);
                global.tech.cement = 4;
                drawTech();
            }
            if (moldFathom >= 0.12 && global.resource.Knowledge.max >= (actions.tech.oxygen_converter.cost.Knowledge() * know_adjust) && checkTechRequirements('oxygen_converter',false) && global.tech['smelting'] && global.tech.smelting === 4){
                messageQueue(loc(tech_source,[loc('tech_oxygen_converter')]),'info',false,['progress']);
                global.tech.smelting = 5;
                drawTech();
            }
            if (moldFathom >= 0.15 && global.resource.Knowledge.max >= (actions.tech.machinery.cost.Knowledge() * know_adjust) && checkTechRequirements('machinery',false) && global.tech['foundry'] && global.tech.foundry === 6){
                messageQueue(loc(tech_source,[loc('tech_machinery')]),'info',false,['progress']);
                global.tech.foundry = 7;
                drawTech();
            }
            if (moldFathom >= 0.20 && global.resource.Knowledge.max >= (actions.tech.uranium_storage.cost.Knowledge() * know_adjust) && checkTechRequirements('uranium_storage',false) && global.tech['uranium'] && global.tech.uranium === 1){
                messageQueue(loc(tech_source,[loc('tech_uranium_storage')]),'info',false,['progress']);
                global.tech.uranium = 1;
                drawTech();
            }
            if (moldFathom >= 0.25 && global.resource.Knowledge.max >= (actions.tech.synthetic_fur.cost.Knowledge() * know_adjust) && checkTechRequirements('synthetic_fur',false) && !global.tech['synthetic_fur']){
                messageQueue(loc(tech_source,[actions.tech.synthetic_fur.title()]),'info',false,['progress']);
                global.tech['synthetic_fur'] = 1;
                drawTech();
            }
            if (moldFathom >= 0.35 && global.resource.Knowledge.max >= (actions.tech.rover.cost.Knowledge() * know_adjust) && checkTechRequirements('rover',false) && global.tech['space_explore'] && global.tech.space_explore === 1){
                messageQueue(loc(tech_source,[loc('tech_rover')]),'info',false,['progress']);
                global.tech.space_explore = 2;
                global.settings.space.moon = true;
                global.space['moon_base'] = {
                    count: 0,
                    on: 0,
                    support: 0,
                    s_max: 0
                };
                drawTech();
            }
            let late_tech_source = `trait_infiltrator_thrall_alt`;
            if (moldFathom >= 0.4 && global.resource.Knowledge.max >= (actions.tech.starcharts.cost.Knowledge() * know_adjust) && checkTechRequirements('starcharts',false) && global.tech['space_explore'] && global.tech.space_explore === 3){
                messageQueue(loc(late_tech_source,[loc('tech_starcharts')]),'info',false,['progress']);
                global.tech.space_explore = 4;
                drawTech();
            }
            if (moldFathom >= 0.5 && global.resource.Knowledge.max >= (actions.tech.nano_tubes.cost.Knowledge() * know_adjust) && checkTechRequirements('nano_tubes',false) && !global.tech['nano']){
                messageQueue(loc(late_tech_source,[loc('tech_nano_tubes')]),'info',false,['progress']);
                global.tech['nano'] = 1;
                global.resource.Nano_Tube.display = true;
                drawTech();
            }
            if (global.race['truepath']){
                if (moldFathom >= 0.65 && global.resource.Knowledge.max >= (actions.tech.stanene_tp.cost.Knowledge() * know_adjust) && checkTechRequirements('stanene_tp',false) && !global.tech['stanene']){
                    messageQueue(loc(late_tech_source,[loc('tech_stanene')]),'info',false,['progress']);
                    global.tech['stanene'] = 1;
                    global.resource.Stanene.display = true;
                    drawTech();
                }
                if (moldFathom >= 0.8 && global.resource.Knowledge.max >= (actions.tech.anitgrav_bunk.cost.Knowledge() * know_adjust) && checkTechRequirements('anitgrav_bunk',false) && global.tech['marines'] && global.tech.marines === 1){
                    messageQueue(loc(late_tech_source,[loc('tech_anitgrav_bunk')]),'info',false,['progress']);
                    global.tech.marines = 2;
                    drawTech();
                }
            }
            else {
                if (moldFathom >= 0.65 && global.resource.Knowledge.max >= (actions.tech.stanene.cost.Knowledge() * know_adjust) && checkTechRequirements('stanene',false) && !global.tech['stanene']){
                    messageQueue(loc(late_tech_source,[loc('tech_stanene')]),'info',false,['progress']);
                    global.tech['stanene'] = 1;
                    global.resource.Stanene.display = true;
                    drawTech();
                }
                if (moldFathom >= 0.78 && global.resource.Knowledge.max >= (actions.tech.hydroponics.cost.Knowledge() * know_adjust) && checkTechRequirements('hydroponics',false) && global.tech['mars'] && global.tech.mars === 5){
                    messageQueue(loc(late_tech_source,[loc('tech_hydroponics')]),'info',false,['progress']);
                    global.tech.mars = 6;
                    drawTech();
                }
                if (moldFathom >= 0.92 && global.resource.Knowledge.max >= (actions.tech.orichalcum_panels.cost.Knowledge() * know_adjust) && checkTechRequirements('orichalcum_panels',false) && global.tech['swarm'] && global.tech.swarm === 5){
                    messageQueue(loc(late_tech_source,[loc('tech_orichalcum_panels')]),'info',false,['progress']);
                    global.tech.swarm = 6;
                    drawTech();
                }
                if (moldFathom >= 1 && global.resource.Knowledge.max >= (actions.tech.cybernetics.cost.Knowledge() * know_adjust) && checkTechRequirements('cybernetics',false) && global.tech['high_tech'] && global.tech.high_tech === 17){
                    messageQueue(loc(late_tech_source,[loc('tech_cybernetics')]),'info',false,['progress']);
                    global.tech.high_tech = 18;
                    drawTech();
                }
            }
        }
}
