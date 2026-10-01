// Status listrik per tick: bonus power dari stock portfolio, global.city.power dan penanda powerMeter.
import { global } from '../../core/vars.js';
import { POWER_BONUS_PER_LOT } from '../../stocks/stocks_core.js';

export function fastLoopPowerState($ctx){
        // Stock portfolio power bonus: a flat +1 Power (Watt) per lot held, added the same way as the morale
        // bonus above - recomputed every tick from current holdings, so selling lots takes the Power away again.
        if (global.stocks && global.stocks.market && global.stocks.market.Power && global.stocks.market.Power.lots > 0){
            $ctx.power_grid += global.stocks.market.Power.lots * POWER_BONUS_PER_LOT;
        }
        // Power grid state
        global.city.power_total = -$ctx.max_power;
        global.city.power = $ctx.power_grid;
        if (global.city.power < 0){
            $('#powerMeter').addClass('low');
            $('#powerMeter').removeClass('neutral');
            $('#powerMeter').removeClass('high');
        }
        else if (global.city.power > 0){
            $('#powerMeter').removeClass('low');
            $('#powerMeter').removeClass('neutral');
            $('#powerMeter').addClass('high');
        }
        else {
            $('#powerMeter').removeClass('low');
            $('#powerMeter').addClass('neutral');
            $('#powerMeter').removeClass('high');
        }
}
