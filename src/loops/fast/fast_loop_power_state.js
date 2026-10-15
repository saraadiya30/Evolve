// Status listrik per tick: global.city.power, power_total, catatan sumber listrik untuk tooltip, dan penanda powerMeter.
import { global } from '../../core/vars.js';
import { S_loops as S } from '../../core/registries.js';

export function fastLoopPowerState($ctx){
        S.powerParts = $ctx.power_parts;
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
