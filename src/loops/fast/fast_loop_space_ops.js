// Operasi ruang angkasa per tick: mass relay, troop lander, foothold, moon base dan spaceport, space marines, dan pabrik planet. Membaca $ctx.p_structs dari fastLoopPowerUsage. Dulu bagian akhir fastLoopCore_s3.
import { global, breakdown, p_on, support_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { actions } from '../../core/registries.js';
import { structName } from '../../actions/core/structure_ui.js';
import { fuel_adjust, int_fuel_adjust } from '../../space/planet_generation.js';
import { convertSpaceSector } from '../../space/space_requirements.js';
import { garrisonSize } from '../../civics/military/garrison.js';
import { loc } from '../../core/locale.js';
import { jobScale } from '../../civics/jobs/job_scale.js';

export function fastLoopSpaceOps($ctx){
        let p_structs = $ctx.p_structs;
        // Mass Relay charging
        if (global.space['m_relay']){
            if (p_on['m_relay']){
                if (global.space.m_relay.charged < 10000){
                    global.space.m_relay.charged++;
                }
            }
            else {
                global.space.m_relay.charged = 0;
            }
        }

        // Troop Lander
        if (global.space['fob'] && global.space['lander']){
            if (p_on['fob']){
                let fuel = fuel_adjust(50,true);
                support_on['lander'] = global.space.lander.on;

                let total = garrisonSize(false,{nofob: true});
                let troopReq = jobScale(3);
                let deployed = support_on['lander'] * troopReq;
                if (deployed <= total){
                    global.space.fob.troops = deployed;
                }
                else {
                    support_on['lander'] -= Math.ceil((deployed - total) / troopReq);
                    global.space.fob.troops = support_on['lander'] * troopReq;
                }

                let mb_consume = support_on['lander'] * fuel;
                breakdown.p.consume.Oil[loc('space_lander_title')] = -(mb_consume);
                for (let i=0; i<support_on['lander']; i++){
                    if (!modRes('Oil', -($ctx.time_multiplier * fuel))){
                        mb_consume -= (support_on['lander'] * fuel) - (i * fuel);
                        support_on['lander'] -= i;
                        break;
                    }
                }

                if (support_on['lander'] !== global.space.lander.on){
                    $(`#space-lander .on`).addClass('warn');
                    $(`#space-lander .on`).prop('title',`ON ${support_on['lander']}/${global.space.lander.on}`);
                }
                else {
                    $(`#space-lander .on`).removeClass('warn');
                    $(`#space-lander .on`).prop('title',`ON`);
                }
            }
            else {
                global.space.fob.troops = 0;
                $(`#space-lander .on`).addClass('warn');
                $(`#space-lander .on`).prop('title',`ON 0/${global.space.lander.on}`);
            }
        }

        if (p_on['s_gate'] && p_on['foothold']){
            let increment = 2.5;
            let consume = (p_on['foothold'] * increment);
            while (consume * $ctx.time_multiplier > global.resource['Elerium'].amount && consume > 0){
                consume -= increment;
                p_on['foothold']--;
            }
            breakdown.p.consume.Elerium[loc('galaxy_foothold')] = -(consume);
            let number = consume * $ctx.time_multiplier;
            modRes('Elerium', -(number));
        }

        if(global.race['fasting']){
            const foodBuildings = ["city:tourist_center", "space:spaceport", "int_:starport", "gxy_:starbase"/*, "space:space_station", "space:embassy"*/, "space:space_barracks", "int_:zoo", "eden_:restaurant"];
            //titan quarters is excluded but not necessary because the scenario is incompatible with true path.
            //some buildings are excluded to make progression not impossible.
            for(let i=0;i<foodBuildings.length;i++){
                let parts = foodBuildings[i].split(":");
                let space = convertSpaceSector(parts[0]);
                let region = parts[0] === 'city' ? parts[0] : space;
                if (global[region][parts[1]] && global[region][parts[1]]['on']){
                    if(p_on[parts[1]]){
                        p_on[parts[1]] = 0;
                    }
                    $(`#${region}-${parts[1]} .on`).addClass('warn');
                    $(`#${region}-${parts[1]} .on`).prop('title',`ON 0`);
                }else {
                    $(`#${region}-${parts[1]} .on`).removeClass('warn');
                    $(`#${region}-${parts[1]} .on`).prop('title',`ON`);
                }
            }
            global.civic.meditator.display = true;
        }

        // Moon Bases, Spaceports, Etc
        [
            { a: 'space', r: 'spc_moon', s: 'moon_base', g: 'moon' },
            { a: 'space', r: 'spc_red', s: 'spaceport', g: 'red' },
            { a: 'space', r: 'spc_titan', s: 'electrolysis', g: 'titan' },
            { a: 'space', r: 'spc_titan', r2: 'spc_enceladus', s: 'titan_spaceport', g: 'enceladus' },
            { a: 'space', r: 'spc_eris', s: 'drone_control', g: 'eris' },
            { a: 'tauceti', r: 'tau_home', s: 'orbital_station', g: 'tau_home' },
            { a: 'tauceti', r: 'tau_red', s: 'orbital_platform', g: 'tau_red' },
            { a: 'tauceti', r: 'tau_roid', s: 'patrol_ship', g: 'tau_roid', oc: true },
            { a: 'eden', r: 'eden_asphodel', s: 'encampment', g: 'asphodel' },
        ].forEach(function(sup){
            sup['r2'] = sup['r2'] || sup.r;
            if (global[sup.a][sup.s] && global[sup.a][sup.s].count > 0){
                if (!p_structs.includes(`${sup.r}:${sup.s}`)){
                    p_on[sup.s] = global[sup.a][sup.s].on;
                }

                if (actions[sup.a][sup.r][sup.s].hasOwnProperty('support_fuel')){
                    let s_fuels = actions[sup.a][sup.r][sup.s].support_fuel();
                    if (!Array.isArray(s_fuels)){
                        s_fuels = [s_fuels];
                    }
                    for (let j=0; j<s_fuels.length; j++){
                        let fuel = s_fuels[j];
                        let fuel_cost = ['Oil','Helium_3'].includes(fuel.r) ? (sup.a === 'space' ? +fuel_adjust(fuel.a,true) : +int_fuel_adjust(fuel.a)) : fuel.a;
                        let mb_consume = p_on[sup.s] * fuel_cost;
                        breakdown.p.consume[fuel.r][actions[sup.a][sup.r][sup.s].title] = -(mb_consume);
                        for (let i=0; i<p_on[sup.s]; i++){
                            if (!modRes(fuel.r, -($ctx.time_multiplier * fuel_cost))){
                                mb_consume -= (p_on[sup.s] * fuel_cost) - (i * fuel_cost);
                                p_on[sup.s] = i;
                                break;
                            }
                        }
                        if (p_on[sup.s] < global[sup.a][sup.s].on){
                            $(`#space-${sup.s} .on`).addClass('warn');
                            $(`#space-${sup.s} .on`).prop('title',`ON ${p_on[sup.s]}/${global[sup.a][sup.s].on}`);
                        }
                        else {
                            $(`#space-${sup.s} .on`).removeClass('warn');
                            $(`#space-${sup.s} .on`).prop('title',`ON`);
                        }
                    }
                }

                global[sup.a][sup.s].s_max = p_on[sup.s] * actions[sup.a][sup.r][sup.s].support();
                switch (sup.g){
                    case 'moon':
                        {
                            global[sup.a][sup.s].s_max += global.tech['luna'] && global.tech['luna'] >= 2 ? p_on['nav_beacon'] * actions.space.spc_home.nav_beacon.support() : 0;
                        }
                        break;
                    case 'red':
                        {
                            global[sup.a][sup.s].s_max += global.tech['mars'] && global.tech['mars'] >= 3 ? p_on['red_tower'] * actions.space.spc_red.red_tower.support() : 0;
                            global[sup.a][sup.s].s_max += global.tech['luna'] && global.tech['luna'] >= 3 ? p_on['nav_beacon'] * actions.space.spc_home.nav_beacon.support() : 0;
                        }
                        break;
                    case 'tau_home':
                        {
                            global[sup.a][sup.s].s_max += p_on['tau_farm'] ? p_on['tau_farm'] : 0;
                        }
                        break;
                    case 'asphodel':
                        {
                            global[sup.a][sup.s].s_max += (p_on['rectory'] ? p_on['rectory'] : 0) * actions.eden.eden_asphodel.rectory.support();
                            global[sup.a][sup.s].s_max += (p_on['corruptor'] ? p_on['corruptor'] : 0) * actions.eden.eden_asphodel.corruptor.support();
                        }
                        break;
                }
            }

            if (global[sup.a][sup.s] && sup.r === 'spc_eris' && !p_on['ai_core2']){
                global[sup.a][sup.s].s_max = 0;
            }

            if (global[sup.a][sup.s]){
                let used_support = 0;
                let area_structs = global.support[sup.g].map(x => x.split(':')[1]);
                for (let i = 0; i < area_structs.length; i++){
                    if (global[sup.a][area_structs[i]]){
                        let id = actions[sup.a][sup.r2][area_structs[i]].id;
                        let supportSize = actions[sup.a][sup.r2][area_structs[i]].hasOwnProperty('support') ? actions[sup.a][sup.r2][area_structs[i]].support() * -1 : 1;
                        let operating = global[sup.a][area_structs[i]].on;
                        let remaining_support = global[sup.a][sup.s].s_max - used_support;

                        if ((operating * supportSize > remaining_support) && !sup.oc){
                            operating = Math.floor(remaining_support / supportSize);
                            $(`#${id} .on`).addClass('warn');
                            $(`#${id} .on`).prop('title',`ON ${operating}/${global[sup.a][area_structs[i]].on}`);
                        }
                        else {
                            $(`#${id} .on`).removeClass('warn');
                            $(`#${id} .on`).prop('title',`ON`);
                        }

                        if (actions[sup.a][sup.r2][area_structs[i]].hasOwnProperty('support_fuel')){
                            let s_fuels = actions[sup.a][sup.r2][area_structs[i]].support_fuel();
                            if (!Array.isArray(s_fuels)){
                                s_fuels = [s_fuels];
                            }
                            for (let j=0; j<s_fuels.length; j++){
                                let fuel = s_fuels[j];
                                let fuel_cost = ['Oil','Helium_3'].includes(fuel.r) ? (sup.a === 'space' ? +fuel_adjust(fuel.a,true) : +int_fuel_adjust(fuel.a)) : fuel.a;
                                let mb_consume = operating * fuel_cost;
                                breakdown.p.consume[fuel.r][actions[sup.a][sup.r2][area_structs[i]].title] = -(mb_consume);
                                for (let i=0; i<operating; i++){
                                    if (!modRes(fuel.r, -($ctx.time_multiplier * fuel_cost))){
                                        mb_consume -= (operating * fuel_cost) - (i * fuel_cost);
                                        operating -= i;
                                        break;
                                    }
                                }
                            }
                        }

                        used_support += operating * supportSize;
                        support_on[area_structs[i]] = operating;
                    }
                    else {
                        support_on[area_structs[i]] = 0;
                    }
                }
                global[sup.a][sup.s].support = used_support;
            }
        });

        $ctx.womling_technician = 1;
        if (global.tech['womling_technicians']){
            $ctx.womling_technician = 1 + (p_on['womling_station'] * (global.tech['isolation'] ? 0.30 : 0.08));
            if (global.tech['womling_gene']){
                $ctx.womling_technician *= 1.25;
            }
        }

        // Space Marines
        if (global.space['space_barracks'] && !global.race['fasting']){
            let oil_cost = +fuel_adjust(2,true);
            let sm_consume = global.space.space_barracks.on * oil_cost;
            breakdown.p.consume.Oil[loc('tech_space_marines_bd')] = -(sm_consume);
            for (let i=0; i<global.space.space_barracks.on; i++){
                if (!modRes('Oil', -($ctx.time_multiplier * oil_cost))){
                    sm_consume -= (global.space.space_barracks.on * oil_cost) - (i * oil_cost);
                    global.space.space_barracks.on -= i;
                    break;
                }
            }
        }

        if (p_on['red_factory'] && p_on['red_factory'] > 0){
            let h_consume = p_on['red_factory'] * fuel_adjust(1,true);
            modRes('Helium_3',-(h_consume * $ctx.time_multiplier));
            breakdown.p.consume.Helium_3[structName('factory')] = -(h_consume);
        }

        if (p_on['int_factory'] && p_on['int_factory'] > 0){
            let d_consume = p_on['int_factory'] * int_fuel_adjust(5);
            modRes('Deuterium',-(d_consume * $ctx.time_multiplier));
            breakdown.p.consume.Deuterium[loc('interstellar_int_factory_title')] = -(d_consume);
        }

        if (support_on['water_freighter'] && support_on['water_freighter'] > 0){
            let h_cost = fuel_adjust(5,true);
            let h_consume = support_on['water_freighter'] * h_cost;
            for (let i=0; i<support_on['water_freighter']; i++){
                if (!modRes('Helium_3', -($ctx.time_multiplier * h_cost))){
                    h_consume -= (support_on['water_freighter'] * h_cost) - (i * h_cost);
                    support_on['water_freighter'] -= i;
                    break;
                }
            }
            breakdown.p.consume.Helium_3[loc('space_water_freighter_title')] = -(h_consume);
        }
}
