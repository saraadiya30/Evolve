// Jumlah trade route: reset breakdown t_route, mtrade, banana, trade post, wharf, gps, storage yard, bazaar, railway, dan titan spaceport.
import { global, breakdown, p_on } from '../../core/vars.js';
import { structName } from '../../actions/core/structure_ui.js';
import { loc } from '../../core/locale.js';
import { traits } from '../../core/registries.js';
import { spatialReasoning } from '../../resources/resources.js';
import { faithTempleCount } from '../../resources/aether_alchemy.js';

export function midLoopTradeRoutes($ctx){
        breakdown['t_route'] = {};
        global.city.market.mtrade = 0;
        if (global.race['banana']){
            global.city.market.mtrade++;
            breakdown.t_route[loc('base')] = 1;
        }
        if (global.city['trade']){
            let routes = global.race['nomadic'] || global.race['xenophobic'] ? global.tech.trade : global.tech.trade + 1;
            if (global.tech['trade'] && global.tech['trade'] >= 3){
                routes--;
            }
            if (global.race['flier']){
                routes += traits.flier.vars()[1];
            }
            routes *= 100;
            global.city.market.mtrade += routes * global.city.trade.count;
            breakdown.t_route[loc('city_trade')] = routes * global.city.trade.count;
            if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 3){
                let r_count = faithTempleCount();
                global.city.market.mtrade += r_count;
                breakdown.t_route[global.race['cataclysm'] ? loc('space_red_ziggurat_title') : structName('temple')] = r_count;
            }
        }

        if (global.city['wharf']){
            let r_count = global.city.wharf.count * 2 * 100;
            global.city.market.mtrade += r_count;
            breakdown.t_route[loc('city_wharf')] = r_count;
        }
        if (global.space['gps'] && global.space.gps.count >= 4){
            let r_count = global.space.gps.count * 2 * 100;
            global.city.market.mtrade += global.space.gps.count * 2 * 100;
            breakdown.t_route[loc('space_home_gps_title')] = r_count;
        }
        if (global.city['storage_yard'] && global.tech['trade'] && global.tech['trade'] >= 3){
            let r_count = global.city.storage_yard.count * 100;
            global.city.market.mtrade += r_count;
            breakdown.t_route[loc('city_storage_yard')] = r_count;
        }
        if (global.portal['bazaar'] && global.portal['spire']){
            let r_count = global.portal.bazaar.count * global.portal.spire.count;
            global.city.market.mtrade += r_count;
            breakdown.t_route[loc('portal_bazaar_title')] = r_count;
        }
        if (global.tech['railway']){
            let routes = 0;
            if (global.race['cataclysm'] || global.race['orbit_decayed']){
                routes = global.space['gps'] ? Math.floor(global.space.gps.count / 3) : 0;
            }
            else if (global.race['warlord']){
                routes = 5;
            }
            else {
                routes = global.city['storage_yard'] ? Math.floor(global.city.storage_yard.count / 6) : 0;
            }
            if (global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 2){
                routes++;
            }
            routes *= 10000;
            global.city.market.mtrade += global.tech['railway'] * routes;
            breakdown.t_route[loc('arpa_projects_railway_title')] = global.tech['railway'] * routes;
        }
        if (p_on['titan_spaceport']){
            let water = p_on['titan_spaceport'] * spatialReasoning(250);
            $ctx.caps['Water'] += water;
            breakdown.c.Water[loc('space_red_spaceport_title')] = water+'v';
        }
}
