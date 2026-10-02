import { global, webWorker, save } from './vars.js';
import { races, traits, genus_def } from './races.js';
import { unlockAchieve, unlockFeat, universeAffix } from './achieve.js';
import { apotheosis, ascend } from './resets.js';
import { clearElement, calcGenomeScore, vBind, popover, getTraitDesc, deepClone } from './functions.js';
import { loc } from './locale.js';
import { universe_types } from './space.js';
import { planetName } from './space_f2.js';
import { geneCost } from './space_f4.js';

// Bagian dari ascendLab (space_f3.js), dipisah mekanis: variabel yang dibagi antar bagian ada di $ctx.

export function ascendLab_s1($ctx){
        $ctx.isWiki = !!$ctx.wiki;
    if (!$ctx.isWiki && !global.race['noexport']){
        if (webWorker.w){
            webWorker.w.terminate();
        }
        if (!global['sim']){
            save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
        }

        let genusType = races[global.race.species].type === 'hybrid' ? global.race.maintype : races[global.race.species].type;
        unlockAchieve(`biome_${global.city.biome}`);
        unlockAchieve(`genus_${genusType}`);

        if ($ctx.hybrid){
            unlockAchieve(`godslayer`);
            if (['unicorn','seraph'].includes(global.race.species)){
                unlockAchieve(`traitor`);
            }
            if (global.stats.achieve['what_is_best'] && global.stats.achieve.what_is_best.e >= 5){
                global.race['noexport'] = `Hybrid`;
            }
            else {
                apotheosis();
                return {$rv: 0};
            }
        }
        else {
            if (global.race['witch_hunter'] && global.race.universe === 'magic'){
                unlockAchieve(`soul_sponge`);
            }
            else {
                unlockAchieve(`ascended`);
                if (global.interstellar.thermal_collector.count === 0){
                    unlockFeat(`energetic`);
                }
            }
            if (global.race.species === 'junker'){
                unlockFeat('the_misery');
            }
            if (!global.race['modified'] && global.race['junker'] && global.race.species === 'junker'){
                unlockFeat(`garbage_pie`);
            }
            if (global.race['emfield']){
                unlockAchieve(`technophobe`);
            }
            if (global.race['cataclysm']){
                unlockFeat(`finish_line`);
            }
            global.race['noexport'] = `Race`;
        }

        clearElement($(`#city`));
        global.settings.showCity = true;
        global.settings.showCivic = false;
        global.settings.showResearch = false;
        global.settings.showResources = false;
        global.settings.showGenetics = false;
        global.settings.showSpace = false;
        global.settings.showDeep = false;
        global.settings.showGalactic = false;
        global.settings.showPortal = false;
        global.settings.showEden = false;
        global.settings.spaceTabs = 0;
    }

    $ctx.unlockedTraits = {};
    let lab = $(`<div id="celestialLab" class="celestialLab"></div>`);

    $ctx.wikiVars = {
        ascended: {},
        technophobe: global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l ? global.stats.achieve.technophobe.l : 0
    };

    if ($ctx.isWiki){
        $ctx.wiki.append(lab);
    }
    else {
        $(`#city`).append(lab);
    }

    let labStatus = `<div><h3 class="has-text-danger">${loc('genelab_title')}</h3> - <span class="has-text-warning">${loc('genelab_genes')} {{ g.genes }}</span> - <span class="has-text-warning">${loc('trait_untapped_name')}: {{ g.genes | untapped }}</span></div>`;
    lab.append(labStatus);

    if ($ctx.isWiki){
        lab.append(`
            <div class="has-text-caution">${loc('achieve_ascended_name')}</div>
        `);
        let ascended_levels = $(`<div></div>`);
        lab.append(ascended_levels);
        Object.keys(universe_types).forEach(function (uni){
            $ctx.wikiVars.ascended[uni] = global.stats.achieve[`ascended`] && global.stats.achieve.ascended.hasOwnProperty(universeAffix(uni)) ? global.stats.achieve.ascended[universeAffix(uni)] : 0;
            ascended_levels.append(`
                <div class="calcInput"><span>${loc('universe_' + uni)}</span> <b-numberinput :input="val('${uni}')" min="0" max="5" v-model="w.ascended.${uni}" :controls="false"></b-numberinput></div>
            `);
        });
        lab.append(`
            <div class="has-text-caution">${loc('achieve_technophobe_name')}</div>
            <div>
                <div class="calcInput"><b-numberinput :input="val('technophobe')" min="0" max="5" v-model="w.technophobe" :controls="false"></b-numberinput></div>
            </div>
        `);
    }

    let name = $(`<div class="fields"><div class="name">${loc('genelab_name')} <b-input v-model="g.name" maxlength="20"></b-input></div><div class="entity">${loc('genelab_entity')} <b-input v-model="g.entity" maxlength="40"></b-input></div><div class="name">${loc('genelab_home')} <b-input v-model="g.home" maxlength="20"></b-input></div> <div>${loc('genelab_desc')} <b-input v-model="g.desc" maxlength="255"></b-input></div></div>`);
    lab.append(name);

    let planets = $(`<div class="fields">
        <div class="name">${loc('genelab_red')} <b-input v-model="g.red" maxlength="20"></b-input></div>
        <div class="name">${loc('genelab_hell')} <b-input v-model="g.hell" maxlength="20"></b-input></div>
        <div class="name">${loc('genelab_gas')} <b-input v-model="g.gas" maxlength="20"></b-input></div>
        <div class="name">${loc('genelab_gas_moon')} <b-input v-model="g.gas_moon" maxlength="20"></b-input></div>
        <div class="name">${loc('genelab_dwarf')} <b-input v-model="g.dwarf" maxlength="20"></b-input></div></div>`);
    lab.append(planets);

    let tpPlanets = $(`<div class="fields">
        <div class="name">${loc('genelab_titan')} <b-input v-model="g.titan" maxlength="20"></b-input></div>
        <div class="name">${loc('genelab_enceladus')} <b-input v-model="g.enceladus" maxlength="20"></b-input></div>
        <div class="name">${loc('genelab_triton')} <b-input v-model="g.triton" maxlength="20"></b-input></div>
        <div class="name">${loc('genelab_eris')} <b-input v-model="g.eris" maxlength="20"></b-input></div></div>`);
    lab.append(tpPlanets);

    let genes = $(`<div class="sequence"></div>`);
    lab.append(genes);

    let fanatic = `<div id="geneLabFanatic" class="genus"><div class="has-text-caution header">${loc(`tech_fanaticism`)}</div><button class="button" @click="fanatic()">{{ g.fanaticism | fanaticism }}</button></div>`;

    $ctx.dGenus = 'humanoid';
    if ($ctx.hybrid){
        $ctx.dGenus = 'hybrid';
        let genus = `<div class="genus_selection">`;
        genus += `<div id="geneLabGenusA" class="genus"><div class="has-text-caution header">${loc('genelab_genus_a')}</div><button class="button" @click="genus(0)" v-html="$options.filters.genus(g.hybrid,0)"></button></div>`;
        genus += `<div id="geneLabGenusB" class="genus"><div class="has-text-caution header">${loc('genelab_genus_b')}</div><button class="button" @click="genus(1)" v-html="$options.filters.genus(g.hybrid,1)"></button></div>`;
        genus += `${fanatic}`;
        genus += `<div class="resetLab"><button class="button" @click="reset()">${loc('genelab_reset')}</button></div>`;
        genus += `</div>`;
        genes.append($(genus));
    }
    else {
        let genus = `<div class="genus_selection">`;
        genus += `<div id="geneLabGenus" class="genus"><div class="has-text-caution header">${loc('genelab_genus')}</div><button class="button" @click="genus()">{{ g.genus | genus }}</button></div>`;
        genus += `${fanatic}`;
        genus += `<div class="resetLab"><button class="button" @click="reset()">${loc('genelab_reset')}</button></div>`;
        genus += `</div>`;
        genes.append($(genus));
    }

    $ctx.slot = $ctx.hybrid ? 'race1' : 'race0';
    $ctx.genome = global.hasOwnProperty('custom') && global.custom.hasOwnProperty($ctx.slot) ? {
        name: global.custom[$ctx.slot].name,
        desc: global.custom[$ctx.slot].desc,
        entity: global.custom[$ctx.slot].entity,
        home: global.custom[$ctx.slot].home,
        red: global.custom[$ctx.slot].red,
        hell: global.custom[$ctx.slot].hell,
        gas: global.custom[$ctx.slot].gas,
        gas_moon: global.custom[$ctx.slot].gas_moon,
        dwarf: global.custom[$ctx.slot].dwarf,
        titan: global.custom[$ctx.slot].titan || planetName().titan,
        enceladus: global.custom[$ctx.slot].enceladus || planetName().enceladus,
        triton: global.custom[$ctx.slot].triton || planetName().triton,
        eris: global.custom[$ctx.slot].eris || planetName().eris,
        genes: 0,
        genus: global.custom[$ctx.slot].genus,
        traitlist: global.custom[$ctx.slot].traits,
        ranks: global.custom[$ctx.slot]?.ranks || {},
        fanaticism: global.custom[$ctx.slot].hasOwnProperty('fanaticism') && global.custom[$ctx.slot].fanaticism ? global.custom[$ctx.slot].fanaticism : false,
    } : {
        name: 'Zombie',
        desc: `Zombies aren't so much a species as they are the shambling remains of a race who succumbed to a nightmarish virus. Yet somehow they continue to drone on.`,
        entity: 'rotting bipedal creatures',
        home: 'Grave',
        red: 'Brains',
        hell: 'Rigor Mortis',
        gas: 'Decompose',
        gas_moon: 'Bones',
        dwarf: 'Double Tap',
        titan: 'Necromancer',
        enceladus: 'Skeleton',
        triton: 'Rot',
        eris: 'Zombieland',
        genes: 10,
        genus: $ctx.dGenus,
        traitlist: [],
        ranks: {},
        fanaticism: false,
    };

    if ($ctx.hybrid){
        if (global.hasOwnProperty('custom') && global.custom.hasOwnProperty($ctx.slot)){
            $ctx.genome['hybrid'] = global.custom[$ctx.slot].hybrid;
        }
        else {
            $ctx.genome['hybrid'] = ['humanoid','small'];
        }
    }

    let taxomized = { utility: {}, resource: {}, production: {}, combat: {}, all: {} };;
    Object.keys(races).forEach(function (race){
        let type = races[race].type;
        if (
            $ctx.isWiki
                ||
            (global.stats.achieve[`extinct_${race}`] && global.stats.achieve[`extinct_${race}`].l > 0)
                ||
            (global.stats.achieve[`genus_${type}`] && global.stats.achieve[`genus_${type}`].l > 0)
            ){
            if (races[race].hasOwnProperty('traits') && !['custom','hybrid','junker','sludge','ultra_sludge'].includes(race)){
                Object.keys(races[race].traits).forEach(function (trait){
                    if (traits[trait]?.taxonomy){
                        taxomized[traits[trait].taxonomy][trait] = true;
                        $ctx.unlockedTraits[trait] = true;
                    }
                });
            }
        }
    });
    
    for (let i=$ctx.genome.traitlist.length - 1; i >= 0; i--){
        if (!traits.hasOwnProperty($ctx.genome.traitlist[i]) || !$ctx.unlockedTraits.hasOwnProperty($ctx.genome.traitlist[i]) || traits[$ctx.genome.traitlist[i]].type !== 'major'){
            $ctx.genome.traitlist.splice(i,1);
        }
    }

    let trait_listing = $(`<b-tabs v-model="tt.t" @input="swapTab"></b-tabs>`);
    let all_listing = ``;
    Object.keys(taxomized).sort().forEach(function (tax){
        if (tax === 'all'){
            return;
        }
        let negative = '';
        let trait_list_header = `<b-tab-item><template slot="header"><h2 class="is-sr-only">${loc(`genelab_traits_${tax}`)}}</h2><span aria-hidden="true">${loc(`genelab_traits_${tax}`)}</span></template>`;
        let trait_list = ``;
        Object.keys(taxomized[tax]).sort().forEach(function (trait){
            if (traits.hasOwnProperty(trait) && traits[trait].type === 'major'){
                if (traits[trait].val >= 0){
                    trait_list += `<div class="field t${trait}"><b-checkbox :disabled="allowed('${trait}')" @input="geneEdit()" v-model="g.traitlist" native-value="${trait}"><span class="has-text-success">${loc(`trait_${trait}_name`)}</span> (<span class="has-text-advanced">{{ '${trait}' | cost }}</span><span v-html="$options.filters.empower(g.traitlist,'${trait}')"></span>)</b-checkbox></div>`;
                }
                else {
                    negative += `<div class="field t${trait}"><b-checkbox :disabled="allowed('${trait}')" @input="geneEdit()" v-model="g.traitlist" native-value="${trait}"><span class="has-text-danger">${loc(`trait_${trait}_name`)}</span> (<span class="has-text-caution">{{ '${trait}' | cost }}</span><span v-html="$options.filters.empower(g.traitlist,'${trait}')"></span>)</b-checkbox></div>`;
                }
            }
        });
        let full_list = trait_list_header + `<div class="cool trait_selection">` + trait_list + negative + `</div></b-tab-item>`;
        trait_listing.append($(full_list));

        all_listing += `<h3>${loc(`genelab_traits_${tax}`)}</h3>` + `<div class="lame trait_selection">` + trait_list + negative + `</div>`;
    });

    let summary = `<b-tab-item id="traitSummary"><template slot="header"><h2 class="is-sr-only">${loc(`genelab_traits_summary`)}}</h2><span aria-hidden="true">${loc(`genelab_traits_summary`)}</span></template></b-tab-item>`;
    trait_listing.append(summary);

    let allListing = `<b-tab-item id="traitAll"><template slot="header"><h2 class="is-sr-only">${loc(`genelab_traits_all`)}}</h2><span aria-hidden="true">${loc(`genelab_traits_all`)}</span></template>${all_listing}<h3>${loc(`genelab_traits_summary`)}</h3><div id="allSum"></div></b-tab-item>`;
    trait_listing.append(allListing);

    genes.append(trait_listing);

    let buttons = `
        <hr>
        ${labStatus}
        <div class="importExport">
            <button class="button" @click="customImport">${loc('genelab_import')}</button>
            <input type="file" class="fileImport" id="customFile" accept=".txt">
            <button class="button right" @click="customExport">${loc('genelab_export')}</button>
        </div>
        <div class="importExport">
            <span>{{ err.msg }}</span>
        </div>
    `;
    if (!$ctx.isWiki){
        buttons += `
            <div class="create">
                <button class="button" @click="setRace()">${loc('genelab_create')}</button>
            </div>
        `;
    }
    lab.append(buttons);

    $ctx.genome.genes = calcGenomeScore($ctx.genome,($ctx.isWiki ? $ctx.wikiVars : false));
    $ctx.error = { msg: "" };

    $ctx.modal = {
        template: '<div id="modalBox" class="modalBox"></div>'
    };

    $ctx.tRanks = $ctx.genome.ranks;
    $ctx.activeTab = { t: 0 };
}

export function ascendLab_s2($ctx){
        vBind({
        el: '#celestialLab',
        data: {
            g: $ctx.genome,
            w: $ctx.wikiVars,
            err: $ctx.error,
            tt: $ctx.activeTab
        },
        methods: {
            val(type){
                if (type === 'technophobe'){
                    if ($ctx.wikiVars['technophobe'] < 0){
                        $ctx.wikiVars['technophobe'] = 0;
                    }
                    else if ($ctx.wikiVars['technophobe'] > 5){
                        $ctx.wikiVars['technophobe'] = 5;
                    }
                }
                else {
                    if ($ctx.wikiVars.ascended[type] < 0){
                        $ctx.wikiVars.ascended[type] = 0;
                    }
                    else if ($ctx.wikiVars.ascended[type] > 5){
                        $ctx.wikiVars.ascended[type] = 5;
                    }
                }
            },
            geneEdit(){
                let newRanks = $ctx.genome.traitlist.map(x => $ctx.tRanks[x] ? { [x]: $ctx.tRanks[x] } : { [x]: 1 });
                let ranks = {};
                newRanks.forEach(function(k){ Object.keys(k).forEach(function(t){ ranks[t] = k[t] }) });
                $ctx.tRanks = ranks;
                $ctx.genome.genes = calcGenomeScore($ctx.genome,($ctx.isWiki ? $ctx.wikiVars : false),$ctx.tRanks);
                if ($ctx.activeTab.t === 5){
                    $ctx.summaryTab(5);
                }
            },
            setRace(){
                if ($ctx.genome.fanaticism && !$ctx.genome.traitlist.includes($ctx.genome.fanaticism)){ return false; }
                if (calcGenomeScore($ctx.genome,false,$ctx.tRanks) >= 0 && $ctx.genome.name.length > 0 && $ctx.genome.desc.length > 0 && $ctx.genome.entity.length > 0 && $ctx.genome.home.length > 0
                    && $ctx.genome.red.length > 0 && $ctx.genome.hell.length > 0 && $ctx.genome.gas.length > 0 && $ctx.genome.gas_moon.length > 0 && $ctx.genome.dwarf.length > 0){

                    global.custom[$ctx.slot] = {
                        name: $ctx.genome.name,
                        desc: $ctx.genome.desc,
                        entity: $ctx.genome.entity,
                        home: $ctx.genome.home,
                        red: $ctx.genome.red,
                        hell: $ctx.genome.hell,
                        gas: $ctx.genome.gas,
                        gas_moon: $ctx.genome.gas_moon,
                        dwarf: $ctx.genome.dwarf,
                        titan: $ctx.genome.titan,
                        enceladus: $ctx.genome.enceladus,
                        triton: $ctx.genome.triton,
                        eris: $ctx.genome.eris,
                        genus: $ctx.genome.genus,
                        traits: $ctx.genome.traitlist,
                        fanaticism: $ctx.genome.fanaticism,
                        ranks: $ctx.tRanks
                    };
                    if ($ctx.hybrid){
                        global.custom[$ctx.slot]['hybrid'] = $ctx.genome.hybrid;
                        apotheosis();
                    }
                    else {
                        ascend();
                    }
                }
            },
            allowed(t){
                if (($ctx.genome.traitlist.includes('catnip') && t === 'anise') || ($ctx.genome.traitlist.includes('anise') && t === 'catnip')){
                    return true;
                }
                else if ((!['synthetic','hybrid'].includes($ctx.genome.genus) || ($ctx.genome.hasOwnProperty('hybrid') && !$ctx.genome.hybrid.includes('synthetic'))) && ['deconstructor','imitation'].includes(t)){
                    if ($ctx.genome.traitlist.includes(t)){
                        $ctx.genome.traitlist.splice($ctx.genome.traitlist.indexOf(t), 1);
                    }
                    return true;
                }
                return false;
            },
            reset(){
                $ctx.genome.name = "";
                $ctx.genome.desc = "";
                $ctx.genome.entity = "";
                $ctx.genome.home = "";
                $ctx.genome.red = "";
                $ctx.genome.hell = "";
                $ctx.genome.gas = "";
                $ctx.genome.gas_moon = "";
                $ctx.genome.dwarf = "";
                $ctx.genome.titan = "";
                $ctx.genome.enceladus = "";
                $ctx.genome.triton = "";
                $ctx.genome.eris = "";
                $ctx.genome.genus = $ctx.dGenus;
                $ctx.genome.traitlist = [];
                $ctx.genome.ranks = {};
                $ctx.genome.genes = calcGenomeScore($ctx.genome,($ctx.isWiki ? $ctx.wikiVars : false), $ctx.tRanks);
                $ctx.genome.fanaticism = false;
            },
            fanatic(){
                this.$buefy.modal.open({
                    parent: this,
                    component: $ctx.modal
                });
            
                var checkExist = setInterval(function() {
                    if ($('#modalBox').length > 0) {
                        clearInterval(checkExist);
                        
                        $('#modalBox').append($(`<p id="modalBoxTitle" class="has-text-warning modalTitle">${loc(`genelab_fanatic_set`)}</p>`));
                        var body = $('<div id="specialModal" class="modalBody"></div>');
                        $('#modalBox').append(body);

                        let traits = `<div class="fanatic"><template><section>`;
                        $ctx.genome.traitlist.forEach(function (trait){
                            if (trait !== 'imitation'){
                                traits += `<div class="field ${trait}"><b-radio v-model="fanaticism" native-value="${trait}">${loc(`trait_${trait}_name`)}</b-radio></div>`;
                            }
                        });
                        traits += `</section></template></div>`;
                        body.append($(traits));

                        vBind({
                            el: '#specialModal',
                            data: $ctx.genome
                        });
                    }
                }, 50);
            },
            genus(slot){
                this.$buefy.modal.open({
                    parent: this,
                    component: $ctx.modal
                });
            
                var checkExist = setInterval(function() {
                    if ($('#modalBox').length > 0) {
                        clearInterval(checkExist);
                        
                        $('#modalBox').append($(`<p id="modalBoxTitle" class="has-text-warning modalTitle">${loc(`genelab_genus`)}</p>`));
                        var body = $('<div id="specialModal" class="modalBody"></div>');
                        $('#modalBox').append(body);

                        let genus = `<div class="genus_selection"><template><section>`;
                        Object.keys(genus_def).forEach(function (type){
                            if (type !== 'hybrid'){
                                if ($ctx.isWiki || (global.stats.achieve[`genus_${type}`] && global.stats.achieve[`genus_${type}`].l > 0)){
                                    if ($ctx.genome.genus === 'hybrid' && ((slot === 0 && type !== $ctx.genome.hybrid[1]) || (slot === 1 && type !== $ctx.genome.hybrid[0]))){
                                        genus += `<div class="field ${type}"><b-radio v-model="hybrid[${slot}]" native-value="${type}">${loc(`genelab_genus_${type}`)}</b-radio></div>`;
                                    }
                                    else if ($ctx.genome.genus !== 'hybrid'){
                                        genus += `<div class="field ${type}"><b-radio v-model="genus" native-value="${type}">${loc(`genelab_genus_${type}`)}</b-radio></div>`;
                                    }
                                }
                            }
                        });
                        genus += `</section></template></div>`;
                        body.append($(genus));

                        vBind({
                            el: '#specialModal',
                            data: $ctx.genome
                        });

                        Object.keys(genus_def).forEach(function (type){
                            if ($ctx.isWiki || (global.stats.achieve[`genus_${type}`] && global.stats.achieve[`genus_${type}`].l > 0)){
                                if (($ctx.genome.genus !== 'hybrid') || ($ctx.genome.genus === 'hybrid' && slot === 0 && type !== $ctx.genome.hybrid[1]) || ($ctx.genome.genus === 'hybrid' && slot === 1 && type !== $ctx.genome.hybrid[0])){
                                    popover(`geneLabGenus${type}`, function(){
                                        let desc = $(`<div><div>${loc(`genelab_genus_${type}_desc`)}</div></div>`);
                                        Object.keys(genus_def[type].traits).forEach(function (t){
                                            if (traits[t]){
                                                let des = $(`<div></div>`);
                                                let opts = {
                                                    trank: genus_trank,
                                                    wiki: $ctx.isWiki
                                                }
                                                getTraitDesc(des, t, opts);
                                                desc.append(des);
                                            }
                                        });
                                        return desc;
                                    },{
                                        elm: `#specialModal .${type}`,
                                        classes: `w30`,
                                        wide: true
                                    });
                                }
                            }
                        });
                    }
                }, 50);
            },
            swapTab(tab){
                $ctx.summaryTab(tab);
            },
            customImport(){
                let file = document.getElementById("customFile").files[0];
                if (file){
                    let reader = new FileReader();
                    reader.readAsText(file, "UTF-8");
                    reader.onload = function (evt) {
                        let importCustom = "";
                        try {
                            importCustom = JSON.parse(evt.target.result);
                        }
                        catch {
                            $ctx.error.msg = loc(`string_pack_error`,[file.name]);
                            return;
                        }
                        let formatError = false;
                        Object.keys($ctx.genome).forEach(function (type){
                            if (type === 'fanaticism' && $ctx.genome[type] === false){
                                return;
                            }
                            if (importCustom[type] && typeof $ctx.genome[type] !== typeof importCustom[type]){
                                formatError = true;
                                return;
                            }
                        });
                        if (formatError){
                            $ctx.error.msg = loc(`string_pack_error`,[file.name]);
                            console.log('format fail');
                            return;
                        }

                        Object.keys($ctx.genome).forEach(function (type){
                            if (importCustom[type]){
                                $ctx.genome[type] = importCustom[type];
                            }
                        });
                        ['name','home','red','hell','gas','gas_moon','dwarf','titan','enceladus','triton','eris'].forEach(function(field){
                            if (!importCustom[field] && ['titan','enceladus','triton','eris'].includes(field)){
                                $ctx.genome[field] = loc(`genus_${$ctx.genome.genus}_solar_${field}`)
                            }
                            else if ($ctx.genome[field].length > 20){
                                $ctx.genome[field] = $ctx.genome[field].substring(0, 20);
                            }
                        });
                        if ($ctx.genome.entity.length > 40){
                            $ctx.genome.entity = $ctx.genome.entity.substring(0, 40);
                        }
                        if ($ctx.genome.desc.length > 255){
                            $ctx.genome.desc = $ctx.genome.desc.substring(0, 255);
                        }
                        if (!$ctx.isWiki && !(global.stats.achieve[`genus_${$ctx.genome.genus}`] && global.stats.achieve[`genus_${$ctx.genome.genus}`].l > 0)){
                            $ctx.genome.genus = $ctx.dGenus;
                        }
                        if (importCustom.genus !== 'hybrid' && $ctx.hybrid){
                            $ctx.genome['hybrid'] = [importCustom.genus, importCustom.genus === 'humanoid' ? 'small' : 'humanoid'];
                            $ctx.genome.genus = 'hybrid';
                        }
                        else if (importCustom.genus === 'hybrid' && !$ctx.hybrid){
                            $ctx.genome.genus = importCustom.hybrid[0];
                            delete $ctx.genome.hybrid;
                        }
                        let fixTraitlist = [];
                        for (let i=0; i < $ctx.genome.traitlist.length; i++){
                            if (traits.hasOwnProperty($ctx.genome.traitlist[i]) && traits[$ctx.genome.traitlist[i]].type === 'major' && $ctx.unlockedTraits[$ctx.genome.traitlist[i]] && !fixTraitlist.includes($ctx.genome.traitlist[i])){
                                fixTraitlist.push($ctx.genome.traitlist[i]);
                            }
                        }
                        $ctx.tRanks = importCustom.hasOwnProperty('ranks') ? importCustom.ranks : {};
                        $ctx.genome.ranks = {};
                        $ctx.genome.fanaticism = importCustom.hasOwnProperty('fanaticism') ? importCustom.fanaticism : false,
                        $ctx.genome.traitlist = fixTraitlist;
                        $ctx.genome.genes = calcGenomeScore($ctx.genome,($ctx.isWiki ? $ctx.wikiVars : false),$ctx.tRanks);

                        $ctx.error.msg = "";
                    }
                    reader.onerror = function (evt) {
                        console.error("error reading file");
                    }
                }
            },
            customExport(){
                let exportGenome = deepClone($ctx.genome);
                exportGenome['ranks'] = $ctx.tRanks;
                const downloadToFile = (content, filename, contentType) => {
                    const a = document.createElement('a');
                    const file = new Blob([content], {type: contentType});
                    a.href= URL.createObjectURL(file);
                    a.download = filename;
                    a.click();
                    URL.revokeObjectURL(a.href);
                };
                downloadToFile(JSON.stringify(exportGenome, null, 4), `evolve-${$ctx.hybrid ? 'hybrid' : 'custom'}-${exportGenome.name}.txt`, 'text/plain');
            }
        },
        filters: {
            cost(trait){
                return geneCost($ctx.genome,trait,$ctx.tRanks);
            },
            untapped(genes){
                if (!$ctx.genome.traitlist.includes($ctx.genome.fanaticism)){ $ctx.genome.fanaticism = false; }
                let num = genes > 0 ? +((genes / (genes + 20) / 10 + 0.00024) * 100).toFixed(3) : 0;
                return `+${num}%`;
            },
            fanaticism(trait){
                return trait ? loc(`trait_${trait}_name`) : loc(`genelab_unset`);
            },
            genus(g,i){
                return typeof i === 'undefined' ? loc(`genelab_genus_${g}`) : loc(`genelab_genus_${g[i]}`);
            },
            empower(e,t){
                let valid_empower = traits[t].val >= traits.empowered.vars($ctx.tRanks['empowered'] || 1)[0] && traits[t].val <= traits.empowered.vars($ctx.tRanks['empowered'] || 1)[1] && !['empowered','catnip','anise'].includes(t) && $ctx.genome.traitlist.includes('empowered');
                return valid_empower ? `, <span class="has-text-caution">E</span>` : ``;
            }
        }
    });

    let genus_trank = (global.stats.achieve['pathfinder'] && global.stats.achieve.pathfinder.l >= 4) ? 2 : 1;
    if ($ctx.hybrid){
        ['A','B'].forEach(function(g){
            popover(`geneLabGenus${g}`, function(){
                let type = $ctx.genome.hybrid[g === 'A' ? 0 : 1];
                let desc = $(`<div><div>${loc(`genelab_genus_${type}_desc`)}</div></div>`);
                Object.keys(genus_def[type].traits).forEach(function (t){
                    if (traits[t]){
                        let des = $(`<div></div>`);
                        let opts = {
                            trank: genus_trank,
                            wiki: $ctx.isWiki
                        }
                        getTraitDesc(des, t, opts);
                        desc.append(des);
                    }
                });
                return desc;
            },{
                elm: `#geneLabGenus${g}`,
                classes: `w30`,
                wide: true
            });
        });
    }
    else {
        popover(`geneLabGenus`, function(){
            let type = $ctx.genome.genus;
            let desc = $(`<div><div>${loc(`genelab_genus_${type}_desc`)}</div></div>`);
            Object.keys(genus_def[type].traits).forEach(function (t){
                if (traits[t]){
                    let des = $(`<div></div>`);
                    let opts = {
                        trank: genus_trank,
                        wiki: $ctx.isWiki
                    }
                    getTraitDesc(des, t, opts);
                    desc.append(des);
                }
            });
            return desc;
        },{
            elm: `#geneLabGenus`,
            classes: `w30`,
            wide: true
        });
    }

    Object.keys($ctx.unlockedTraits).sort().forEach(function (trait){
        if (traits.hasOwnProperty(trait) && traits[trait].type === 'major'){
            ['cool','lame'].forEach(function(s){
                popover(`celestialLabtraitSelection${trait}`, function(){
                    let desc = $(`<div></div>`);
                    let opts = {
                        trank: $ctx.tRanks[trait] || 1,
                        wiki: $ctx.isWiki
                    }
                    getTraitDesc(desc, trait, opts);
                    return desc;
                },{
                    elm: `#celestialLab .${s}.trait_selection .t${trait}`,
                    classes: `w30`,
                    wide: true
                });
            });
        }
    });
}
