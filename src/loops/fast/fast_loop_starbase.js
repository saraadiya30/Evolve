// Starbase per tick: kapasitas dan pemakaian support.
import { global, breakdown, gal_on, p_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { loc } from '../../core/locale.js';
import { actions } from '../../core/registries.js';
import { int_fuel_adjust } from '../../space/planet_generation.js';

export function fastLoopStarbase($ctx){
        // Starbase
        if (global.galaxy['starbase'] && global.galaxy['starbase'].count > 0){
            let fuel_cost = +int_fuel_adjust(25);
            let mb_consume = p_on['starbase'] * fuel_cost;
            breakdown.p.consume.Helium_3[loc('galaxy_starbase')] = -(mb_consume);
            for (let i=0; i<p_on['starbase']; i++){
                if (!modRes('Helium_3', -($ctx.time_multiplier * fuel_cost))){
                    mb_consume -= (p_on['starbase'] * fuel_cost) - (i * fuel_cost);
                    p_on['starbase'] -= i;
                    break;
                }
            }
            if (p_on['s_gate']){
                global.galaxy.starbase.s_max = p_on['starbase'] * actions.galaxy.gxy_gateway.starbase.support();
                if (p_on['gateway_station']){
                    global.galaxy.starbase.s_max += p_on['gateway_station'] * actions.galaxy.gxy_stargate.gateway_station.support();
                }
                if (p_on['telemetry_beacon']){
                    global.galaxy.starbase.s_max += p_on['telemetry_beacon'] * actions.galaxy.gxy_stargate.telemetry_beacon.support();
                }
                if (p_on['ship_dock']){
                    global.galaxy.starbase.s_max += p_on['ship_dock'] * actions.galaxy.gxy_gateway.ship_dock.support();
                }
            }
            else {
                global.galaxy.starbase.s_max = 0;
            }
        }

        if (global.galaxy['starbase']){
            let used_support = 0;
            let gateway_structs = global.support.gateway.map(x => x.split(':')[1]);
            for ($ctx.i = 0; $ctx.i < gateway_structs.length; $ctx.i++){
                if (global.galaxy[gateway_structs[$ctx.i]]){
                    let operating = global.galaxy[gateway_structs[$ctx.i]].on;
                    let id = actions.galaxy.gxy_gateway[gateway_structs[$ctx.i]].id;
                    let operating_cost = -(actions.galaxy.gxy_gateway[gateway_structs[$ctx.i]].support());
                    let max_operating = Math.floor((global.galaxy.starbase.s_max - used_support) / operating_cost);
                    if (operating > max_operating){
                        operating = max_operating;
                        $(`#${id} .on`).addClass('warn');
                        $(`#${id} .on`).prop('title',`ON ${operating}/${global.galaxy[gateway_structs[$ctx.i]].on}`);
                    }
                    else {
                        $(`#${id} .on`).removeClass('warn');
                        $(`#${id} .on`).prop('title',`ON`);
                    }
                    used_support += operating * operating_cost;
                    gal_on[gateway_structs[$ctx.i]] = operating;
                }
                else {
                    gal_on[gateway_structs[$ctx.i]] = 0;
                }
            }
            global.galaxy.starbase.support = used_support;
        }
}
