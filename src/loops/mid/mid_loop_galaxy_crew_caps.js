// Trade route galaksi dan batas crew kapal galaksi dan transport.
import { global, breakdown, gal_on } from '../../core/vars.js';
import { actions } from '../../core/registries.js';
import { loc } from '../../core/locale.js';

export function midLoopGalaxyCrewCaps($ctx){
        breakdown['gt_route'] = {};
        if (global.galaxy['freighter']){
            breakdown.gt_route[loc('galaxy_freighter')] = gal_on['freighter'] * 2;
        }
        if (global.galaxy['super_freighter']){
            breakdown.gt_route[loc('galaxy_super_freighter')] = gal_on['super_freighter'] * 5;
        }
        if (global.galaxy['bolognium_ship']){
            $ctx.lCaps['crew'] += global.galaxy.bolognium_ship.on * actions.galaxy.gxy_gateway.bolognium_ship.ship.civ();
        }
        if (global.galaxy['scout_ship']){
            $ctx.lCaps['crew'] += global.galaxy.scout_ship.on * actions.galaxy.gxy_gateway.scout_ship.ship.civ();
        }
        if (global.galaxy['corvette_ship']){
            $ctx.lCaps['crew'] += global.galaxy.corvette_ship.on * actions.galaxy.gxy_gateway.corvette_ship.ship.civ();
        }
        if (global.galaxy['frigate_ship']){
            $ctx.lCaps['crew'] += global.galaxy.frigate_ship.on * actions.galaxy.gxy_gateway.frigate_ship.ship.civ();
        }
        if (global.galaxy['cruiser_ship']){
            $ctx.lCaps['crew'] += global.galaxy.cruiser_ship.on * actions.galaxy.gxy_gateway.cruiser_ship.ship.civ();
        }
        if (global.galaxy['dreadnought']){
            $ctx.lCaps['crew'] += global.galaxy.dreadnought.on * actions.galaxy.gxy_gateway.dreadnought.ship.civ();
        }
        if (global.galaxy['freighter']){
            $ctx.lCaps['crew'] += global.galaxy.freighter.on * actions.galaxy.gxy_gorddon.freighter.ship.civ();
        }
        if (global.galaxy['super_freighter']){
            $ctx.lCaps['crew'] += global.galaxy.super_freighter.on * actions.galaxy.gxy_alien1.super_freighter.ship.civ();
        }
        if (global.galaxy['armed_miner']){
            $ctx.lCaps['crew'] += global.galaxy.armed_miner.on * actions.galaxy.gxy_alien2.armed_miner.ship.civ();
        }
        if (global.galaxy['scavenger']){
            $ctx.lCaps['crew'] += global.galaxy.scavenger.on * actions.galaxy.gxy_alien2.scavenger.ship.civ();
        }
        if (global.portal['transport']){
            $ctx.lCaps['crew'] += global.portal.transport.on * actions.portal.prtl_lake.transport.ship.civ();
        }
}
