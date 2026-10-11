// Konsumsi bahan bakar kapal shipyard dan discharge trait emfield per tick. Dulu awal fastLoopCore_s7.
import { global, breakdown } from '../../core/vars.js';
import { modRes } from '../../functions/resource_mod.js';
import { loc } from '../../core/locale.js';
import { shipFuelUse } from '../../truepath/ship_stats.js';

export function fastLoopShipyardFuel($ctx){
        if (global.space['shipyard'] && global.space.shipyard['ships']){
            let fuels = {
                Oil: 0,
                Helium_3: 0,
                Uranium: 0,
                Elerium: 0
            };
            global.space.shipyard.ships.forEach(function(ship){
                if (ship.location !== 'spc_dwarf' || ship.transit !== 0){
                    let fuel = shipFuelUse(ship);
                    if (fuel.res && fuel.burn > 0){
                        if (fuel.burn * $ctx.time_multiplier < global.resource[fuel.res].amount + (global.resource[fuel.res].diff > 0 ? global.resource[fuel.res].diff * $ctx.time_multiplier : 0)){
                            modRes(fuel.res, -(fuel.burn * $ctx.time_multiplier));
                            ship.fueled = true;
                            fuels[fuel.res] += fuel.burn;
                        }
                        else {
                            ship.fueled = false;
                        }
                    }
                    else {
                        ship.fueled = true;
                    }
                }
            });

            breakdown.p.consume.Oil[loc('outer_shipyard_fleet')] = -(fuels.Oil);
            breakdown.p.consume.Helium_3[loc('outer_shipyard_fleet')] = -(fuels.Helium_3);
            breakdown.p.consume.Uranium[loc('outer_shipyard_fleet')] = -(fuels.Uranium);
            breakdown.p.consume.Elerium[loc('outer_shipyard_fleet')] = -(fuels.Elerium);
        }

        if (global.race['emfield']){
            if (global.race['discharge'] && global.race['discharge'] > 0){
                global.race.discharge--;
            }
            else {
                global.race.emfield++;
                if (Math.rand(0,500) === 0){
                    global.race['discharge'] = global.race.emfield;
                    global.race.emfield = 1;
                }
            }
        }
}
