import { astrologySign } from '../../functions/astrology.js';
import { global } from '../../core/vars.js';
import { midLoopEvolutionCaps } from './mid_loop_evolution_caps.js';
import { midLoopCapsInit } from './mid_loop_caps_init.js';
import { midLoopEvilUniverseCaps } from './mid_loop_evil_universe_caps.js';
import { midLoopTraitCaps } from './mid_loop_trait_caps.js';
import { midLoopSpecialStructureCaps } from './mid_loop_special_structure_caps.js';
import { midLoopCrateContainerCaps } from './mid_loop_crate_container_caps.js';
import { midLoopExtractionCaps } from './mid_loop_extraction_caps.js';
import { midLoopCasinoCaps } from './mid_loop_casino_caps.js';
import { midLoopFactoryJobCaps } from './mid_loop_factory_job_caps.js';
import { midLoopGarrisonCaps } from './mid_loop_garrison_caps.js';
import { midLoopJobCaps } from './mid_loop_job_caps.js';
import { midLoopHousingCaps } from './mid_loop_housing_caps.js';
import { midLoopWarehouseCaps } from './mid_loop_warehouse_caps.js';
import { midLoopFuelFoodStorageCaps } from './mid_loop_fuel_food_storage_caps.js';
import { midLoopBonusCaps } from './mid_loop_bonus_caps.js';
import { midLoopKnowledgeCaps } from './mid_loop_knowledge_caps.js';
import { midLoopLabCaps } from './mid_loop_lab_caps.js';
import { midLoopOmniscienceCaps } from './mid_loop_omniscience_caps.js';
import { midLoopBankCaps } from './mid_loop_bank_caps.js';
import { midLoopStationCaps } from './mid_loop_station_caps.js';
import { midLoopCraftsmanJobCaps } from './mid_loop_craftsman_job_caps.js';
import { midLoopGalaxyStructureCaps } from './mid_loop_galaxy_structure_caps.js';
import { midLoopTradeRoutes } from './mid_loop_trade_routes.js';
import { midLoopMiscJobCaps } from './mid_loop_misc_job_caps.js';
import { midLoopMagicUniverse } from './mid_loop_magic_universe.js';
import { midLoopGalaxyCrewCaps } from './mid_loop_galaxy_crew_caps.js';
import { midLoopTauCetiCaps } from './mid_loop_tauceti_caps.js';
import { midLoopPopulationLoss } from './mid_loop_population_loss.js';
import { midLoopFinalCapBonuses } from './mid_loop_final_cap_bonuses.js';
import { midLoopStorageFinalize } from './mid_loop_storage_finalize.js';
import { midLoopServants } from './mid_loop_servants.js';
import { midLoopSpecialJobs } from './mid_loop_special_jobs.js';
import { midLoopEspionage } from './mid_loop_espionage.js';
import { midLoopBananaExport } from './mid_loop_banana_export.js';
import { midLoopGalaxyDefense } from './mid_loop_galaxy_defense.js';
import { midLoopActionAvailability } from './mid_loop_action_availability.js';
import { midLoopSwarmSequence } from './mid_loop_swarm_sequence.js';
import { midLoopFoundryKindling } from './mid_loop_foundry_kindling.js';
import { midLoopAsteroidMining } from './mid_loop_asteroid_mining.js';
import { midLoopMechbay } from './mid_loop_mechbay.js';
import { midLoopTraitEvents } from './mid_loop_trait_events.js';
import { midLoopCasting } from './mid_loop_casting.js';
import { midLoopResearchQueue } from './mid_loop_research_queue.js';
import { midLoopFinalize } from './mid_loop_finalize.js';
import { buildTPShipQueue } from '../../truepath/tau_ceti_shipyard.js';
import { shipCosts } from '../../truepath/ship_desc.js';
import { mechCost } from '../../portal/mech/mech_cost.js';
import { buildMechQueue } from '../../portal/mech/mech_lab.js';
import { actions } from '../../core/registries.js';
import { checkAffordable } from '../../actions/core/action_costs.js';
import { postBuild } from '../../actions/core/action_runner.js';
import { arpaTimeCheck, timeCheck } from '../../functions/time_format.js';
import { buildQueue } from '../../functions/queues.js';
import { messageQueue } from '../../functions/message_log.js';
import { clearPopper } from '../../functions/popover.js';
import { buildArpa } from '../../arpa/arpa_project_building.js';
import { loc } from '../../core/locale.js';
import { resourceAlt } from '../long/long_loop.js';

// Fungsi-fungsi dipindah dari main.js (urutan sumber dipertahankan). main.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function midLoop(){
    const $ctx = {};
    $ctx.astroSign = astrologySign();
    if (global.race.species === 'protoplasm'){
        midLoopEvolutionCaps($ctx);
    }
    else {
        // Resource caps
        midLoopCapsInit($ctx);
        midLoopEvilUniverseCaps($ctx);
        midLoopTraitCaps($ctx);
        midLoopSpecialStructureCaps($ctx);
        midLoopCrateContainerCaps($ctx);
        midLoopExtractionCaps($ctx);
        midLoopCasinoCaps($ctx);
        midLoopFactoryJobCaps($ctx);
        midLoopGarrisonCaps($ctx);
        midLoopJobCaps($ctx);
        midLoopHousingCaps($ctx);
        midLoopWarehouseCaps($ctx);
        midLoopFuelFoodStorageCaps($ctx);
        midLoopBonusCaps($ctx);
        midLoopKnowledgeCaps($ctx);
        midLoopLabCaps($ctx);
        midLoopOmniscienceCaps($ctx);
        midLoopBankCaps($ctx);
        midLoopStationCaps($ctx);
        midLoopCraftsmanJobCaps($ctx);
        midLoopGalaxyStructureCaps($ctx);
        midLoopTradeRoutes($ctx);
        midLoopMiscJobCaps($ctx);
        midLoopMagicUniverse($ctx);
        midLoopGalaxyCrewCaps($ctx);
        midLoopTauCetiCaps($ctx);
        midLoopPopulationLoss($ctx);
        midLoopFinalCapBonuses($ctx);
        midLoopStorageFinalize($ctx);
        midLoopServants($ctx);
        midLoopSpecialJobs($ctx);
        midLoopEspionage($ctx);
        midLoopBananaExport($ctx);
        midLoopGalaxyDefense($ctx);
        midLoopActionAvailability($ctx);
        midLoopSwarmSequence($ctx);
        midLoopFoundryKindling($ctx);
        midLoopAsteroidMining($ctx);
        midLoopMechbay($ctx);
        midLoopTraitEvents($ctx);
        midLoopCasting($ctx);
        midLoopResearchQueue($ctx);
        midLoopFinalize($ctx);
    }

    if (global.tech['queue'] && global.queue.display){
        let idx = -1;
        let c_action = false;
        let stop = false;
        let deepScan = ['space','interstellar','galaxy','portal','tauceti','eden'];
        let time = 0;
        let spent = { t: {t:0,rt:0}, r: {}, rr: {}, id: {}};
        let arpa = false;
        for (let i=0; i<global.queue.queue.length; i++){
            if (global.settings.qAny){
                spent = { t: {t:0,rt:0}, r: {}, rr: {}, id: {}};
                time = 0;
            }
            let struct = global.queue.queue[i];

            let t_action = false;
            if (struct.action === 'tp-ship'){
                let raw = shipCosts(struct.type);
                let costs = {};
                Object.keys(raw).forEach(function(res){
                    costs[res] = function(){ return raw[res]; }
                });
                t_action = { 
                    id: struct.id,
                    cost: costs,
                    type: 'tp-ship',
                    bp: struct.type,
                    doNotAdjustCost: true,
                };
            }
            else if (struct.action === 'hell-mech'){
                let costs = mechCost(struct.type.size,struct.type.infernal,true);
                t_action = { 
                    id: struct.id,
                    cost: costs,
                    type: 'hell-mech',
                    bp: struct.type,
                    doNotAdjustCost: true,
                };
            }
            else if (deepScan.includes(struct.action)){
                for (let region in actions[struct.action]) {
                    if (actions[struct.action][region][struct.type]){
                        t_action = actions[struct.action][region][struct.type];
                        break;
                    }
                }
            }
            else {
                t_action = actions[struct.action][struct.type];
            }

            if (struct.action === 'arpa'){
                let remain = (100 - global.arpa[struct.type].complete) / 100;
                let t_time = arpaTimeCheck(t_action, remain, spent);
                struct['bres'] = false;
                if (t_time >= 0){
                    time += t_time;
                    struct['time'] = time;
                    for (let j=1; j<struct.q; j++){
                        let tc = arpaTimeCheck(t_action, 1, spent, true);
                        time += tc.t;
                        struct['bres'] = tc.r;
                    }
                    struct['t_max'] = time;
                }
                else {
                    struct['time'] = -1;
                }

                if (arpaTimeCheck(t_action, 0.01) >= 0){
                    if (global.settings.qAny && !global.queue.pause && struct['time'] > 1){
                        buildArpa(struct.type,100,true);
                    }
                    else if (!stop){
                        c_action = t_action;
                        idx = i;
                        arpa = true;
                        stop = true;
                    }
                }
            }
            else {
                if (checkAffordable(t_action,true,t_action['doNotAdjustCost'] ? true : false,true)){
                    struct.cna = false;
                    let t_time = timeCheck(t_action, spent);
                    struct['bres'] = false;
                    if (t_time >= 0){
                        if (!stop && checkAffordable(t_action,false,t_action['doNotAdjustCost'] ? true : false)){
                            c_action = t_action;
                            idx = i;
                            arpa = false;
                            if (global.settings.qAny){
                                stop = true;
                            }
                        }
                        else {
                            time += t_time;
                        }
                        if (!global.settings.qAny){
                            stop = true;
                        }
                        struct['time'] = time;
                        let br = false;
                        for (let j=1; j<struct.q; j++){
                            let tc = timeCheck(t_action, spent, true);
                            time += tc.t;
                            br = tc.r;
                        }
                        struct['t_max'] = time;
                        struct['bres'] = br;
                    }
                    else {
                        struct['time'] = t_time;
                    }
                }
                else {
                    struct.cna = true;
                    struct['time'] = -1;
                }
            }
            struct.qa = global.settings.qAny ? true : false;
        }
        if (idx >= 0 && c_action && !global.queue.pause){
            let triggerd = false;
            if (arpa){
                let label = global.queue.queue[idx].label;
                if (buildArpa(global.queue.queue[idx].type,100,true,true)){
                    messageQueue(loc('build_success',[label]),'success',false,['queue','building_queue']);
                    if (global.queue.queue[idx].q > 1){
                        global.queue.queue[idx].q--;
                    }
                    else {
                        clearPopper(`q${c_action.id}${idx}`);
                        global.queue.queue.splice(idx,1);
                        buildQueue();
                    }
                }
            }
            else if (c_action.hasOwnProperty('type') && c_action.type === 'tp-ship'){
                if (buildTPShipQueue(c_action)){
                    clearPopper(`q${c_action.id}${idx}`);
                    global.queue.queue.splice(idx,1);
                    buildQueue();
                }
            }
            else if (c_action.hasOwnProperty('type') && c_action.type === 'hell-mech'){
                if (buildMechQueue(c_action)){
                    clearPopper(`q${c_action.id}${idx}`);
                    global.queue.queue.splice(idx,1);
                    buildQueue();
                }
            }
            else {
                let attempts = global.queue.queue[idx].q;
                let struct = global.queue.queue[idx];
                let report_in = c_action['queue_complete'] ? c_action.queue_complete() : 1;
                for (let i=0; i<attempts; i++){
                    if (c_action.action({isQueue: true}) !== false){
                        triggerd = true;
                        if (report_in - i <= 1){
                            messageQueue(loc('build_success',[global.queue.queue[idx].label]),'success',false,['queue','building_queue']);
                        }
                        if (global.queue.queue[idx].q > 1){
                            global.queue.queue[idx].q--;
                        }
                        else {
                            clearPopper(`q${c_action.id}${idx}`);
                            global.queue.queue.splice(idx,1);
                            buildQueue();
                        }
                        if (global.race['inflation'] && global.tech['primitive']){
                            if (!c_action.hasOwnProperty('inflation') || c_action.inflation){
                                global.race.inflation++;
                            }
                        }
                    }
                    else {
                        break;
                    }
                }
                if (triggerd){
                    postBuild(c_action,struct.action,struct.type);
                }
            }
        }

        let last = false;
        let used_slots = 0;
        let merged_queue = [];
        let update_queue = false;
        for (let i=0; i<global.queue.queue.length; i++){
            used_slots += Math.ceil(global.queue.queue[i].q / global.queue.queue[i].qs);
            if (used_slots > global.queue.max){
                let remaining = (Math.ceil(global.queue.queue[i].q / global.queue.queue[i].qs)) - (used_slots - global.queue.max);
                if (remaining === 0){
                    global.queue.queue.splice(i);
                }
                else {
                    global.queue.queue[i].q = remaining * global.queue.queue[i].qs;
                    global.queue.queue.splice(i+1);
                }
            }

            if (global.settings.q_merge === 'merge_nearby'){
                if (last === global.queue.queue[i].id){
                    clearPopper(`q${global.queue.queue[i].id}${i}`);
                    global.queue.queue[i-1].q += global.queue.queue[i].q;
                    global.queue.queue.splice(i,1);
                    buildQueue();
                    break;
                }
                last = global.queue.queue[i].id;
            }
            else if (global.settings.q_merge === 'merge_all'){
                let found = false;
                for (let k=0; k<merged_queue.length; k++){
                    if (merged_queue[k].id === global.queue.queue[i].id){
                        found = true;
                        update_queue = true;
                        merged_queue[k].q += global.queue.queue[i].q;
                        clearPopper(`q${global.queue.queue[i].id}${i}`);
                        break;
                    }
                }
                if (!found){
                    merged_queue.push(global.queue.queue[i]);
                }
            }
        }
        if (update_queue){
            for (let i=merged_queue.length; i<global.queue.queue.length; i++){
                clearPopper(`q${global.queue.queue[i].id}${i}`);
            }
            global.queue.queue = merged_queue;
            buildQueue();
        }
    }

    resourceAlt();

    $(`.costList`).each(function (){
        $(this).children().each(function (){
            let elm = $(this);
            this.className.split(/\s+/).forEach(function(cls){
                if (cls.startsWith(`res-`)){
                    let res = cls.split(`-`)[1];
                    if (global.resource.hasOwnProperty(res)){
                        let res_val = elm.attr(`data-${res}`);
                        let fail_max = global.resource[res].max >= 0 && res_val > global.resource[res].max ? true : false;
                        let avail = elm.attr(`data-ok`) ? elm.attr(`data-ok`) : 'has-text-dark';
                        if (global.resource[res].amount + global.resource[res].diff < res_val || fail_max){
                            if (elm.hasClass(avail)){
                                elm.removeClass(avail);
                                elm.addClass('has-text-danger');
                            }
                        }
                        else if (elm.hasClass('has-text-danger') || elm.hasClass('has-text-alert')){
                            elm.removeClass('has-text-danger');
                            elm.addClass(avail);
                        }
                    }
                }
            });
        });
    });

    {
        let msgHeight = $(`#msgQueue`).height();
        let buildHeight = $(`#buildQueue`).height();
        let totHeight = $(`.leftColumn`).height();
        let rem = $(`#topBar`).height();
        let min = rem * 5;
        let max = totHeight - (5 * rem);

        if (global.settings.q_resize !== 'manual') {
            const buildQueueElement = $(`#buildQueue`).get(0);
            if (['auto', 'grow'].includes(global.settings.q_resize) &&
                buildQueueElement.scrollHeight > buildQueueElement.clientHeight
            ) {
                // The build queue has a scroll-bar.
                buildHeight += buildQueueElement.scrollHeight - buildQueueElement.clientHeight;
            } else if (['auto', 'shrink'].includes(global.settings.q_resize)) {
                let minHeight = rem;
                buildQueueElement.childNodes.forEach(function (e) {
                    minHeight += e.clientHeight || 0;
                });

                if (buildQueueElement.clientHeight > minHeight) {
                    // The build queue is larger than it needs to be.
                    buildHeight = Math.min(buildHeight, minHeight);
                }
            }
        }

        if (msgHeight < min) {
            if (buildHeight > min){
                buildHeight -= (min - msgHeight);
            }
            msgHeight = min;
        }
        if (buildHeight < min) {
            buildHeight = min;
        }
        if (msgHeight + buildHeight > max){
            msgHeight -= (msgHeight + buildHeight) - max;
            if (msgHeight < rem) {
                msgHeight = rem;
            }
            if (msgHeight + buildHeight > max){
                buildHeight -= (msgHeight + buildHeight) - max;
                if (buildHeight < rem) {
                    buildHeight = rem;
                }
            }
        }

        if ($(`#msgQueue`).hasClass('right')){
            $(`#resources`).height(`calc(100vh - 5rem)`);
            if ($(`#msgQueue`).hasClass('vscroll')){
                $(`#msgQueue`).removeClass('vscroll');
                $(`#msgQueue`).addClass('sticky');
            }
            msgHeight = `calc(100vh - ${buildHeight}px - 6rem)`;
        }
        else {
            $(`#resources`).height(`calc(100vh - 5rem - ${buildHeight}px - ${msgHeight}px)`);
            if ($(`#msgQueue`).hasClass('sticky')){
                $(`#msgQueue`).removeClass('sticky');
                $(`#msgQueue`).addClass('vscroll');
                msgHeight = 100;
            }
        }

        $(`#msgQueue`).height(msgHeight);
        $(`#buildQueue`).height(buildHeight);
        global.settings.msgQueueHeight = msgHeight;
        global.settings.buildQueueHeight = buildHeight;
    }

    if ($(`#mechList`).length > 0){
        $(`#mechList`).css('height',`calc(100vh - 11.5rem - ${$(`#mechAssembly`).height()}px)`);
    }
    if ($(`#shipList`).length > 0){
        $(`#shipList`).css('height',`calc(100vh - 11.5rem - ${$(`#shipPlans`).height()}px)`);
    }
}
