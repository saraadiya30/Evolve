// Level kuantum, belt mining, asteroid, dan gas moon. Dulu ujung midLoop_s6.
import { global, support_on, p_on, set_qlevel } from '../../core/vars.js';
import { actions } from '../../core/registries.js';
import { drawTech } from '../../actions/core/action_runner.js';
import { initStruct } from '../../actions/core/structure_ui.js';
import { loc } from '../../core/locale.js';
import { modRes } from '../../functions/resource_mod.js';
import { messageQueue } from '../../functions/message_log.js';
import { calcQuantumLevel } from '../../functions/quantum_level.js';
import { planetName } from '../../space/planet_name.js';
import { renderSpace } from '../../space/space_requirements.js';

export function midLoopAsteroidMining($ctx){
        set_qlevel(calcQuantumLevel(false));

        let belt_mining = support_on['iron_ship'] + support_on['iridium_ship'];
        if (belt_mining > 0 && global.tech['asteroid'] && global.tech['asteroid'] === 3){
            if (Math.rand(0,250) <= belt_mining){
                global.tech['asteroid'] = 4;
                global.resource.Elerium.display = true;
                modRes('Elerium',1,true);
                drawTech();
                messageQueue(loc('discover_elerium'),'info',false,['progress']);
            }
        }

        if (global.tech['asteroid'] && global.tech.asteroid === 4 && global.resource.Elerium.amount === 0){
            modRes('Elerium',1,true);
        }

        if (p_on['outpost'] > 0 && global.tech['gas_moon'] && global.tech['gas_moon'] === 1){
            if (Math.rand(0,100) <= p_on['outpost']){
                initStruct(actions.space.spc_gas_moon.oil_extractor);
                global.tech['gas_moon'] = 2;
                messageQueue(loc('discover_oil',[planetName().gas_moon]),'info',false,['progress']);
                renderSpace();
            }
        }
}
