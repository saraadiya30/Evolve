import { genePool } from './arp_registry.js';
import { global, keyMultiplier, support_on, p_on } from './vars.js';
import { loc } from './locale.js';
import { checkCosts, actions, removeAction, addAction } from './actions.js';
import { adjustCosts, clearElement, vBind, trickOrTreat, timeFormat, easterEgg, popover } from './functions.js';
import { fathomCheck, traits, planetTraits, traitSkin } from './races.js';
import { genetics_s1, genetics_s2 } from './sec_genetics_1.js';
import { highPopAdjust } from './prod.js';
import { arpaProjects, bloodPool } from './arpa.js';
import { crispr, blood, addProject } from './arpa_g2.js';

// Fungsi-fungsi dipindah dari arpa.js (urutan sumber dipertahankan). arpa.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function arpa(type) {
    switch(type){
        case 'Physics':
            physics();
            break;
        case 'Genetics':
            genetics();
            break;
        case 'Monument':
            return pick_monument();
        case 'PhysicsTech':
            return arpaProjects;
        case 'GeneTech':
            return genePool;
        case 'BloodTech':
            return bloodPool;
        case 'Crispr':
            crispr();
            break;
        case 'Blood':
            blood();
            break;
    }
}

export function roid_eject_type(){
    if (!global.tech['roid_eject'] || global.tech['roid_eject'] <= 10){
        return loc('arpa_projects_roid_eject_asteroid');;
    }
    else if (global.tech['roid_eject'] <= 25){
        return loc('arpa_projects_roid_eject_moon');;
    }
    else if (global.tech['roid_eject'] <= 40){
        return loc('arpa_projects_roid_eject_dwarf');;
    }
    else if (global.tech['roid_eject'] <= 60){
        return loc('arpa_projects_roid_eject_planet');;
    }
    else {
        return loc('arpa_projects_roid_eject_remnant');;
    }
}

export function payCrispr(gene){
    let afford = true;
    let costs = genePool[gene].cost;
    Object.keys(costs).forEach(function(res){
        let oRes = res;
        if (res === 'Plasmid' && global.race.universe === 'antimatter'){
            res = 'AntiPlasmid';
        }
        if (global.prestige[res].count < costs[oRes]()){
            afford = false;
        }
    });

    if (afford){
        Object.keys(costs).forEach(function(res){
            let oRes = res;
            if (res === 'Plasmid' && global.race.universe === 'antimatter'){
                res = 'AntiPlasmid';
            }
            global.prestige[res].count -= costs[oRes]();
        });
        return true;
    }
    return false;
}

export function payBloodPrice(costs){
    if (checkCosts(costs)){
        Object.keys(costs).forEach(function (res){
            global.prestige[res].count -= costs[res]();
        });
        return true;
    }
    return false;
}

export function drawGenes(){
    Object.keys(actions.genes).forEach(function (gene) {
        removeAction(actions.genes[gene].id);
        if (checkGeneRequirements(gene)){
            addAction('genes',gene);
        }
    });
}

export function drawBlood(){
    Object.keys(actions.blood).forEach(function (trait) {
        removeAction(actions.blood[trait].id);
        if (checkBloodRequirements(trait)){
            addAction('blood',trait);
        }
    });
}

export function checkGeneRequirements(gene){
    var isMet = true;
    Object.keys(actions.genes[gene].reqs).forEach(function (req) {
        if (!global.genes[req] || global.genes[req] < actions.genes[gene].reqs[req]){
            isMet = false;
        }
    });
    if (isMet && (!global.genes[actions.genes[gene].grant[0]] || global.genes[actions.genes[gene].grant[0]] < actions.genes[gene].grant[1])){
        return true;
    }
    return false;
}

export function checkBloodRequirements(trait){
    var isMet = true;
    Object.keys(actions.blood[trait].reqs).forEach(function (req) {
        if (!global.blood[req] || global.blood[req] < actions.blood[trait].reqs[req]){
            isMet = false;
        }
    });
    if (isMet && (!global.blood[actions.blood[trait].grant[0]] || actions.blood[trait].grant[1] === '*' || global.blood[actions.blood[trait].grant[0]] < actions.blood[trait].grant[1])){
        return true;
    }
    return false;
}

export function gainGene(action){
    var gene = actions.genes[action].grant[0];
    global.genes[gene] = actions.genes[action].grant[1];
    crispr();
}

export function gainBlood(action){
    var trait = actions.blood[action].grant[0];
    if (actions.blood[action].grant[1] === '*'){
        global.blood[trait] ? global.blood[trait]++ : global.blood[trait] = 1;
    }
    else {
        global.blood[trait] = actions.blood[action].grant[1];
    }
    blood();
}

export function pick_monument(){
    let monuments = [];
    ['Obelisk','Statue','Sculpture'].forEach(function (type){
        if (type !== global.arpa['m_type']){
            monuments.push(type);
        }
    });
    if (!global.race['flier'] && global.arpa['m_type'] !== 'Monolith'){
        monuments.push('Monolith');
    }
    if (global.race['evil'] && global.arpa['m_type'] !== 'Pillar' && !global.race['kindling_kindred'] && !global.race['smoldering']){
        monuments.push('Pillar');
    }
    if (global.race.universe === 'magic' && global.arpa['m_type'] !== 'Megalith'){
        monuments.push('Megalith');
    }
    return monuments[Math.rand(0,monuments.length)];
}

export function monument_costs(res,offset,wiki){
    let type = wiki ? wiki.m_type : global.arpa.m_type;
    switch(type){
        case 'Obelisk':
            return res === 'Stone' ? costMultiplier('monument', offset, 1000000, 1.1, wiki) : 0;
        case 'Statue':
            return res === 'Aluminium' ? costMultiplier('monument', offset, 350000, 1.1, wiki) : 0;
        case 'Sculpture':
            return res === 'Steel' ? costMultiplier('monument', offset, 300000, 1.1, wiki) : 0;
        case 'Monolith':
            return res === 'Cement' ? costMultiplier('monument', offset, 300000, 1.1, wiki) : 0;
        case 'Pillar':
            return res === 'Lumber' ? costMultiplier('monument', offset, 1000000, 1.1, wiki) : 0;
        case 'Megalith':
            return res === 'Crystal' ? costMultiplier('monument', offset, 55000, 1.1, wiki) : 0;
    }
}

export function checkRequirements(tech){
    if (arpaProjects[tech]['condition'] && !arpaProjects[tech].condition()){
        return false;
    }
    let c_path = global.race['truepath'] ? 'truepath' : 'standard';
    if (arpaProjects[tech].hasOwnProperty('path') && !arpaProjects[tech].path.includes(c_path)){
        return false;
    }
    var isMet = true;
    Object.keys(arpaProjects[tech].reqs).forEach(function (req) {
        if (!global.tech[req] || global.tech[req] < arpaProjects[tech].reqs[req]){
            isMet = false;
        }
    });
    return isMet;
}

export function payArpaCosts(costs){
    costs = arpaAdjustCosts(costs);
    if (checkArpaCosts(costs)){
        Object.keys(costs).forEach(function (res){
            global['resource'][res].amount -= costs[res]() / 100;
        });
        return true;
    }
    return false;
}

export function checkArpaCosts(costs){
    var test = true;
    Object.keys(costs).forEach(function (res){
        var testCost = Number(costs[res]()) / 100;
        if (testCost > Number(global['resource'][res].amount)) {
            test = false;
            return false;
        }
    });
    return test;
}

export function arpaAdjustCosts(costs,offset,wiki){
    costs = creativeAdjust(costs,offset,wiki);
    return adjustCosts({ 'cost': costs },offset,wiki);
}

export function creativeAdjust(costs,offset,wiki){
    let fathom = fathomCheck('human');
    if ((wiki && wiki.creative) || (!wiki && global.race['creative']) || (!wiki && fathom > 0)){
        var newCosts = {};
        Object.keys(costs).forEach(function (res){
            newCosts[res] = function(){
                let cost = costs[res](offset, wiki);
                if((wiki && wiki.creative) || (!wiki && global.race['creative'])){
                    cost *= (1 - traits.creative.vars()[1] / 100);
                }
                if (fathom > 0){
                    cost *= 1 - (traits.creative.vars(1)[1] / 100 * fathom);
                }
                return cost;
            }
        });
        return newCosts;
    }
    return costs;
}

export function costMultiplier(project,offset,base,multiplier,wiki){
    var rank = global.arpa[project] ? global.arpa[project].rank : 0;
    if (((wiki && wiki.creative) || (!wiki && global.race['creative'])) && project !== 'syphon'){
        multiplier -= traits.creative.vars()[0];
    }
    if (offset){
        rank += offset;
    }
    return Math.round((multiplier ** rank) * base);
}

export function physics(){
    if (global.tech['high_tech'] && global.tech.high_tech >= 6){
        let parent = $('#arpaPhysics');
        clearElement(parent);
        Object.keys(arpaProjects).forEach(function (project){
            addProject(parent,project);
        });
    }
}

export function clearGeneticsDrag(){
    let el = $('#geneticMinor')[0];
    if (el){
        let sort = Sortable.get(el);
        if (sort){
            sort.destroy();
        }
    }
}

export function dragGeneticsList(){
    let el = $('#geneticMinor')[0];
    if (el){
        Sortable.create(el,{
            onEnd(e){
                let order = global.settings.mtorder;
                order.splice(e.newDraggableIndex, 0, order.splice(e.oldDraggableIndex, 1)[0]);
                global.settings.mtorder = order;
                genetics();
            }
        });
    }
}

export function genetics(){
    const $ctx = {};
    let parent = $('#arpaGenetics');
    clearGeneticsDrag();
    clearElement(parent);
    if (!global.settings.arpa.genetics){
        return false;
    }

    if (global.tech['genetics'] > 1){
        let genome = $(`<div id="arpaSequence" class="genome"></div>`);
        parent.append(genome);

        let label = global.tech.genetics > 2 ? loc('arpa_gene_mutation') : loc('arpa_sequence_genome');
        if (global.race['artifical']){
            label = global.tech.genetics > 2 ? loc('arpa_code_modification') : loc('arpa_decompile_source');
        }
        let sequence = $(`<div><span class="seqlbl has-text-warning">${label}</span> - ${loc('arpa_to_complete')} <span v-html="$options.filters.timer(time)"></span></div>`);
        genome.append(sequence);
        let progress = $(`<progress class="progress" :value="progress" max="${global.arpa.sequence.max}">{{ progress }}%</progress>`);
        genome.append(progress);
        let b_label = global.tech.genetics > 2 ? loc('arpa_mutate') : loc('arpa_sequence');
        if (global.race['artifical']){
            b_label = global.tech.genetics > 2 ? loc('arpa_modify') : loc('arpa_decompile');
        }
        let button = $(`<button class="button seq" @click="toggle">${b_label}</button>`);
        genome.append(button);

        if (global.tech['genetics'] >= 5){
            let boost = $(`<b-tooltip :label="boostLabel(false)" position="is-bottom" animated multilined><button class="button boost" @click="booster" :aria-label="boostLabel(true)">${loc('arpa_boost')}</button></b-tooltip>`);
            genome.append(boost);
        }

        if (global.tech['genetics'] >= 6){
            let boost = $(`<b-tooltip :label="novoLabel()" position="is-bottom" animated multilined><button class="button" @click="novo" :aria-label="novoLabel()">${loc(global.race['artifical'] ? 'arpa_novo_artifical' : 'arpa_novo')}</button></b-tooltip>`);
            genome.append(boost);
        }

        if (global.tech['genetics'] >= 7){
            let boost = $(`<b-tooltip :label="autoLabel(false)" position="is-bottom" animated multilined><button class="button auto" @click="auto_seq" :aria-label="autoLabel(true)">${loc(global.race['artifical'] ? 'arpa_auto_compile' : 'arpa_auto_sequence')}</button></b-tooltip>`);
            genome.append(boost);
        }

        if (global.arpa.sequence.on){
            $('#arpaSequence button.seq').addClass('has-text-success');
        }

        if (global.arpa.sequence.boost){
            $('#arpaSequence button.boost').addClass('has-text-success');
        }

        if (global.arpa.sequence.auto){
            $('#arpaSequence button.auto').addClass('has-text-success');
        }

        vBind({
            el: `#arpaSequence`,
            data: global.arpa.sequence,
            methods: {
                toggle(){
                    if (global.arpa.sequence.on){
                        global.arpa.sequence.on = false;
                        $('#arpaSequence button.seq').removeClass('has-text-success');
                    }
                    else {
                        global.arpa.sequence.on = true;
                        $('#arpaSequence button.seq').addClass('has-text-success');
                    }
                },
                booster(){
                    if (global.arpa.sequence.boost){
                        global.arpa.sequence.boost = false;
                        $('#arpaSequence button.boost').removeClass('has-text-success');
                    }
                    else {
                        global.arpa.sequence.boost = true;
                        $('#arpaSequence button.boost').addClass('has-text-success');
                    }
                },
                boostLabel(sr){
                    return loc(global.race['artifical'] ? 'arpa_boost_artifical_label' : 'arpa_boost_label') + (sr ? (global.arpa.sequence.boost ? loc('city_on') : loc('city_off')) : '');
                },
                novo(){
                    let keyMult = keyMultiplier();
                    let cost = 200000;
                    if (global.resource.Knowledge.amount >= cost){
                        let maxNovo = Math.floor(global.resource.Knowledge.amount / cost);
                        let actualNovo = Math.min(keyMult, maxNovo);
                        global.resource.Knowledge.amount -= cost * actualNovo;
                        global.resource.Genes.amount += actualNovo;

                        let trick = trickOrTreat(8,12,false);
                        if (trick.length > 0){
                            $(`#arpaSequence > div:first`).append(trick);
                        }
                    }
                },
                novoLabel(){
                    return loc(global.race['artifical'] ? 'arpa_novo_artifical_label' : 'arpa_novo_label',['200k']);
                },
                auto_seq(){
                    if (global.arpa.sequence.auto){
                        global.arpa.sequence.auto = false;
                        $('#arpaSequence button.auto').removeClass('has-text-success');
                    }
                    else {
                        global.arpa.sequence.auto = true;
                        $('#arpaSequence button.auto').addClass('has-text-success');
                    }
                },
                autoLabel(sr){
                    return loc(global.race['artifical'] ? 'arpa_auto_compile_label' : 'arpa_auto_seq_label') + (sr ? (global.arpa.sequence.boost ? loc('city_on') : loc('city_off')) : '');
                }
            },
            filters: {
                timer(val){
                    if (global.arpa.sequence.on && global.arpa.sequence.labs > 0){
                        if (global.arpa.sequence.boost){
                            return timeFormat(val / (global.arpa.sequence.labs * 2));
                        }
                        else {
                            return timeFormat(val / global.arpa.sequence.labs);
                        }
                    }
                    else {
                        let egg = easterEgg(14,12);
                        if (egg.length > 0){
                            return egg;
                        }
                        return loc('time_never');
                    }
                }
            }
        });

        popover(`popArpaSeq`, function(){
            if (global.tech.genetics > 2){
                return global.race['artifical'] ? loc('arpa_modify_desc') : loc('arpa_mutate_desc');
            }
            else {
                return global.race['artifical'] ? loc('arpa_decompile_desc') : loc('arpa_sequence_desc');
            }
        },
        {
            elm: `#arpaSequence .seqlbl`,
            classes: `has-background-light has-text-dark`
        });
    }

    if (global.tech['genetics'] > 2){
        genetics_s1($ctx);
        genetics_s2($ctx);
    }
}

export function sequenceLabs(){
    let labs = global.race['cataclysm'] || global.race['orbit_decayed'] ? support_on['exotic_lab'] : (global.race['warlord'] ? p_on['twisted_lab'] : p_on['biolab']);
    if (global.tech['isolation']){ labs = support_on['infectious_disease_lab'] * 5; }
    if (global.race['lone_survivor']){ labs += 2; }
    if (labs > 0 && global.city.ptrait.includes('toxic')){
        labs += planetTraits.toxic.vars()[0];
    }
    if (labs > 0 && global.race['elemental'] && traits.elemental.vars()[0] === 'frost'){
        labs *= 1 + highPopAdjust(global.resource[global.race.species].amount * traits.elemental.vars()[4] / 100);
    }
    return Math.round(labs);
}

export function bindTrait(breakdown,trait){
    let m_trait = $(`<div class="trait t-${trait} traitRow"></div>`);
    let gene = $(`<h4 class="is-sr-only">${trait}</h4><span v-bind:class="['basic-button', 'gene', 'gbuy', genePurchasable('${trait}') ? '' : 'has-text-fade']" role="button" :aria-label="geneCost('${trait}')" @click="gene('${trait}')">${global.resource.Genes.name} (${global.race.minor[trait] || 0})</span>`);
    m_trait.append(gene);
    if (global.prestige.Phage.count > 0){
        let phage = $(`<span v-bind:class="['basic-button', 'gene', 'pbuy', phagePurchasable('${trait}') ? '' : 'has-text-fade']" role="button" :aria-label="phageCost('${trait}')" @click="phage('${trait}')">${loc('resource_Phage_name')} (${global.genes.minor[trait] || 0})</span>`);
        m_trait.append(phage);
    }

    let total = global.race[trait] > 1 ? `(${global.race[trait]}) ` : '';
    m_trait.append(`<span class="has-text-warning name">${total}${traitSkin('name',trait)}</span>`);

    breakdown.append(m_trait);
}
