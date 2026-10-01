import { global, save, webWorker } from '../core/vars.js';
import { loc } from '../core/locale.js';
import { races } from '../core/registries.js';
import { addATime } from './game_loop_timing.js';
import { clearPopper } from './popover.js';
export { gameLoop, loopTimers, addATime, exceededATimeThreshold } from './game_loop_timing.js';
export { powerGrid } from '../industry/power_grid.js';
export { tagEvent } from './analytics.js';
export { timeScale, TIME_ACCELERATION_FACTOR, resetResBuffer, modRes } from './resource_mod.js';
export { removeFromQueue, removeFromRQueue, calcQueueMax, calcRQueueMax, buildQueue, decodeStructId } from './queues.js';
export { initMessageQueue, messageQueue } from './message_log.js';
export { popover, clearPopper } from './popover.js';
export { genCivName } from './civ_name.js';
export { costMultiplier, spaceCostMultiplier, harmonyEffect } from './cost_multipliers.js';
export { calcQuantumLevel, get_qlevel } from './quantum_level.js';
export { powerModifier, powerCostMod, darkEffect } from './power_modifiers.js';
export { clearElement, vBind } from './dom_helpers.js';
export { timeCheck, arpaTimeCheck, timeFormat } from './time_format.js';
import { masteryType } from './prestige_calc.js';
export { masteryType, challenge_multiplier, getResetConstants, calcPrestige } from './prestige_calc.js';
export { adjustCosts } from './cost_adjusters.js';
export { svgIcons, svgViewBox, getBaseIcon, drawIcon, drawPet, easterEgg, easterEggBind, trickOrTreat, trickOrTreatBind, format_emblem, binary_limit_test, fibonacci, randomKey, sLevel } from './icons_easter_eggs.js';
export { popCost } from './cost_adjusters.js';
import { hoovedRename } from './run_stats_helpers.js';
import { rName } from './resource_name.js';
export { calcGenomeScore, updateResetStats, flib, shrineBonusActive, getShrineBonus, hoovedRename } from './run_stats_helpers.js';
export { deepClone } from '../core/object_utils.js';
export { eventActive, getEaster, getHalloween } from './event_dates.js';
export { getTraitDesc } from './trait_description.js';
import { S_functions as S } from '../core/registries.js';

S.popperRef = false;

if ('ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/ && global.settings.touch) ? true : false){
    $(document).on('touchend',function(e){
        if ($(`.popper`).length === 1){
            clearPopper();
            return;
        }
    });
}


window.exportGame = function exportGame(){
    if (global.race['noexport']){
        return `Export is not available during ${global.race['noexport']} Creation`;
    }
    addATime(Date.now());
    return LZString.compressToBase64(JSON.stringify(global));
}

window.importGame = function importGame(data,utf16){
    let saveState = JSON.parse(utf16 ? LZString.decompressFromUTF16(data) : LZString.decompressFromBase64(data));
    if (saveState && 'evolution' in saveState && 'settings' in saveState && 'stats' in saveState && 'plasmid' in saveState.stats){
        if (webWorker.w){
            webWorker.w.terminate();
        }
        if (saveState.hasOwnProperty('tech') && utf16){
            if (saveState.tech.hasOwnProperty('whitehole') && saveState.tech.whitehole >= 4){
                saveState.tech.whitehole = 3;
                saveState.resource.Soul_Gem.amount += 10;
                saveState.resource.Knowledge.amount += 1500000;
                saveState.stats.know -= 1500000;
            }
            if (saveState.tech.hasOwnProperty('quaked') && saveState.tech.quaked === 2){
                saveState.tech.quaked = 1;
                saveState.resource.Knowledge.amount += 500000;
                saveState.stats.know -= 500000;
            }
            if (saveState.tech.hasOwnProperty('corrupted_ai') && saveState.tech.corrupted_ai === 3){
                saveState.tech.corrupted_ai = 1;
                saveState.resource.Knowledge.amount += 5000000;
                saveState.stats.know -= 5000000;
            }
        }
        // prevent invalid message colors from escaping class attribute
        if (Array.isArray(saveState.lastMsg)){
            // Legacy save file: prior to v1.1.4
            for (let i = 0; i < saveState.lastMsg.length; i++){
                saveState.lastMsg[i].c = saveState.lastMsg[i].c.replaceAll('"', '');
            }
        }
        else {
            // Save file from v1.1.4 or newer
            for (const msgQueue in saveState.lastMsg){
                for (const msg of saveState.lastMsg[msgQueue]){
                    msg.c = msg.c.replaceAll('"', '');
                }
            }
        }
        save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(saveState)));
        window.location.reload();
    }
}


export const calc_mastery = (function(){
    let mastery;
    return function(recalc){
        if (mastery && !recalc){
            return mastery;
        }
        else if (global.genes['challenge'] && global.genes.challenge >= 2){
            mastery = masteryType(global.race.universe);
            return mastery;
        }
        return 0;
    }
})();

export const calcPillar = (function(){
    let bonus;
    return function(recalc){
        if (!bonus || recalc){
            let active = 0;
            Object.keys(global.pillars).forEach(function(race){
                if (races[race] && global.race.species === race){
                    active += 4;
                }
                else if (races[race]){
                    active++;
                }
            });
            bonus = [
                1 + (active / 100), // Production
                1 + (active * 2 / 100) // Storage
            ];
        }
        return bonus;
    }
})();


export const traitExtra = {
    infiltrator: [
        loc(`wiki_trait_effect_infiltrator_ex1`),
        loc(`wiki_trait_effect_infiltrator_ex2`,[
            [
                `<span class="has-text-warning">${loc('tech_steel')}</span>`, `<span class="has-text-warning">${loc('tech_electricity')}</span>`, `<span class="has-text-warning">${loc('tech_electronics')}</span>`, `<span class="has-text-warning">${loc('tech_fission')}</span>`,
                `<span class="has-text-warning">${loc('tech_rocketry')}</span>`, `<span class="has-text-warning">${loc('tech_artificial_intelligence')}</span>`, `<span class="has-text-warning">${loc('tech_quantum_computing')}</span>`,
                `<span class="has-text-warning">${loc('tech_virtual_reality')}</span>`, `<span class="has-text-warning">${loc('tech_shields')}</span>`, `<span class="has-text-warning">${loc('tech_ai_core')}</span>`, `<span class="has-text-warning">${loc('tech_graphene_processing')}</span>`,
                `<span class="has-text-warning">${loc('tech_nanoweave')}</span>`, `<span class="has-text-warning">${loc('tech_orichalcum_analysis')}</span>`, `<span class="has-text-warning">${loc('tech_infernium_fuel')}</span>`
            ].join(', ')
        ])
    ],
    heavy: [
        loc(`wiki_trait_effect_heavy_ex1`,[rName('Stone'),rName('Cement'),rName('Wrought_Iron')])
    ],
    sniper: [
        loc(`wiki_trait_effect_sniper_ex1`),
    ],
    hooved: [
        function(opts){return loc(`wiki_trait_effect_hooved_ex1`,[hoovedRename(false, opts.species)])},
        loc(`wiki_trait_effect_hooved_ex2`,[
            `<span class="has-text-warning">${global.resource.hasOwnProperty('Lumber') ? global.resource.Lumber.name : loc('resource_Lumber_name')}</span>`,
            `<span class="has-text-warning">${global.resource.hasOwnProperty('Copper') ? global.resource.Copper.name : loc('resource_Copper_name')}</span>`,
            `<span class="has-text-warning">${global.resource.hasOwnProperty('Iron') ? global.resource.Iron.name : loc('resource_Iron_name')}</span>`,
            `<span class="has-text-warning">${global.resource.hasOwnProperty('Steel') ? global.resource.Steel.name : loc('resource_Steel_name')}</span>`,
            `<span class="has-text-warning">${global.resource.hasOwnProperty('Adamantite') ? global.resource.Adamantite.name : loc('resource_Adamantite_name')}</span>`,
            `<span class="has-text-warning">${global.resource.hasOwnProperty('Orichalcum') ? global.resource.Orichalcum.name : loc('resource_Orichalcum_name')}</span>`,
            12,75,150,500,5000
        ]),
        loc(`wiki_trait_effect_hooved_ex3`),
        function(opts){return loc(`wiki_trait_effect_hooved_ex4`,[`<span class="has-text-warning">${5}</span>`,hoovedRename(false, opts.species)])},
        loc(`wiki_trait_effect_hooved_ex5`,[
            `<span class="has-text-warning">${global.resource.hasOwnProperty('Lumber') ? global.resource.Lumber.name : loc('resource_Lumber_name')}</span>`,
            `<span class="has-text-warning">${global.resource.hasOwnProperty('Copper') ? global.resource.Copper.name : loc('resource_Copper_name')}</span>`
        ]),
    ],
    instinct: [
        loc(`wiki_trait_effect_instinct_ex1`,[6.67,loc('galaxy_chthonian'),10])
    ],
    logical: [
        loc(`wiki_trait_effect_logical_ex1`,[
            global.tech.hasOwnProperty('science') ? global.tech.science : 0,
            global.tech.hasOwnProperty('high_tech') ? global.tech.high_tech : 0
        ]),
    ],
    high_pop: [
        loc(`wiki_trait_effect_high_pop_ex1`)
    ],
    flier: [
        loc(`wiki_trait_effect_flier_ex1`)
    ],
    unfathomable: [
        loc(`wiki_trait_effect_unfathomable_ex1`),
        loc(`wiki_trait_effect_unfathomable_ex2`)
    ]
};

export const altTraitDesc = {
    befuddle: 'warlord',
    blurry: 'warlord',
    ghostly: 'warlord',
    playful: 'warlord',
};
