// Flag dan unlock UI luar angkasa per tick: graphene hack, replicator, stargate (showGalactic), shipyard (showShipYard). Dulu bagian dari fastLoopCore_s4.
import { global, breakdown, p_on, support_on } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { loc } from '../../core/locale.js';
import { renderSpace } from '../../space/space_requirements.js';
import { replicator } from '../../industry/industry_panels.js';

export function fastLoopSpaceUnlocks($ctx){
        // Graphene Hack
        if (global.tech['isolation'] && global.race['truepath']){
            support_on['g_factory'] = p_on['refueling_station'];
            global.space.g_factory.count = global.tauceti.refueling_station.count;
            global.space.g_factory.on = global.tauceti.refueling_station.on;
        }

        if (global.race['replicator'] && p_on['replicator']){
            let res = global.race.replicator.res;
            if (!['Asphodel_Powder','Elysanite'].includes(res)){
                let vol = replicator(res,p_on['replicator']);
                breakdown.p.consume[res][loc('tau_replicator_db')] = vol;
                modRes(res, $ctx.time_multiplier * vol);
            }
        }

        // Stargate
        if (p_on['s_gate']){
            if (!global.settings.showGalactic){
                global.settings.showGalactic = true;
                global.settings.space.stargate = true;
                renderSpace();
            }
        }
        else {
            global.settings.showGalactic = false;
            global.settings.space.stargate = false;
        }

        // Ship Yard
        if (p_on['shipyard']){
            global.settings.showShipYard = true;
        }
        else {
            global.settings.showShipYard = false;
            if (global.settings.govTabs === 5){
                global.settings.govTabs = 0;
            }
        }
}
