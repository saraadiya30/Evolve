// Produksi Knowledge dan Omniscience per tick (sundial dan lainnya), plus reset $ctx.FactoryMoney.
import { global, breakdown, p_on, support_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { messageQueue } from '../../functions/message_log.js';
import { traits, actions, S_loops as S } from '../../core/registries.js';
import { planetTraits } from '../../races/planet_data.js';
import { fathomCheck } from '../../races/trait_logic/fathom_check.js';
import { racialTrait } from '../../races/trait_logic/racial_traits.js';
import { govActive } from '../../governor/gov_active.js';
import { govEffect } from '../../civics/gov_effect.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';
import { loc } from '../../core/locale.js';
import { faithTempleCount } from '../../resources/aether_alchemy.js';
import { astroVal } from '../../functions/astrology.js';
import { drawTech } from '../../actions/core/action_runner.js';
import { jobName } from '../../civics/jobs/job_name.js';
import { workerScale } from '../../civics/jobs/worker_scale.js';
import { sequenceLabs } from '../../arpa/arpa_projects.js';

export function fastLoopKnowledge($ctx){
        // Knowledge
        { //block scope
            let sundial_base = global.tech['primitive'] && global.tech['primitive'] >= 3 ? 1 : 0;
            if (global.race['ancient_ruins']){
                sundial_base++;
            }
            if (global.stats.achieve['extinct_junker'] && global.stats.achieve['extinct_junker'].l >= 1){
                sundial_base++;
            }
            if (global.city.ptrait.includes('magnetic')){
                sundial_base += planetTraits.magnetic.vars()[0];
            }
            if (global.race['ascended']){
                sundial_base += 2;
            }

            let professors_base = workerScale(global.civic.professor.workers,'professor');
            let prof_impact = global.race['studious'] ? global.civic.professor.impact + traits.studious.vars()[0] : global.civic.professor.impact;
            let fathom = fathomCheck('elven');
            if (fathom > 0){
                prof_impact += traits.studious.vars(1)[0] * fathom;
            }
            professors_base *= prof_impact
            professors_base *= global.race['pompous'] ? (1 - traits.pompous.vars()[0] / 100) : 1;
            professors_base *= racialTrait(workerScale(global.civic.professor.workers,'professor'),'science');
            if (global.tech['anthropology'] && global.tech['anthropology'] >= 3){
                professors_base *= 1 + faithTempleCount() * 0.05;
            }
            if (global.civic.govern.type === 'theocracy'){
                professors_base *= 1 - (govEffect.theocracy()[1] / 100);
            }

            let scientist_base = workerScale(global.civic.scientist.workers,'scientist');
            scientist_base *= global.civic.scientist.impact;
            scientist_base *= racialTrait(workerScale(global.civic.scientist.workers,'scientist'),'science');
            if (global.tech['science'] >= 6 && global.city['wardenclyffe']){
                let professor = workerScale(global.civic.professor.workers,'professor');
                if (global.race['high_pop']){
                    professor = highPopAdjust(professor);
                }
                scientist_base *= 1 + (professor * p_on['wardenclyffe'] * 0.01);
            }
            if (global.space['satellite']){
                scientist_base *= 1 + (global.space.satellite.count * 0.01);
            }
            if (global.civic.govern.type === 'theocracy'){
                scientist_base *= 1 - (govEffect.theocracy()[2] / 100);
            }

            let gene_consume = 0;
            if (global.arpa['sequence'] && global.arpa.sequence.on && global.arpa.sequence.time > 0 && sequenceLabs() > 0){
                let gene_cost = 50 + (global.race.mutation * 10);
                if (global.arpa.sequence.boost){
                    gene_cost *= 4;
                }
                if (gene_cost * $ctx.time_multiplier <= global.resource.Knowledge.amount){
                    gene_consume = gene_cost;
                    S.gene_sequence = true;
                }
                else {
                    S.gene_sequence = false;
                }
            }
            else {
                if (global.arpa.hasOwnProperty('sequence') && global.arpa.sequence.time === null){
                    global.arpa.sequence.time = global.arpa.sequence.max;
                }
                S.gene_sequence = false;
            }

            let womling = global.tauceti.hasOwnProperty('womling_lab') ? global.tauceti.womling_lab.scientist * (global.tech['womling_gene'] ? 10 : 8) : 0;

            let delta = professors_base + scientist_base + womling;
            delta *= $ctx.hunger * $ctx.global_multiplier;
            delta += sundial_base * $ctx.global_multiplier;

            breakdown.p['Knowledge'][jobName('professor')] = professors_base + 'v';
            if (global.race.universe === 'magic'){
                breakdown.p['Knowledge'][jobName('wizard')] = scientist_base + 'v';
            }
            else {
                breakdown.p['Knowledge'][(global.civic?.scientist?.name || jobName('scientist'))] = scientist_base + 'v';
            }
            breakdown.p['Knowledge'][loc('tau_red_womlings')] = womling + 'v';
            breakdown.p['Knowledge'][loc('hunger')] = (($ctx.hunger - 1) * 100) + '%';
            breakdown.p['Knowledge'][global.race['unfathomable'] ? loc('tech_moondial') : loc('tech_sundial')] = sundial_base + 'v';

            if (global.race['inspired']){
                breakdown.p['Knowledge'][loc('event_inspiration_bd')] = '100%';
                delta *= 2;
            }
            if (global.city['library'] || global.race['warlord']){
                let lib_multiplier = 0.05;
                let muckVal = govActive('muckraker',2);
                if (muckVal){
                    lib_multiplier -= (muckVal / 100);
                }
                if (global.race['autoignition']){
                    lib_multiplier -= (traits.autoignition.vars()[0] / 100);
                    if (lib_multiplier < 0){
                        lib_multiplier = 0;
                    }
                }
                let lib_count = global.race['warlord'] ? ((global.race?.absorbed?.length || 1) * 10) : global.city.library.count;
                let library_mult = 1 + (lib_count * lib_multiplier);
                breakdown.p['Knowledge'][global.race['warlord'] ? loc('portal_throne_of_evil_title') : loc('city_library')] = ((library_mult - 1) * 100) + '%';
                delta *= library_mult;
            }
            if ($ctx.astroSign === 'gemini'){
                let astro_mult = 1 + (astroVal('gemini')[0] / 100);
                breakdown.p['Knowledge'][loc(`sign_${$ctx.astroSign}`)] = ((astro_mult - 1) * 100) + '%';
                delta *= astro_mult;
            }
            if (global.tech['isolation'] && support_on['infectious_disease_lab']){
                let lab_mult = 1 + support_on['infectious_disease_lab'] * 0.75;
                breakdown.p['Knowledge'][actions.tauceti.tau_home.infectious_disease_lab.title()] = ((lab_mult - 1) * 100) + '%';
                delta *= lab_mult;
            }
            if (global.civic.govern.type === 'technocracy'){
                breakdown.p['Knowledge'][loc('govern_technocracy')] = govEffect.technocracy()[2] + '%';
                delta *= 1 + (govEffect.technocracy()[2] / 100);
            }

            delta *= $ctx.aetherProdMult;

            if (gene_consume > 0) {
                delta -= gene_consume;
                breakdown.p.consume.Knowledge[loc('genome_bd')] = -(gene_consume);
            }

            modRes('Knowledge', delta * $ctx.time_multiplier);

            if (global.tech['tau_gas2'] && global.tech.tau_gas2 >= 6 && (!global.tech['alien_data'] || global.tech.alien_data < 6) && global.tauceti['alien_space_station'] && p_on['alien_space_station']) {
                let focus = (global.tauceti.alien_space_station.focus / 100) * delta
                breakdown.p.consume.Knowledge[loc('tau_gas2_alien_station')] = -(focus);
                modRes('Knowledge', -(focus) * $ctx.time_multiplier);
                global.tauceti.alien_space_station.decrypted += +(focus).toFixed(3);
                global.stats.know += +(focus).toFixed(0);
                if (global.tauceti.alien_space_station.decrypted >= (global.race['lone_survivor'] ? 1000000 : 250000000) && !global.tech['alien_data']){
                    global.tech['alien_data'] = 1;
                    messageQueue(loc('tau_gas2_alien_station_data1',[loc('tech_dist_womling')]),'success',false,['progress']);
                    drawTech();
                }
                else if (global.tauceti.alien_space_station.decrypted >= (global.race['lone_survivor'] ? 2000000 : 500000000) && global.tech['alien_data'] && global.tech.alien_data === 1){
                    global.tech.alien_data = 2;
                    global.race.tau_food_item = Math.rand(0,10);
                    messageQueue(loc('tau_gas2_alien_station_data2',[loc(`tau_gas2_alien_station_data2_r${global.race.tau_food_item || 0}`)]),'success',false,['progress']);
                    drawTech();
                }
                else if (global.tauceti.alien_space_station.decrypted >= (global.race['lone_survivor'] ? 3000000 : 750000000) && global.tech['alien_data'] && global.tech.alien_data === 2){
                    global.tech.alien_data = 3;
                    messageQueue(loc('tau_gas2_alien_station_data3'),'success',false,['progress']);
                    drawTech();
                }
                else if (global.tauceti.alien_space_station.decrypted >= (global.race['lone_survivor'] ? 4800000 : 1200000000) && global.tech['alien_data'] && global.tech.alien_data === 3){
                    global.tech.alien_data = 4;
                    global.race.tau_junk_item = Math.rand(0,10);
                    messageQueue(loc('tau_gas2_alien_station_data4',[loc(`tau_gas2_alien_station_data4_r${global.race.tau_junk_item || 0}`)]),'success',false,['progress']);
                    drawTech();
                }
                else if (global.tauceti.alien_space_station.decrypted >= (global.race['lone_survivor'] ? 6000000 : 1500000000) && global.tech['alien_data'] && global.tech.alien_data === 4){
                    global.tech.alien_data = 5;
                    messageQueue(loc('tau_gas2_alien_station_data5'),'success',false,['progress']);
                    drawTech();
                }
                else if (global.tauceti.alien_space_station.decrypted >= (global.race['lone_survivor'] ? 10000000 : 2500000000) && global.tech['alien_data'] && global.tech.alien_data === 5){
                    global.tech.alien_data = 6;
                    global.tauceti.alien_space_station.decrypted = 2500000000;
                    if (global.race['lone_survivor']){
                        global.settings.tau.star = true;
                        global.tech['matrix'] = 2;
                        global.tauceti['ringworld'] = { count: 0 };
                        messageQueue(loc('tau_gas2_alien_station_data6_alt'),'success',false,['progress']);
                    }
                    else {
                        messageQueue(loc('tau_gas2_alien_station_data6'),'success',false,['progress']);
                    }
                    drawTech();
                }
            }
        }

        // Omniscience
        if (global.resource.Omniscience.display){
            if (support_on['research_station']){
                let ghost_base = workerScale(global.civic.ghost_trapper.workers,'ghost_trapper');
                ghost_base *= racialTrait(ghost_base,'science');
                ghost_base *= global.race['pompous'] ? (1 - traits.pompous.vars()[0] / 100) : 1;
                let corruptor = 1;
                if (global.race['warlord'] && global.eden['corruptor']){
                    corruptor = 1 + (p_on['corruptor'] || 0) * 0.04;
                }

                let ghost_gain = support_on['research_station'] * ghost_base * 0.0000325 * corruptor;
                breakdown.p['Omniscience'][loc('eden_research_station_title')] = ghost_gain + 'v';
                if (corruptor > 1){
                    breakdown.p['Omniscience'][`ᄂ${loc('eden_corruptor_title')}`] = ((corruptor - 1) * 100) + '%';
                }

                let delta = ghost_gain;
                delta *= $ctx.hunger * $ctx.global_multiplier;

                modRes('Omniscience', delta * $ctx.time_multiplier);
            }

            if (global.tech['science'] && global.tech.science >= 23){
                let scientist = workerScale(global.civic.scientist.workers,'scientist');
                scientist *= racialTrait(scientist,'science');
                scientist *= global.race['pompous'] ? (1 - traits.pompous.vars()[0] / 100) : 1;

                let sci_gain = scientist * 0.000707;
                breakdown.p['Omniscience'][global.civic.scientist.name] = sci_gain + 'v';

                let delta = sci_gain;
                delta *= $ctx.hunger * $ctx.global_multiplier;

                modRes('Omniscience', delta * $ctx.time_multiplier);
            }
        }

        // Factory
        $ctx.FactoryMoney = 0;
}
