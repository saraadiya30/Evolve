// Support dan konsumsi bahan bakar struktur luar angkasa per tick: space station, nexus, transfer station, FOB, outpost, neutron miner, cruiser, pillbox.
import { global, breakdown, p_on, support_on, int_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { garrisonSize } from '../../civics/military/garrison.js';
import { loc } from '../../core/locale.js';
import { actions } from '../../core/registries.js';
import { fuel_adjust, int_fuel_adjust } from '../../space/planet_generation.js';
import { jobScale } from '../../civics/jobs/job_scale.js';

export function fastLoopSpaceSupport($ctx){
        // Space Station
        if (global.space['space_station'] && global.space['space_station'].count > 0){
            let fuel_cost = +fuel_adjust(2.5,true);
            let ss_consume = p_on['space_station'] * fuel_cost;
            breakdown.p.consume.Helium_3[loc('space_belt_station_title')] = -(ss_consume);
            for (let i=0; i<p_on['space_station']; i++){
                if (!modRes('Helium_3', -($ctx.time_multiplier * fuel_cost))){
                    ss_consume -= (p_on['space_station'] * fuel_cost) - (i * fuel_cost);
                    p_on['space_station'] -= i;
                    break;
                }
            }
        }

        if (global.space['space_station']){
            let used_support = 0;
            let belt_structs = global.support.belt.map(x => x.split(':')[1]);
            for ($ctx.i = 0; $ctx.i < belt_structs.length; $ctx.i++){
                if (global.space[belt_structs[$ctx.i]]){
                    let operating = global.space[belt_structs[$ctx.i]].on;
                    let id = actions.space.spc_belt[belt_structs[$ctx.i]].id;
                    if (used_support + (operating * -(actions.space.spc_belt[belt_structs[$ctx.i]].support())) > global.space.space_station.s_max){
                        let excess = used_support + (operating * -(actions.space.spc_belt[belt_structs[$ctx.i]].support())) - global.space.space_station.s_max;
                        operating -= Math.ceil(excess / -(actions.space.spc_belt[belt_structs[$ctx.i]].support()));
                        $(`#${id} .on`).addClass('warn');
                        $(`#${id} .on`).prop('title',`ON ${operating}/${global.space[belt_structs[$ctx.i]].on}`);
                    }
                    else {
                        $(`#${id} .on`).removeClass('warn');
                        $(`#${id} .on`).prop('title',`ON`);
                    }
                    used_support += (operating * -(actions.space.spc_belt[belt_structs[$ctx.i]].support()));
                    support_on[belt_structs[$ctx.i]] = operating;
                }
                else {
                    support_on[belt_structs[$ctx.i]] = 0;
                }
            }
            global.space.space_station.support = used_support;
        }

        if (global.interstellar['nexus'] && global.interstellar['nexus'].count > 0){
            let cash_cost = 350;
            let mb_consume = p_on['nexus'] * cash_cost;
            breakdown.p.consume.Money[loc('interstellar_nexus_bd')] = -(mb_consume);
            for (let i=0; i<p_on['nexus']; i++){
                if (!modRes('Money', -($ctx.time_multiplier * cash_cost))){
                    mb_consume -= (p_on['nexus'] * cash_cost) - (i * cash_cost);
                    p_on['nexus'] -= i;
                    break;
                }
            }
            global.interstellar.nexus.s_max = p_on['nexus'] * actions.interstellar.int_nebula.nexus.support();
        }

        if (global.interstellar['nexus']){
            let used_support = 0;
            let structs = global.support.nebula.map(x => x.split(':')[1]);
            for ($ctx.i = 0; $ctx.i < structs.length; $ctx.i++){
                if (global.interstellar[structs[$ctx.i]]){
                    let operating = global.interstellar[structs[$ctx.i]].on;
                    let id = actions.interstellar.int_nebula[structs[$ctx.i]].id;
                    if (used_support + operating > global.interstellar.nexus.s_max){
                        operating -=  (used_support + operating) - global.interstellar.nexus.s_max;
                        $(`#${id} .on`).addClass('warn');
                        $(`#${id} .on`).prop('title',`ON ${operating}/${global.interstellar[structs[$ctx.i]].on}`);
                    }
                    else {
                        $(`#${id} .on`).removeClass('warn');
                        $(`#${id} .on`).prop('title',`ON`);
                    }
                    used_support += operating;
                    int_on[structs[$ctx.i]] = operating;
                }
                else {
                    int_on[structs[$ctx.i]] = 0;
                }
            }
            global.interstellar.nexus.support = used_support;
        }

        // Transfer Station
        if (global.interstellar['xfer_station'] && p_on['xfer_station']){
            let fuel_cost = 0.28;
            let xfer_consume = p_on['xfer_station'] * fuel_cost;
            breakdown.p.consume.Uranium[loc('interstellar_xfer_station_title')] = -(xfer_consume);
            for (let i=0; i<p_on['xfer_station']; i++){
                if (!modRes('Uranium', -($ctx.time_multiplier * fuel_cost))){
                    xfer_consume -= (p_on['xfer_station'] * fuel_cost) - (i * fuel_cost);
                    p_on['xfer_station'] -= i;
                    break;
                }
            }
        }

        // Foward Operating Base
        if (global.space['fob'] && p_on['fob']){
            let fuel_cost = +fuel_adjust(125,true);
            let xfer_consume = p_on['fob'] * fuel_cost;
            breakdown.p.consume.Helium_3[loc('tech_fob')] = -(xfer_consume);
            for (let i=0; i<p_on['fob']; i++){
                if (!modRes('Helium_3', -($ctx.time_multiplier * fuel_cost))){
                    xfer_consume -= (p_on['fob'] * fuel_cost) - (i * fuel_cost);
                    p_on['fob'] -= i;
                    break;
                }
            }
        }

        // Outpost
        if (p_on['outpost'] && p_on['outpost'] > 0){
            let fuel_cost = +fuel_adjust(2,true);
            let out_consume = p_on['outpost'] * fuel_cost;
            breakdown.p.consume.Oil[loc('space_gas_moon_outpost_bd')] = -(out_consume);
            for (let i=0; i<p_on['outpost']; i++){
                if (!modRes('Oil', -($ctx.time_multiplier * fuel_cost))){
                    out_consume -= (p_on['outpost'] * fuel_cost) - (i * fuel_cost);
                    p_on['outpost'] -= i;
                    break;
                }
            }
        }

        // Neutron Miner
        if (p_on['neutron_miner'] && p_on['neutron_miner'] > 0){
            let fuel_cost = +int_fuel_adjust(3);
            let out_consume = p_on['neutron_miner'] * fuel_cost;
            breakdown.p.consume.Helium_3[loc('interstellar_neutron_miner_title')] = -(out_consume);
            for (let i=0; i<p_on['neutron_miner']; i++){
                if (!modRes('Helium_3', -($ctx.time_multiplier * fuel_cost))){
                    out_consume -= (p_on['neutron_miner'] * fuel_cost) - (i * fuel_cost);
                    p_on['neutron_miner'] -= i;
                    break;
                }
            }
        }

        // Patrol Cruiser
        if (global.interstellar['cruiser']){
            let fuel_cost = +int_fuel_adjust(6);
            let active = global.interstellar['cruiser'].on;
            let out_consume = active * fuel_cost;
            breakdown.p.consume.Helium_3[loc('interstellar_cruiser_title')] = -(out_consume);
            for (let i=0; i<global.interstellar['cruiser'].on; i++){
                if (!modRes('Helium_3', -($ctx.time_multiplier * fuel_cost))){
                    out_consume -= (global.interstellar['cruiser'].on * fuel_cost) - (i * fuel_cost);
                    active -= i;
                    break;
                }
            }
            int_on['cruiser'] = active;
        }

        // Pillbox
        if (global.eden['pillbox']){
            let pillsize = jobScale(10);
            if (p_on['pillbox']){
                let staff = p_on['pillbox'] * pillsize;
                let soldiers = garrisonSize(false,{nopill: true});
                if (soldiers < staff){
                    staff = Math.floor(soldiers / pillsize) * pillsize;
                }
                global.eden.pillbox.staffed = staff;
            }
            else {
                global.eden.pillbox.staffed = 0;
            }

            if (global.eden.pillbox.staffed < p_on['pillbox'] * pillsize){
                $(`#eden-pillbox .on`).addClass('warn');
            }
            else {
                $(`#eden-pillbox .on`).removeClass('warn')
            }
        }
}
