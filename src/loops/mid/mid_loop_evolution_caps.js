// Batas RNA/DNA fase evolusi awal dan penanda aksi evolusi. Dulu midLoop_s1.
import { global } from '../../core/vars.js';
import { actions } from '../../core/registries.js';
import { checkAffordable } from '../../actions/core/action_costs.js';

export function midLoopEvolutionCaps($ctx){
        let base = 100;
        if (global.stats.achieve['mass_extinction'] && global.stats.achieve['mass_extinction'].l > 1){
            base += 50 * (global.stats.achieve['mass_extinction'].l - 1);
        }
        $ctx.caps = {
            RNA: base,
            DNA: base
        };
        if (global.evolution['membrane']){
            let effect = global.evolution['mitochondria'] ? global.evolution['mitochondria'].count * 5 + 5 : 5;
            $ctx.caps['RNA'] += global.evolution['membrane'].count * effect;
        }
        if (global.evolution['eukaryotic_cell']){
            let effect = global.evolution['mitochondria'] ? global.evolution['mitochondria'].count * 10 + 10 : 10;
            $ctx.caps['DNA'] += global.evolution['eukaryotic_cell'].count * effect;
        }

        global.resource.RNA.max = $ctx.caps['RNA'];
        global.resource.DNA.max = $ctx.caps['DNA'];

        Object.keys(actions.evolution).forEach(function (action){
            if (actions.evolution[action] && actions.evolution[action].cost){
                let c_action = actions.evolution[action];
                let element = $('#'+c_action.id);
                if (element.length > 0){
                    if (checkAffordable(c_action,true)){
                        if (element.hasClass('cnam')){
                            element.removeClass('cnam');
                        }
                        if (checkAffordable(c_action)){
                            if (element.hasClass('cna')){
                                element.removeClass('cna');
                            }
                        }
                        else if (!element.hasClass('cna')){
                            element.addClass('cna');
                        }
                    }
                    else {
                        if (!element.hasClass('cnam')){
                            element.addClass('cnam');
                        }
                        if (!element.hasClass('cna')){
                            element.addClass('cna');
                        }
                    }
                }
            }
        });
}
