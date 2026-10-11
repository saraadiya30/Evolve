// Unlock tech dari kondisi struktur per detik: scout ship, scavenger, syndicate, AI drift, arpa auto. Dulu awal longLoop_s3.
import { global, p_on, gal_on } from '../../core/vars.js';
import { actions } from '../../core/registries.js';
import { drawTech } from '../../actions/core/action_runner.js';
import { messageQueue } from '../../functions/message_log.js';
import { loc } from '../../core/locale.js';
import { calcAIDrift } from '../../truepath/support.js';
import { govTitle } from '../../civics/military/gov_calc.js';
import { buildGene } from './build_gene.js';

export function longLoopTechUnlocks($ctx){
        if (!global.tech['xeno'] && global.galaxy['scout_ship'] && gal_on['scout_ship'] > 0 && Math.rand(0, 10) === 0){
            global.tech['xeno'] = 1;
            global.galaxy.scout_ship.count--;
            global.galaxy.scout_ship.on--;
            let civPerShip = actions.galaxy.gxy_gateway.scout_ship.ship.civ();
            let milPerShip = actions.galaxy.gxy_gateway.scout_ship.ship.mil();
            global.galaxy.scout_ship.crew -= civPerShip;
            global.galaxy.scout_ship.mil -= milPerShip;
            global.resource[global.race.species].amount -= civPerShip;
            global.civic.garrison.workers -= milPerShip;
            global.civic.garrison.crew -= milPerShip;
            messageQueue(loc('galaxy_encounter'),'info',false,['progress']);
            drawTech();
        }

        if (global.galaxy['scavenger'] && global.tech['conflict'] && global.tech['conflict'] === 4 && gal_on['scavenger'] > 0 && Math.rand(0, 50) <= gal_on['scavenger']){
            global.tech['conflict'] = 5;
            messageQueue(loc('galaxy_scavenger_find'),'info',false,['progress']);
            drawTech();
        }

        if (!global.tech['syndicate'] && !global.race['lone_survivor'] && global.tech['outer'] && Math.rand(0, 20) === 0){
            messageQueue(loc('outer_syndicate',[govTitle(4)]),'info',false,['progress']);
            global.tech['syndicate'] = 1;
            global.space['syndicate'] = {};
        }

        if (!global.tech['corrupted_ai'] && p_on['ai_core2'] && calcAIDrift() === 100){
            global.tech['corrupted_ai'] = 1;
            drawTech();
        }

        if (global.arpa.sequence && global.arpa.sequence['auto'] && global.tech['genetics'] && global.tech['genetics'] === 7){
            buildGene();
        }
}
