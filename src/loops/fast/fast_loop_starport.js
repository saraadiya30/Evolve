// Starport per tick: kapasitas support dan penghitung mining droid. Dulu bagian dari fastLoopCore_s4.
import { global, breakdown, p_on, int_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { loc } from '../../core/locale.js';
import { actions } from '../../core/registries.js';
import { int_fuel_adjust } from '../../space/planet_generation.js';

export function fastLoopStarport($ctx){
        if (global.interstellar['starport'] && global.interstellar['starport'].count > 0){
            let fuel_cost = +int_fuel_adjust(5);
            let mb_consume = p_on['starport'] * fuel_cost;
            breakdown.p.consume.Helium_3[loc('interstellar_alpha_starport_title')] = -(mb_consume);
            for (let i=0; i<p_on['starport']; i++){
                if (!modRes('Helium_3', -($ctx.time_multiplier * fuel_cost))){
                    mb_consume -= (p_on['starport'] * fuel_cost) - (i * fuel_cost);
                    p_on['starport'] -= i;
                    break;
                }
            }
            global.interstellar.starport.s_max = p_on['starport'] * actions.interstellar.int_alpha.starport.support();
            global.interstellar.starport.s_max += p_on['habitat'] * actions.interstellar.int_alpha.habitat.support();
            global.interstellar.starport.s_max += p_on['xfer_station'] * actions.interstellar.int_proxima.xfer_station.support();
        }

        // Droids
        $ctx.miner_droids = {
            adam: 0,
            uran: 0,
            coal: 0,
            alum: 0,
        };

        if (global.interstellar['starport']){
            let used_support = 0;
            let structs = global.support.alpha.map(x => x.split(':')[1]);
            for ($ctx.i = 0; $ctx.i < structs.length; $ctx.i++){
                if (global.interstellar[structs[$ctx.i]]){
                    let operating = global.interstellar[structs[$ctx.i]].on;
                    let id = actions.interstellar.int_alpha[structs[$ctx.i]].id;
                    if (used_support + operating > global.interstellar.starport.s_max){
                        operating -=  (used_support + operating) - global.interstellar.starport.s_max;
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
            global.interstellar.starport.support = used_support;

            if (global.interstellar.hasOwnProperty('mining_droid') && global.interstellar.mining_droid.count > 0){
                let on_droid = int_on['mining_droid'];
                let max_droid = global.interstellar.mining_droid.on;
                let eff = max_droid > 0 ? on_droid / max_droid : 0;
                let remaining = max_droid;

                ['adam','uran','coal','alum'].forEach(function(res){
                    remaining -= global.interstellar.mining_droid[res];
                    if (remaining < 0) {
                        global.interstellar.mining_droid[res] += remaining;
                        remaining = 0;
                    }
                    $ctx.miner_droids[res] = global.interstellar.mining_droid[res] * eff;
                });
            }
        }
}
