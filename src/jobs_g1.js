import { loc } from './locale.js';
import { global, keyMultiplier, p_on, tmp_vars } from './vars.js';
import { traits, biomes, planetTraits, servantTrait, racialTrait } from './races.js';
import { govActive } from './governor.js';
import { planetName } from './space.js';
import { vBind, easterEgg, popover, clearElement } from './functions.js';
import { getStructNumActive, actions } from './actions.js';
import { job_desc } from './jobs.js';
import { loadFoundry } from './jobs_g2.js';

// Fungsi-fungsi dipindah dari jobs.js (urutan sumber dipertahankan). jobs.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


// Sets up jobs in civics tab
export function defineJobs(define){
    if (!define){
        $('#civics').append($(`<h2 class="is-sr-only">${loc('civics_jobs')}</h2><div class="tile is-child jobList"><div id="sshifter" class="tile sshifter"></div><div id="jobs" class="tile is-child"></div><div id="foundry" class="tile is-child"></div><div id="servants" class="tile is-child"></div><div id="skilledServants" class="tile is-child"></div></div>`));
    }
    loadJob('unemployed',define,0,0,'warning');
    loadJob('hunter',define,0,0);
    loadJob('forager',define,0,0);
    loadJob('farmer',define,0.82,5);
    loadJob('lumberjack',define,1,5);
    loadJob('quarry_worker',define,1,5);
    loadJob('crystal_miner',define,0.1,5);
    loadJob('scavenger',define,0.12,5);
    loadJob('teamster',define,1,global.tech['teamster'] ? 6 : 4);
    loadJob('meditator',define,1,5);
    loadJob('torturer',define,1,3,'advanced');
    loadJob('miner',define,1,4,'advanced');
    loadJob('coal_miner',define,0.2,4,'advanced');
    loadJob('craftsman',define,1,5,'advanced');
    loadJob('cement_worker',define,0.4,5,'advanced');
    loadJob('entertainer',define,1,10,'advanced');
    loadJob('priest',define,1,3,'advanced');
    loadJob('professor',define,0.5,6,'advanced');
    loadJob('scientist',define,1,5,'advanced');
    loadJob('banker',define,0.1,6,'advanced');
    loadJob('colonist',define,1,5,'advanced');
    loadJob('titan_colonist',define,1,5,'advanced');
    loadJob('space_miner',define,1,5,'advanced');
    loadJob('hell_surveyor',define,1,1,'advanced');
    loadJob('archaeologist',define,1,1,'advanced');
    loadJob('ghost_trapper',define,1,3,'advanced');
    loadJob('elysium_miner',define,1,3,'advanced');
    loadJob('pit_miner',define,1,4.5,'advanced');
    loadJob('crew',define,1,4,'alert');
    if (!define && !global.race['start_cataclysm']){
        ['Scarletite','Quantium'].forEach(function (res){
            limitCraftsmen(res, false);
        });
        loadFoundry();
        if (global.race['servants']){
            loadServants();
        }
    }
}

export function workerScale(num,job){
    if (global.race['strong'] && ['hunter','forager','farmer','lumberjack','quarry_worker','crystal_miner','scavenger'].includes(job)){
        num *= traits.strong.vars()[1];
    }
    if ((global.race['swift'] || global.race['living_tool']) && ['hunter','forager','farmer','lumberjack','quarry_worker','crystal_miner','scavenger'].includes(job)){
        num *= traits.strong.vars(0.25)[1];
    }
    let teacher = govActive('teacher',1);
    if(teacher && ['professor'].includes(job)){
        num *= 1 + (teacher / 100);
    }
    if (global.race['lone_survivor']){
        if (['hunter','forager','farmer','lumberjack','quarry_worker','crystal_miner','scavenger'].includes(job)){
            num *= 80;
        }
        else if (['craftsman'].includes(job)){
            num *= 60;
        }
        else if (['miner','coal_miner','cement_worker','banker','entertainer','priest','pit_miner'].includes(job)){
            num *= 45;
        }
        else if (['professor','scientist'].includes(job)){
            num *= 125;
        }
    }
    return num;
}

export function jobScale(num){
    if (global.race['high_pop']){
        return num * traits.high_pop.vars()[0];
    }
    return num;
}

export function setJobName(job){
    let job_name = '';
    if (global.race['unfathomable'] && job === 'hunter'){
        job_name = loc('job_raider');
    }
    else if (global.race.universe === 'magic' && job === 'scientist'){
        job_name = loc('job_wizard');
    }
    else if (global.race['truepath'] && job === 'colonist'){
        job_name = loc('job_colonist_tp',[planetName().red]);
    }
    else if (job === 'titan_colonist'){
        job_name = loc('job_colonist_tp',[planetName().titan]);
    }
    else if (global.race.universe === 'evil' && job === 'priest' && global.civic.govern.type != 'theocracy'){
        job_name = loc('job_pofficer');
    }
    else if (job === 'lumberjack' && global.race['evil'] && (!global.race['soul_eater'] || global.race.species === 'wendigo')){
        job_name = loc('job_reclaimer');
    }
    else {
        job_name = loc('job_' + job);
    }
    global['civic'][job].name = job_name;
}

export function jobName(job){
    let name = global.civic[job]?.name || loc(`job_${job}`);
    return name;
}

export function loadJob(job, define, impact, stress, color){
    let servant = false;
    if (define === 'servant'){
        servant = true;
        define = false;
    }
    if (!global['civic'][job]){
        global['civic'][job] = {
            job: job,
            display: false,
            workers: 0,
            max: 0,
            impact: impact
        };
    }

    let noControl = {};
    if (global.race['warlord']){
        noControl['miner'] = true;
    }

    setJobName(job);

    if (!global.civic[job]['assigned']){
        global.civic[job]['assigned'] = job === 'craftsman'? 0 : global.civic[job].workers;
    }

    if (!servant){
        global.civic[job]['stress'] = stress;
        global.civic[job].impact = impact;
    }

    if (job === 'craftsman' || define){
        return;
    }

    var id = servant ? 'servant-' + job : 'civ-' + job;

    var civ_container = $(`<div id="${id}" v-show="showJob('${job}')" class="job"></div>`);
    var controls = servant ? $(`<div class="controls"></div>`) : $(`<div v-show="!isDefault('${job}')" class="controls"></div>`);
    if (!color || job === 'unemployed'){
        color = color || 'info';
        let job_label = servant
         ? $(`<div class="job_label"><h3 class="has-text-${color}">{{ civic.${job}.name }}</h3><span class="count">{{ sjob.${job} }}</span></div>`)
         : $(`<div class="job_label"><h3><a class="has-text-${color}" @click="setDefault('${job}')">{{ civic.${job}.name }}{{ '${job}' | d_state }}</a></h3><span class="count" v-html="$options.filters.event(civic.${job}.workers)">{{ civic.${job}.workers }}</span></div>`);
        civ_container.append(job_label);
    }
    else {
        let job_label = $(`<div class="job_label"><h3 class="has-text-${color}">{{ civic.${job}.name }}</h3><span :class="level('${job}')">{{ civic.${job}.workers | adjust('${job}') }} / {{ civic.${job}.max | adjust('${job}') }}</span></div>`);
        civ_container.append(job_label);
    }
    civ_container.append(controls);
    $(servant ? '#servants' : '#jobs').append(civ_container);

    if (job !== 'crew' && !noControl[job]){
        var sub = $(`<span role="button" aria-label="${loc('remove')} ${global['civic'][job].name}" class="sub has-text-danger" @click="sub"><span>&laquo;</span></span>`);
        var add = $(`<span role="button" aria-label="${loc('add')} ${global['civic'][job].name}" class="add has-text-success" @click="add"><span>&raquo;</span></span>`);
        controls.append(sub);
        controls.append(add);
    }

    if (servant){
        vBind({
            el: `#${id}`,
            data: {
                civic: global.civic,
                sjob: global.race.servants.jobs
            },
            methods: {
                showJob(j){
                    return global.civic[j].display || (j === 'scavenger' && global.race.servants.force_scavenger);
                },
                add(){
                    let keyMult = keyMultiplier();
                    for (let i=0; i<keyMult; i++){
                        if (global.race.servants.max > global.race.servants.used){
                            global.race.servants.jobs[job]++;
                            global.race.servants.used++;
                        }
                        else {
                            break;
                        }
                    }
                },
                sub(){
                    let keyMult = keyMultiplier();
                    for (let i=0; i<keyMult; i++){
                        if (global.race.servants.jobs[job] > 0){
                            global.race.servants.jobs[job]--;
                            global.race.servants.used--;
                        }
                        else {
                            break;
                        }
                    }
                }
            }
        });
    }
    else {
        vBind({
            el: `#${id}`,
            data: {
                civic: global.civic
            },
            methods: {
                showJob(j){
                    return global.civic[j].display;
                },
                add(){
                    let keyMult = keyMultiplier();
                    for (let i=0; i<keyMult; i++){
                        if ((global['civic'][job].max === -1 || global.civic[job].workers < global['civic'][job].max) && (global.civic[global.civic.d_job] && global.civic[global.civic.d_job].workers > 0)){
                            global.civic[job].workers++;
                            global.civic[global.civic.d_job].workers--;
                            global.civic[job].assigned = global.civic[job].workers;
                        }
                        else {
                            break;
                        }
                    }
                },
                sub(){
                    let keyMult = keyMultiplier();
                    for (let i=0; i<keyMult; i++){
                        if (global.civic[job].workers > 0){
                            global.civic[job].workers--;
                            global.civic[global.civic.d_job].workers++;
                            global.civic[job].assigned = global.civic[job].workers;
                        }
                        else {
                            break;
                        }
                    }
                },
                level(job){
                    if (global.civic[job].workers === 0){
                        return 'count has-text-danger';
                    }
                    else if (global.civic[job].workers === global.civic[job].max){
                        return 'count has-text-success';
                    }
                    else if (global.civic[job].workers <= global.civic[job].max / 3){
                        return 'count has-text-caution';
                    }
                    else if (global.civic[job].workers <= global.civic[job].max * 0.66){
                        return 'count has-text-warning';
                    }
                    else if (global.civic[job].workers < global.civic[job].max){
                        return 'count has-text-info';
                    }
                    else {
                        return 'count';
                    }
                },
                setDefault(j){
                    global.civic.d_job = j;
                },
                isDefault(j){
                    return global.civic.d_job === j;
                }
            },
            filters: {
                d_state(j){
                    return global.civic.d_job === j ? '*' : '';
                },
                event(c){
                    if ((job === 'unemployed' && global.civic.unemployed.display) || (job === 'hunter' && !global.civic.unemployed.display)){
                        let egg = easterEgg(3,14);
                        if (c === 0 && egg.length > 0){
                            return egg;
                        }
                    }
                    return c;
                },
                adjust(v,j){
                    if (j === 'titan_colonist' && p_on['ai_colonist']){
                        return v + jobScale(p_on['ai_colonist']);
                    }
                    return v;
                }
            }
        });
    }

    popover(id, function(){
            return job_desc[job](servant);
        },
        {
            elm: `#${id} .job_label`,
            classes: `has-background-light has-text-dark`
        }
    );
}

export function loadServants(){
    clearElement($('#servants'));
    if (global.race['servants'] && Object.keys(global.race.servants.jobs).length > 0){
        var servants = $(`<div id="servantList" class="job"><div class="foundry job_label"><h3 class="serveHeader has-text-warning">${loc('civics_servants')}</h3><span :class="level()">{{ s.used }} / {{ s.max }}</span></div></div>`);
        $('#servants').append(servants);

        ['hunter','forager','farmer','lumberjack','quarry_worker','crystal_miner','scavenger'].forEach(function(job){
            loadJob(job,'servant');
        });

        vBind({
            el: `#servantList`,
            data: {
                s: global.race.servants
            },
            methods: {
                level(){
                    if (global.race.servants.used === 0){
                        return 'count has-text-danger';
                    }
                    else if (global.race.servants.used === global.race.servants.max){
                        return 'count has-text-success';
                    }
                    else if (global.race.servants.used <= global.race.servants.max / 3){
                        return 'count has-text-caution';
                    }
                    else if (global.race.servants.used <= global.race.servants.max * 0.66){
                        return 'count has-text-warning';
                    }
                    else if (global.race.servants.used < global.race.servants.max){
                        return 'count has-text-info';
                    }
                    else {
                        return 'count';
                    }
                }
            }
        });

        popover('servants', function(){
                return loc('civics_servants_desc');
            },
            {
                elm: `#servants .serveHeader`
            }
        );
    }
}

export function teamsterCap(){
    let transport = 0;
    if (global.race['gravity_well']){
        transport = global.tech['transport'] ? global.tech.transport : 0;
        transport = Math.round(global.race.teamster / transport * 1.5);
    }
    if (global.tech['railway']){
        transport -= global.tech['railway'] * 2;
    }
    if (transport < 0){ transport = 0; }
    return transport;
}

export function craftsmanCap(res){
    switch (res){
        case 'Scarletite':
            if (global.portal.hasOwnProperty('hell_forge')){
                let cap = getStructNumActive(actions.portal.prtl_ruins.hell_forge);
                return jobScale(cap);
            }
            return 0;

        case 'Quantium':
            let cap = 0;
            if (global.tech['isolation']){
                if (global.tauceti.hasOwnProperty('infectious_disease_lab')){
                    cap = getStructNumActive(actions.tauceti.tau_home.infectious_disease_lab);
                }
            }
            else if (global.space.hasOwnProperty('zero_g_lab')){
                cap = getStructNumActive(actions.space.spc_enceladus.zero_g_lab);
            }
            return jobScale(cap || 0);

        // This function isn't used to limit normal craftsmen
        default:
            return Number.MAX_SAFE_INTEGER;
    }
}

export function limitCraftsmen(res, allow_redraw = true){
    // Ignore undiscovered materials
    if (!global.resource[res].display){
        return;
    }

    // Remember previous crafter limits and refresh UI later on if they change
    if (!tmp_vars.hasOwnProperty('craftsman_cap')){
        tmp_vars.craftsman_cap = {};
    }

    let cap = craftsmanCap(res);
    let refresh = false;
    if (global.city.hasOwnProperty('foundry') && global.city.foundry.hasOwnProperty(res) && cap < global.city.foundry[res]){
        let diff = global.city.foundry[res] - cap;
        global.civic.craftsman.workers -= diff;
        global.city.foundry.crafting -= diff;
        global.city.foundry[res] -= diff;
        refresh = true;
    }
    else if (!tmp_vars['craftsman_cap'].hasOwnProperty(res)){
        refresh = true;
    }
    else if (cap != tmp_vars['craftsman_cap'][res]){
        refresh = true;
    }
    tmp_vars['craftsman_cap'][res] = cap;

    // Refresh UI when the cap changes due to power balancing
    if (allow_redraw && refresh){
        loadFoundry();
    }
}

export function farmerValue(farm,servant){
    let farming = global.civic.farmer.impact;
    if (farm){
        farming += global.tech['agriculture'] && global.tech.agriculture >= 2 ? 1.15 : 0.65;
    }
    if (global.race['living_tool'] && !servant){
        farming *= 1 + traits.living_tool.vars()[0] * (global.tech['science'] && global.tech.science > 0 ? global.tech.science / 5 : 0);
    }
    else {
        farming *= 1 + (global.tech['hoe'] && global.tech.hoe > 0 ? global.tech.hoe / 3 : 0);
    }
    farming *= global.city.biome === 'grassland' ? biomes.grassland.vars()[0] : 1;
    farming *= global.city.biome === 'savanna' ? biomes.savanna.vars()[0] : 1;
    farming *= global.city.biome === 'ashland' ? biomes.ashland.vars()[0] : 1;
    farming *= global.city.biome === 'volcanic' ? biomes.volcanic.vars()[0] : 1;
    farming *= global.city.biome === 'hellscape' ? biomes.hellscape.vars()[0] : 1;
    farming *= global.city.ptrait.includes('trashed') ? planetTraits.trashed.vars()[0] : 1;
    if (servant){
        farming *= servantTrait(global.race.servants.jobs.farmer,'farmer');
    }
    else {
        farming *= racialTrait(global.civic.farmer.workers,'farmer');
    }
    farming *= global.tech['agriculture'] >= 7 ? 1.1 : 1;
    farming *= global.race['low_light'] ? (1 - traits.low_light.vars()[0] / 100) : 1;
    return farming;
}
