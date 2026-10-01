// Batas dari infectious disease lab Tau Ceti dan overseer truepath.
import { global, breakdown, support_on, p_on } from '../../core/vars.js';
import { actions } from '../../core/registries.js';
import { drawTech } from '../../actions/core/action_runner.js';
import { loc } from '../../core/locale.js';
import { spatialReasoning } from '../../resources/resources.js';
import { messageQueue } from '../../functions/message_log.js';

export function midLoopTauCetiCaps($ctx){
        if (global.tauceti['infectious_disease_lab']){
            let gain = 39616;
            if (global.tech['supercollider'] && global.tech['isolation']){
                let ratio = global.tech['tp_particles'] || (global.tech['particles'] && global.tech['particles'] >= 3) ? 12.5: 25;
                gain *= (global.tech['supercollider'] / ratio) + 1;
            }
            $ctx.caps['Knowledge'] += (p_on['infectious_disease_lab'] * Math.round(gain));
            breakdown.c.Knowledge[actions.tauceti.tau_home.infectious_disease_lab.title()] = (p_on['infectious_disease_lab'] * gain)+'v';

            if (global.tech['isolation']){
                let el_gain = support_on['infectious_disease_lab'] * spatialReasoning(375);
                $ctx.caps['Elerium'] += el_gain;
                breakdown.c.Elerium[actions.tauceti.tau_home.infectious_disease_lab.title()] = el_gain+'v';
            }
        }

        // Womlings
        if (global.race['truepath'] && global.tauceti['overseer'] && global.tech['tau_red'] && global.tech.tau_red >= 5){
            let pop = 0; let injured = global.tauceti.overseer.injured; let morale = 0; let loyal = 0; let prod = 0;

            if (global.race['womling_friend']){
                loyal += 25 + (support_on['overseer'] * actions.tauceti.tau_red.overseer.val());
                morale += 75 + (support_on['womling_fun'] * actions.tauceti.tau_red.womling_fun.val());
            }
            else if (global.race['womling_god']){
                loyal += 75 + (support_on['overseer'] * actions.tauceti.tau_red.overseer.val());
                morale += 40 + (support_on['womling_fun'] * actions.tauceti.tau_red.womling_fun.val());
            }
            else if (global.race['womling_lord']){
                loyal += support_on['overseer'] * actions.tauceti.tau_red.overseer.val();
                morale += 30 + (support_on['womling_fun'] * actions.tauceti.tau_red.womling_fun.val());
            }

            let vil_pop = global.tech['womling_pop'] && global.tech.womling_pop >= 2 ? 6 : 5;
            pop = support_on['womling_village'] * vil_pop;
            let farmers = support_on['womling_farm'] * 2;
            if (farmers > pop){ farmers = pop; }
            let crop_per_farmer = global.tech['womling_pop'] ? 8 : 6;
            if (global.tech['womling_gene']){ crop_per_farmer += 2; }
            if (pop > farmers * crop_per_farmer){
                pop = farmers * crop_per_farmer;
            }
            let unemployed = pop - farmers - injured;

            let scientist = 0;
            if (support_on['womling_lab']){
                scientist = support_on['womling_lab'];
                if (scientist > unemployed){ scientist = unemployed; }
                unemployed -= scientist;

                let gain = scientist * Math.round(25000 * global.tauceti.overseer.prod / 100);
                $ctx.caps['Knowledge'] += gain;
                breakdown.c.Knowledge[loc('interstellar_laboratory_title')] = gain+'v';

                if (Math.rand(0,10) < global.tauceti.womling_lab.scientist){
                    global.tauceti.womling_lab.tech += Math.rand(0,global.tauceti.womling_lab.scientist + 1);
                    let expo = global.stats.achieve['overlord'] && global.stats.achieve.overlord.l >= 5 ? 4.9 : 5;
                    if (global.race['lone_survivor']){ expo -= 0.1; }
                    if (global.tauceti.womling_lab.tech >= Math.round((global.tech.womling_tech + 2) ** expo)){
                        global.tech.womling_tech++;
                        global.tauceti.womling_lab.tech = 0;
                        messageQueue(loc('tau_red_womling_advancement',[global.tech.womling_tech]),'advanced',false,['progress']);
                        drawTech();
                    }
                }
            }

            let miners = support_on['womling_mine'] * 6;
            if (miners > unemployed){ miners = unemployed; }
            unemployed -= miners;

            let heal_chance = global.tech['tech_womling_firstaid'] ? 3 : 4;
            if (Math.rand(0,10) === 0){
                let raw = Math.rand(0,miners + scientist);
                if (raw > injured){
                    injured = raw;
                }
            }
            else if (injured > 0 && Math.rand(0,heal_chance) === 0){
                injured--;
            }

            if (global.tauceti.hasOwnProperty('womling_farm')){
                global.tauceti.womling_farm.farmers = farmers;
            }
            if (global.tauceti.hasOwnProperty('womling_mine')){
                global.tauceti.womling_mine.miners = miners;
            }
            if (global.tauceti.hasOwnProperty('womling_lab')){
                global.tauceti.womling_lab.scientist = scientist;
            }

            loyal -= miners;
            morale -= miners;
            morale -= farmers;
            morale -= injured;
            if (loyal > 100){ loyal = 100; }
            else if (loyal < 0){ loyal = 0; }
            if (morale > 100){ morale = 100; }
            else if (morale < 0){ morale = 0; }

            prod = Math.round((loyal + morale) / 2);
            global.tauceti.overseer.loyal = loyal;
            global.tauceti.overseer.morale = morale;
            global.tauceti.overseer.pop = pop;
            global.tauceti.overseer.working = farmers + miners + scientist;
            global.tauceti.overseer.injured = injured;
            global.tauceti.overseer.prod = prod;
        }
}
