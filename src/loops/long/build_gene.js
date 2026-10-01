// buildGene: bangun gene sintetis.
import { global } from '../../core/vars.js';
import { sythMap } from '../../core/run_state.js';

export function buildGene(blockGeneBuffer = false){
    let buffer = blockGeneBuffer ? 0 : 10000;
    if (global.resource.Knowledge.amount >= 200000 && global.resource.Knowledge.amount >= global.resource.Knowledge.max - buffer){
        global.resource.Knowledge.amount -= 200000;
        let gene = global.genes['synthesis'] ? sythMap[global.genes['synthesis']] : 1;
        global.resource.Genes.amount += gene;
    }
}
