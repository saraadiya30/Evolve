// craftCost: biaya crafting resource.
import { global } from '../core/vars.js';
import { traits } from '../core/registries.js';

export function craftCost(manual=false){
    let costs = {
        Plywood: [{ r: 'Lumber', a: 100 }],
        Brick: global.race['flier'] ? [{ r: 'Stone', a: 60 }] : [{ r: 'Cement', a: 40 }],
        Wrought_Iron: [{ r: 'Iron', a: 80 }],
        Sheet_Metal: [{ r: 'Aluminium', a: 120 }],
        Mythril: [{ r: 'Iridium', a: 100 },{ r: 'Alloy', a: 250 }],
        Aerogel: [{ r: 'Graphene', a: 2500 },{ r: 'Infernite', a: 50 }],
        Nanoweave: [{ r: 'Nano_Tube', a: 1000 },{ r: 'Vitreloy', a: 40 }],
        Scarletite: [{ r: 'Iron', a: 250000 },{ r: 'Adamantite', a: 7500 },{ r: 'Orichalcum', a: 500 }],
        Quantium: [{ r: 'Nano_Tube', a: 1000 },{ r: 'Graphene', a: 1000 },{ r: 'Elerium', a: 25 }],
        Thermite: [{ r: 'Iron', a: 180 },{ r: 'Aluminium', a: 60 }],
    };
    if (global.race['wasteful']){
        let rate = 1 + traits.wasteful.vars()[0] / 100;
        Object.keys(costs).forEach(function(res){
            for (let i=0; i<costs[res].length; i++){
                costs[res][i].a = Math.round(costs[res][i].a * rate);
            }
        });
    }
    if (global.race['high_pop'] && !manual){
        let rate = 1 / traits.high_pop.vars()[0];
        Object.keys(costs).forEach(function(res){
            for (let i=0; i<costs[res].length; i++){
                costs[res][i].a = Math.round(costs[res][i].a * rate);
            }
        });
    }
    return costs;
}
