import { global } from '../core/vars.js';
import { traits, fathomCheck } from '../races/races.js';
import { govEffect } from '../civics/civics.js';
import { teamsterCap } from '../civics/jobs.js';
import { production_p1, production_p2 } from '../sections/sec_production_1.js';

export function highPopAdjust(v){
    if (global.race['high_pop']){
        v *= traits.high_pop.vars()[1] / 100;
    }
    return v;
}

export function teamster(v){
    if (global.race['gravity_well'] && global.race['teamster'] && global.race.teamster > 0){
        let cap = teamsterCap();
        if (cap < 1){ cap = 1; }
        let teamster = global.civic.teamster.workers > cap ? cap : global.civic.teamster.workers;
        v *= teamster / cap;
    }
    return v;
}

export function production(id,val,wiki){
    { const $r = production_p1(id, val, wiki); if ($r !== undefined) return $r; }
    { const $r = production_p2(id, val, wiki); if ($r !== undefined) return $r; }
}

export function factoryBonus(factory){
    if (global.race['toxic']){
        factory *= 1 + (traits.toxic.vars()[0] / 100);
    }
    if (global.race['artisan']){
        factory *= 1 + (traits.artisan.vars()[1] / 100);
    }
    let fathom = fathomCheck('shroomi');
    if (fathom > 0){
        factory *= 1 + (traits.toxic.vars(1)[0] / 100 * fathom);
    }
    if (global.civic.govern.type === 'corpocracy'){
        factory *= 1 + (govEffect.corpocracy()[4] / 100);
    }
    if (global.civic.govern.type === 'socialist'){
        factory *= 1 + (govEffect.socialist()[1] / 100);
    }
    if (global.stats.achieve['iron_will'] && global.stats.achieve.iron_will.l >= 2){
        factory *= 1.1;
    }
    if (global.race['elemental'] && traits.elemental.vars()[0] === 'acid'){
        factory *= 1 + highPopAdjust(traits.elemental.vars()[2] * global.resource[global.race.species].amount / 100);
    }
    return factory;
}
