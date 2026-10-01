// crateValue / containerValue / tradeRouteColor: nilai crate/container dan warna rute dagang.
import { global } from '../core/vars.js';
import { traits } from '../core/registries.js';
import { fathomCheck } from '../races/trait_logic/fathom_check.js';
import { BLACKHOLE_STORAGE_BONUS_PER_LEVEL } from '../config/constants.js';
import { spatialReasoning } from './resources.js';

export function crateValue(){
    let create_value = global.tech['container'] && global.tech['container'] >= 2 ? 500 : 350;
    if (global.tech['container'] && global.tech['container'] >= 4){
        create_value += global.tech['container'] >= 5 ? 500 : 250;
    }
    if (global.tech['container'] && global.tech['container'] >= 6){
        create_value += global.tech['container'] >= 7 ? 1200 : 500;
    }
    if (global.tech['container'] && global.tech['container'] >= 8){
        create_value += global.tech['container'] >= 9 ? 7800 : 4000;
    }
    if (global.race['pack_rat']){
        create_value *= 1 + (traits.pack_rat.vars()[0] / 100);
    }
    let fathom = fathomCheck('kobold');
    if (fathom > 0){
        create_value *= 1 + (traits.pack_rat.vars(1)[0] / 100 * fathom);
    }
    if (global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 3){
        create_value *= 1.1;
    }
    create_value *= global.stats.achieve['blackhole'] ? 1 + (global.stats.achieve.blackhole.l * BLACKHOLE_STORAGE_BONUS_PER_LEVEL) : 1;
    return Math.round(spatialReasoning(create_value)) * 1000;
}

export function containerValue(){
    let container_value = global.tech['steel_container'] && global.tech['steel_container'] >= 3 ? 1200 : 800;
    if (global.tech['steel_container'] && global.tech['steel_container'] >= 4){
        container_value += global.tech['steel_container'] >= 5 ? 1000 : 400;
    }
    if (global.tech['steel_container'] && global.tech['steel_container'] >= 6){
        container_value += global.tech['steel_container'] >= 7 ? 7500 : 1000;
    }
    if (global.tech['steel_container'] && global.tech['steel_container'] >= 8){
        container_value += global.tech['steel_container'] >= 9 ? 15300 : 8000;
    }
    if (global.race['pack_rat']){
        container_value *= 1 + (traits.pack_rat.vars()[0] / 100);
    }
    let fathom = fathomCheck('kobold');
    if (fathom > 0){
        container_value *= 1 + (traits.pack_rat.vars(1)[0] / 100 * fathom);
    }
    container_value *= global.stats.achieve['blackhole'] ? 1 + (global.stats.achieve.blackhole.l * BLACKHOLE_STORAGE_BONUS_PER_LEVEL) : 1;
    return Math.round(spatialReasoning(container_value)) * 10000;
}

export function tradeRouteColor(res){
    $(`#market-${res} .trade .current`).removeClass('has-text-warning');
    $(`#market-${res} .trade .current`).removeClass('has-text-danger');
    $(`#market-${res} .trade .current`).removeClass('has-text-success');
    if (global.resource[res].trade > 0){
        $(`#market-${res} .trade .current`).addClass('has-text-success');
    }
    else if (global.resource[res].trade < 0){
        $(`#market-${res} .trade .current`).addClass('has-text-danger');
    }
    else {
        $(`#market-${res} .trade .current`).addClass('has-text-warning');
    }
}
