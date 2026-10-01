// Deteriorasi, tech decay, dan unlock genesis per detik.
import { global } from '../../core/vars.js';
import { drawTech } from '../../actions/core/action_runner.js';
import { orbitLength } from '../../races/trait_logic/trait_ranks.js';
import { messageQueue } from '../../functions/message_log.js';
import { flib } from '../../functions/run_stats_helpers.js';
import { loc } from '../../core/locale.js';

export function longLoopDecay($ctx){
        if (!global.race['cataclysm'] && !global.race['orbit_decayed'] && !global.race['lone_survivor'] && !global.race['vax']){
            let deterioration = Math.floor(50000000 / (1 + global.race.mutation)) - global.stats.days;
            if (global.race.deterioration === 0 && deterioration < 40000000){
                global.race.deterioration = 1;
                let death_clock = Math.round(deterioration / orbitLength());
                messageQueue(loc('deterioration1',[flib('name'),death_clock]),'danger',false,['progress']);
            }
            else if (global.race.deterioration === 1 && deterioration < 20000000){
                global.race.deterioration = 2;
                let death_clock = Math.round(deterioration / orbitLength());
                messageQueue(loc('deterioration2',[flib('name'),death_clock]),'danger',false,['progress']);
            }
            else if (global.race.deterioration === 2 && deterioration < 5000000){
                global.race.deterioration = 3;
                let death_clock = Math.round(deterioration / orbitLength());
                messageQueue(loc('deterioration3',[flib('name'),death_clock]),'danger',false,['progress']);
            }
            else if (global.race.deterioration === 3 && deterioration < 1000000){
                global.race.deterioration = 4;
                let death_clock = Math.round(deterioration / orbitLength());
                messageQueue(loc('deterioration4',[flib('name'),death_clock]),'danger',false,['progress']);
            }
            else if (global.race.deterioration === 4 && deterioration <= 0){
                global.race.deterioration = 5;
                global.race['decayed'] = global.stats.days;
                global.tech['decay'] = 1;
                messageQueue(loc('deterioration5',[flib('name')]),'danger',false,['progress']);
                drawTech();
            }
        }

        if (global.tech['decay'] && global.tech['decay'] >= 2){
            let fortify = 0;
            if (global.genes.minor['fortify']){
                fortify += global.genes.minor['fortify'];
            }
            if (global.race.minor['fortify']){
                fortify += global.race.minor['fortify'];
            }
            if (global.tech['decay'] >= 3){
                fortify *= 100;
            }
            global.race.gene_fortify = fortify;
        }
        else {
            global.race.gene_fortify = 0;
        }

        if (!global.tech['genesis'] && global.race.deterioration >= 1 && global.tech['high_tech'] && global.tech['high_tech'] >= 10){
            global.tech['genesis'] = 1;
            messageQueue(loc('genesis'),'special',false,['progress']);
            drawTech();
        }
}
