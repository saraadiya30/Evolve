// Swarm control dan sekuensing gen ARPA.
import { global } from '../../core/vars.js';
import { actions, hooks, traits, S_loops as S } from '../../core/registries.js';
import { drawTech } from '../../actions/core/action_runner.js';
import { loc } from '../../core/locale.js';
import { randomMinorTrait } from '../../races/trait_logic/racial_traits.js';
import { messageQueue } from '../../functions/message_log.js';
import { flib } from '../../functions/run_stats_helpers.js';
import { unlockAchieve } from '../../achievements/achievement_logic.js';
import { sequenceLabs } from '../../arpa/arpa_projects.js';

export function midLoopSwarmSequence($ctx){
        if (global.space['swarm_control']){
            global.space.swarm_control.s_max = global.space.swarm_control.count * actions.space.spc_sun.swarm_control.support();
        }

        if (global.arpa['sequence'] && global.arpa.sequence.on && S.gene_sequence){
            let labs = sequenceLabs();
            global.arpa.sequence.labs = labs;
            global.arpa.sequence.time -= global.arpa.sequence.boost ? labs * 2 : labs;
            global.arpa.sequence.progress = global.arpa.sequence.max - global.arpa.sequence.time;
            if (global.arpa.sequence.time <= 0){
                global.arpa.sequence.max = 50000 * (1 + (global.race.mutation ** 2));
                if (global.race['adaptable']){
                    let adapt = 1 - (traits.adaptable.vars()[0] / 100);
                    global.arpa.sequence.max = Math.floor(global.arpa.sequence.max * adapt);
                }
                global.arpa.sequence.progress = 0;
                global.arpa.sequence.time = global.arpa.sequence.max;
                if (global.tech['genetics'] === 2){
                    messageQueue(loc('genome',[flib('name')]),'success',false,['progress']);
                    global.tech['genetics'] = 3;
                }
                else {
                    global.race.mutation++;
                    let trait = randomMinorTrait(1);
                    let gene_multi = 1 + (global.genes['synthesis'] ? global.genes['synthesis'] : 0);
                    let gene = (2 ** (global.race.mutation - 1)) * gene_multi;
                    if (global.stats.achieve['creator']){
                        gene = Math.round(gene * (1 + (global.stats.achieve['creator'].l * 0.5)));
                    }
                    global.resource.Genes.amount += gene;
                    global.resource.Genes.display = true;
                    let plasma = global.genes['plasma'] ? global.race.mutation : 1;
                    if (global.genes['plasma'] && plasma > 3){
                        if (global.genes['plasma'] >= 2){
                            plasma = plasma > 5 ? 5 : plasma;
                        }
                        else {
                            plasma = 3;
                        }
                    }
                    let plasmid_type = plasma > 1 ? '_plural' : '';
                    if (global.race['universe'] === 'antimatter'){
                        plasmid_type = loc('resource_AntiPlasmid' + plasmid_type + '_name');
                        global.stats.antiplasmid += plasma;
                        global.prestige.AntiPlasmid.count += plasma;
                        unlockAchieve('cross');
                    }
                    else {
                        plasmid_type = loc('resource_Plasmid' + plasmid_type + '_name');
                        global.stats.plasmid += plasma;
                        global.prestige.Plasmid.count += plasma;
                    }
                    hooks.arpa('Crispr');
                    messageQueue(loc('gene_therapy',[loc('trait_' + trait + '_name'),gene,plasma,plasmid_type]),'success',false,['progress']);
                }
                hooks.arpa('Genetics');
                drawTech();
            }
        }
}
