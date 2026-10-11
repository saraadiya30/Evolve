// Batas resource dari nexus, gateway station, telemetry beacon, scavenger galaksi, dan eden encampment. Dulu bagian dari midLoop_s4.
import { global, breakdown, p_on, gal_on } from '../../core/vars.js';
import { loc } from '../../core/locale.js';
import { spatialReasoning } from '../../resources/resources.js';

export function midLoopGalaxyStructureCaps($ctx){
        if (p_on['nexus']){
            let helium_gain = p_on['nexus'] * spatialReasoning(4000);
            $ctx.caps['Helium_3'] += helium_gain;
            breakdown.c.Helium_3[loc('interstellar_nexus_title')] = helium_gain+'v';

            let oil_gain = (p_on['nexus'] * spatialReasoning(3500));
            $ctx.caps['Oil'] += oil_gain;
            breakdown.c.Oil[loc('interstellar_nexus_title')] = oil_gain+'v';

            let deuterium_gain = p_on['nexus'] * spatialReasoning(3000);
            $ctx.caps['Deuterium'] += deuterium_gain;
            breakdown.c.Deuterium[loc('interstellar_nexus_title')] = deuterium_gain+'v';

            let elerium_gain = p_on['nexus'] * spatialReasoning(25);
            $ctx.caps['Elerium'] += elerium_gain;
            breakdown.c.Elerium[loc('interstellar_nexus_title')] = elerium_gain+'v';
        }
        if (p_on['s_gate'] && global.galaxy['gateway_station']){
            let helium_gain = p_on['gateway_station'] * spatialReasoning(2000);
            $ctx.caps['Helium_3'] += helium_gain;
            breakdown.c.Helium_3[loc('galaxy_gateway_station')] = helium_gain+'v';

            let deuterium_gain = p_on['gateway_station'] * spatialReasoning(4500);
            $ctx.caps['Deuterium'] += deuterium_gain;
            breakdown.c.Deuterium[loc('galaxy_gateway_station')] = deuterium_gain+'v';

            let gain = p_on['gateway_station'] * spatialReasoning(50);
            $ctx.caps['Elerium'] += gain;
            breakdown.c.Elerium[loc('galaxy_gateway_station')] = gain+'v';
        }
        if (p_on['s_gate'] && p_on['telemetry_beacon']){
            let base_val = global.tech['telemetry'] ? 1200 : 800;
            if (global.tech.science >= 17){
                base_val += gal_on['scout_ship'] * 25;
            }
            let gain = p_on['telemetry_beacon'] ** 2 * base_val;
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('galaxy_telemetry_beacon_bd')] = gain+'v';
        }
        if (p_on['s_gate'] && gal_on['scavenger']){
            let gain = gal_on['scavenger'] * Math.round($ctx.pirate_alien2 * 25000);
            $ctx.caps['Knowledge'] += gain;
            breakdown.c.Knowledge[loc('galaxy_scavenger')] = gain+'v';
        }

        if (global.eden['encampment']){
            let powder = global.eden.encampment.count * spatialReasoning(250);
            $ctx.caps['Asphodel_Powder'] += powder;
            breakdown.c.Asphodel_Powder[loc('eden_encampment_title')] = powder+'v';
        }
}
