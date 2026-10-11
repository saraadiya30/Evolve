// Pemakaian listrik per tick: total permintaan, load balancing saat kekurangan, dan urutan prioritas bangunan. Menyimpan daftar bangunan listrik di $ctx.p_structs untuk fastLoopSpaceOps. Dulu bagian dari fastLoopCore_s3.
import { global, breakdown, p_on, callback_queue } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { actions } from '../../core/registries.js';
import { checkPowerRequirements } from '../../actions/challenge/requirements.js';
import { fuel_adjust } from '../../space/planet_generation.js';
import { convertSpaceSector } from '../../space/space_requirements.js';

export function fastLoopPowerUsage($ctx){
        // Power usage
        let p_structs = global.power;
        $ctx.p_structs = p_structs; // dibaca fastLoopSpaceOps (dulu variabel lokal yang sama satu fungsi)

        // Determine total power demand across all structs and get a list of powered structs that support load balancing
        let totalPowerDemand = 0;
        let pb_list = [];
        for (let i=0; i<p_structs.length; i++){
            const parts = p_structs[i].split(":");
            const struct = parts[1];
            const region = parts[0] === 'city' ? parts[0] : convertSpaceSector(parts[0]);
            const c_action = parts[0] === 'city' ? actions.city[struct] : actions[region][parts[0]][struct];
            if (global[region][struct]?.on){
                if (checkPowerRequirements(c_action) && (region !== 'galaxy' || p_on['s_gate'])){
                    totalPowerDemand += global[region][struct].on * c_action.powered();
                    p_on[struct] = global[region][struct].on;
                } else {
                    p_on[struct] = 0;
                }
            }
            if (global.settings.lowPowerBalance && c_action.hasOwnProperty('powerBalancer')){
                pb_list.push(p_structs[i]);
            }
        }

        // When short of power, proportionally reduce power demanded by supported structures (starting from lowest priority)
        if (global.settings.lowPowerBalance && totalPowerDemand > $ctx.power_grid){
            let totalPowerUsage = totalPowerDemand;
            for (let i=pb_list.length-1; i >= 0; i--){
                const parts = pb_list[i].split(":");
                const struct = parts[1];
                let on = p_on[struct];

                if (totalPowerUsage > $ctx.power_grid && on > 0){
                    const region = parts[0] === 'city' ? parts[0] : convertSpaceSector(parts[0]);
                    const c_action = parts[0] === 'city' ? actions.city[struct] : actions[region][parts[0]][struct];

                    let balValues = c_action.powerBalancer();
                    if (balValues){
                        balValues.forEach(function(v){
                            let off = 0;
                            if (v.hasOwnProperty('r') && v.hasOwnProperty('k')){
                                let val = global[region][struct][v.k] ?? 0;
                                if (global.resource[v.r]['odif'] && global.resource[v.r]['odif'] < 0) { global.resource[v.r]['odif'] = 0; }
                                let diff = global.resource[v.r].diff + (global.resource[v.r]['odif'] ? global.resource[v.r]['odif'] : 0);
                                while (diff - (off * val) > val && on > 0 && totalPowerUsage > $ctx.power_grid){
                                    on--;
                                    off++;
                                    totalPowerUsage -= c_action.powered();
                                }
                                global.resource[v.r]['odif'] = val * off;
                            }
                            else if (v.hasOwnProperty('s')){
                                let sup = c_action.support();
                                if (global[region][struct]['soff'] && global[region][struct]['soff'] < 0) { global[region][struct]['soff'] = 0; }
                                let support = v.s + (global[region][struct]['soff'] ? global[region][struct]['soff'] : 0);
                                while (support - (sup * off) >= sup && on > 0 && totalPowerUsage > $ctx.power_grid){
                                    on--;
                                    off++;
                                    totalPowerUsage -= c_action.powered();
                                }
                                global[region][struct]['soff'] = sup * off;
                            }
                        });
                        p_on[struct] = on;
                    }
                }
            }
        }

        // Power structures in priority order
        let power_grid_temp = $ctx.power_grid;
        for (let i=0; i<p_structs.length; i++){
            const parts = p_structs[i].split(":");
            const struct = parts[1];
            const region = parts[0] === 'city' ? parts[0] : convertSpaceSector(parts[0]);
            const c_action = parts[0] === 'city' ? actions.city[struct] : actions[region][parts[0]][struct];
            if (global[region][struct]?.on){
                let power = p_on[struct] * c_action.powered();
                // Use a loop specifically because of citadel stations, which have variable power cost. Other buildings would accept a closed form.
                while (power > power_grid_temp && power > 0){
                    p_on[struct]--;
                    power = p_on[struct] * c_action.powered();
                }

                if (c_action.hasOwnProperty('p_fuel')){
                    let s_fuels = c_action.p_fuel();
                    if (!Array.isArray(s_fuels)){
                        s_fuels = [s_fuels];
                    }
                    for (let j=0; j<s_fuels.length; j++){
                        const title = typeof c_action.title === 'string' ? c_action.title : c_action.title();
                        const fuel = s_fuels[j];
                        const fuel_cost = ['Oil','Helium_3'].includes(fuel.r) && region === 'space' ? fuel_adjust(fuel.a,true) : fuel.a;
                        let mb_consume = p_on[struct] * fuel_cost;
                        for (let k=0; k<p_on[struct]; k++){
                            if (!modRes(fuel.r, -($ctx.time_multiplier * fuel_cost))){
                                mb_consume = k * fuel_cost;
                                p_on[struct] = k;
                                power = p_on[struct] * c_action.powered();
                                break;
                            }
                        }
                        breakdown.p.consume[fuel.r][title] = -(mb_consume);
                    }
                }
                power_grid_temp -= power;

                if (p_on[struct] !== global[region][struct].on){
                    const on_el = $(`#${region}-${struct} .on`);
                    on_el.addClass('warn');
                    on_el.prop('title',`ON ${p_on[struct]}/${global[region][struct].on}`);
                    // Remove the reset actions for reset structures that lose power
                    if (['matrix', 'atmo_terraformer', 'ascension_trigger'].includes(struct)){
                        callback_queue.set([c_action, 'postPower'], [true]);
                    }
                }
                else {
                    const on_el = $(`#${region}-${struct} .on`);
                    on_el.removeClass('warn');
                    on_el.prop('title',`ON`);
                }
            }
            else {
                p_on[struct] = 0;
                const on_el = $(`#${region}-${struct} .on`);
                on_el.removeClass('warn');
                on_el.prop('title',`ON`);
            }
        }
        $ctx.power_grid -= totalPowerDemand;
}
