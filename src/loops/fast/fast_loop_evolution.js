// Fase evolusi awal (protoplasm): gain RNA dan DNA per tick. Variabel yang dibagi antar bagian ada di $ctx.
import { global } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { hooks } from '../../core/registries.js';

export function fastLoopEvolution($ctx){
        if (global.evolution['nucleus'] && global['resource']['DNA'].amount < global['resource']['DNA'].max){
            let increment = global.evolution['nucleus'].count;
            while (global['resource']['RNA'].amount < increment * 2){
                increment--;
                if (increment <= 0){ break; }
            }
            let rna = increment;
            if (global.tech['evo'] && global.tech.evo >= 5){
                increment *= 2;
            }
            modRes('DNA', increment * $ctx.global_multiplier * $ctx.time_multiplier);
            modRes('RNA', -(rna * 2 * $ctx.time_multiplier));
        }
        if (global.evolution['organelles']){
            let rna_multiplier = global.race['rapid_mutation'] ? 2 : 1;
            if (global.tech['evo'] && global.tech.evo >= 2){
                rna_multiplier++;
            }
            modRes('RNA',global.evolution['organelles'].count * rna_multiplier * $ctx.global_multiplier * $ctx.time_multiplier);
        }

        if (((global.stats.feat['novice'] && global.stats.achieve['apocalypse'] && global.stats.achieve.apocalypse.l > 0) || global['sim']) && global.race.universe !== 'bigbang' && (!global.race.seeded || (global.race.seeded && global.race['chose']))){
            let rank = global['sim'] ? 5 : Math.min(global.stats.achieve.apocalypse.l,global.stats.feat['novice']);
            modRes('RNA', (rank / 2) * $ctx.time_multiplier * $ctx.global_multiplier);
            if (global.resource.DNA.display){
                modRes('DNA', (rank / 4) * $ctx.time_multiplier * $ctx.global_multiplier);
            }
        }
        // Detect new unlocks
        if (global['resource']['RNA'].amount >= 2 && !global.evolution['dna']){
            global.evolution['dna'] = 1;
            global.resource.DNA.display = true;
            if (global.stats.achieve['mass_extinction'] && global.stats.achieve['mass_extinction'].l > 1){
                modRes('RNA', global.resource.RNA.max);
                modRes('DNA', global.resource.RNA.max);
            }
            hooks.drawEvolution();
        }
        else if (global['resource']['RNA'].amount >= 10 && !global.evolution['membrane']){
            global.evolution['membrane'] = { count: 0 };
            hooks.drawEvolution();
        }
        else if (global['resource']['DNA'].amount >= 4 && !global.evolution['organelles']){
            global.evolution['organelles'] = { count: 0 };
            hooks.drawEvolution();
        }
        else if (global.evolution['organelles'] && global.evolution.organelles.count >= 2 && !global.evolution['nucleus']){
            global.evolution['nucleus'] = { count: 0 };
            hooks.drawEvolution();
        }
        else if (global.evolution['nucleus'] && global.evolution.nucleus.count >= 1 && !global.evolution['eukaryotic_cell']){
            global.evolution['eukaryotic_cell'] = { count: 0 };
            hooks.drawEvolution();
        }
        else if (global.evolution['eukaryotic_cell'] && global.evolution.eukaryotic_cell.count >= 1 && !global.evolution['mitochondria']){
            global.evolution['mitochondria'] = { count: 0 };
            hooks.drawEvolution();
        }
        else if (global.evolution['mitochondria'] && !global.tech['evo']){
            global.tech['evo'] = 1;
            hooks.drawEvolution();
        }
}
