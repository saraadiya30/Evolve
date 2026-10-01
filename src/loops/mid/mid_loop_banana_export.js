// Ekspor resource untuk ras banana.
import { global } from '../../core/vars.js';
import { unlockFeat } from '../../achievements/achievement_logic.js';
import { universeAffix } from '../../functions/universe_utils.js';

export function midLoopBananaExport($ctx){
        if (global.race['banana']){
            let exporting = false;
            let importing = 0;
            Object.keys(global.resource).forEach(function(res){
                if (global.resource[res].hasOwnProperty('trade') && global.resource[res].trade < 0){
                    if (exporting){
                        global.resource[res].trade = 0;
                    }
                    else {
                        exporting = res;
                    }
                }
                if (global.resource[res].hasOwnProperty('trade') && global.resource[res].trade > 0){
                    importing += global.resource[res].trade;
                }
            });
            if (global.resource[exporting] && global.resource[exporting].trade <= -500){
                let affix = universeAffix();
                global.stats.banana.b4[affix] = true;
                if (affix !== 'm' && affix !== 'l'){
                    global.stats.banana.b4.l = true;
                }
                if (importing >= 500){
                    unlockFeat('banana');
                }
            }
        }
}
