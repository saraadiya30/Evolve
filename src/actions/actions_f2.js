import { global } from '../core/vars.js';
import { clearElement } from '../functions/functions.js';
import { actions } from './actions_registry.js';
import { removeAction } from './actions_f6.js';
import { addAction } from './actions_f4.js';
import { evoProgress } from './actions_f7.js';
import { setChallengeScreen } from './actions_f1.js';
import { buildTemplate_s1, buildTemplate_s2 } from '../sections/sec_buildTemplate_1.js';

// Fungsi-fungsi dipindah dari actions.js (urutan sumber dipertahankan). actions.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function buildTemplate(key, region){
    const $ctx = {};
    $ctx.key = key;
    $ctx.region = region;
    buildTemplate_s1($ctx);
        { const $r = buildTemplate_s2($ctx); if ($r) return $r.$r; }
}

export function genus_condition(r,t){
    t = t || 'evo';
    let f = global.evolution['final'] || 0;
    return ((global.tech[t] && global.tech[t] === r) || (global.evolution['gselect'])) && f < 100;
}

export function drawEvolution(){
    if (!global.settings.tabLoad && global.settings.civTabs !== 0){
        return;
    }
    if (global.race.universe === 'bigbang' || (global.race.seeded && !global.race['chose'])){
        return;
    }
    if (global.tech['evo_challenge']){
        let list = $(`#evolution .evolving`).nextAll();
        Object.values(list).forEach(function(elm){
            clearElement($(elm),true);
        });
        clearElement($(`#evolution .evolving`),true);
    }

    Object.keys(actions.evolution).forEach(function (evo) {
        if (!actions.evolution[evo]['challenge']){
            removeAction(actions.evolution[evo].id);

            var isMet = true;
            if (actions.evolution[evo].hasOwnProperty('reqs')){
                Object.keys(actions.evolution[evo].reqs).forEach(function (req){
                    if (!global.tech[req] || global.tech[req] < actions.evolution[evo].reqs[req]){
                        isMet = false;
                    }
                });
            }

            if (isMet){
                addAction('evolution', evo);
            }
        }
    });

    if (!global.race['evoFinalMenu']){
        if (global.tech['evo'] && global.tech.evo >= 2){
            evoProgress();
        }
        if (global.tech['evo_challenge']){
            setChallengeScreen();
        }
    }
}
