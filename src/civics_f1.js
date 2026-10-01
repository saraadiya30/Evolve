import { global, sizeApproximation } from './vars.js';
import { loc } from './locale.js';
import { vBind, genCivName, popover, easterEgg, trickOrTreat, clearPopper } from './functions.js';
import { defineGovernor, govActive } from './governor.js';
import { traits, fathomCheck, races } from './races.js';
import { drawTech } from './actions.js';
import { astrologySign, astroVal } from './seasons.js';
import { government_desc } from './civics.js';
import { taxRates, buildGarrison, drawEspModal } from './civics_f2.js';
import { defineMad } from './civics_f4.js';
import { war_campaign, battleAssessment } from './civics_f3.js';

// Fungsi-fungsi dipindah dari civics.js (urutan sumber dipertahankan). civics.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


// Sets up government in civics tab
export function defineGovernment(define){
    if (!global.civic['taxes']){
        global.civic['taxes'] = {
            tax_rate: 20,
            display: false
        };
    }

    if (define){
        return;
    }

    if (!global.settings.tabLoad && (global.settings.civTabs !== 2 || global.settings.govTabs !== 0)){
        return;
    }

    var govern = $('<div id="government" class="government is-child"></div>');

    var tabs = $(`<b-tabs class="resTabs govTabs2" v-show="vis()" v-model="s.govTabs2" :animated="s.animated">
        <b-tab-item id="r_govern0">
            <template slot="header">
                <h2 class="is-sr-only">${loc('civics_government')}}</h2>
                <span aria-hidden="true">${loc('civics_government')}</span>
            </template>
        </b-tab-item>
        <b-tab-item id="r_govern1" :visible="s.showGovernor">
            <template slot="header">
                <h2 class="is-sr-only">${loc('governor')}}</h2>
                <span aria-hidden="true">${loc('governor')}</span>
            </template>
        </b-tab-item>
    </b-tabs>`);

    govern.append(tabs);
    $('#r_civics').append(govern);

    vBind({
        el: '#government .govTabs2',
        data: {
            t: global.civic['taxes'],
            s: global.settings
        },
        methods: {
            vis(){
                return global.tech['govern'] ? true : false;
            }
        }
    });
    
    government($(`#r_govern0`));
    taxRates($(`#r_govern0`));

    var civ_garrison = $('<div id="c_garrison" v-show="g.display" class="garrison tile is-child"></div>');
    $('#r_govern0').append(civ_garrison);

    defineGovernor();
}

// Sets up garrison in civics tab
export function defineGarrison(){
    commisionGarrison();

    if (!global.settings.tabLoad && (global.settings.civTabs !== 2 || global.settings.govTabs !== 3)){
        return;
    }

    var garrison = $('<div id="garrison" v-show="vis()" class="garrison tile is-child"></div>');
    $('#military').append(garrison);
    $('#military').append($(`<div id="fortress"></div>`));
    
    buildGarrison(garrison,true);
    defineMad();
}

export function commisionGarrison(){
    if (!global.civic['garrison']){
        global.civic['garrison'] = {
            display: false,
            disabled: false,
            rate: 0,
            progress: 0,
            tactic: 0,
            workers: 0,
            wounded: 0,
            raid: 0,
            max: 0
        };
    }

    if (!global.civic.garrison['mercs']){
        global.civic.garrison['mercs'] = false;
    }
    if (!global.civic.garrison['fatigue']){
        global.civic.garrison['fatigue'] = 0;
    }
    if (!global.civic.garrison['protest']){
        global.civic.garrison['protest'] = 0;
    }
    if (!global.civic.garrison['m_use']){
        global.civic.garrison['m_use'] = 0;
    }
    if (!global.civic.garrison['crew']){
        global.civic.garrison['crew'] = 0;
    }

    if (!global.civic['mad']){
        global.civic['mad'] = {
            display: false,
            armed: true
        };
    }
}

export function govRelationFactor(id){
    if (global.race['truepath']){
        if (global.civic.foreign[`gov${id}`].hstl < 10){
            return 1 + (10 - global.civic.foreign[`gov${id}`].hstl) / 40;
        }
        else if (global.civic.foreign[`gov${id}`].hstl > 60){
            return 1 - (-60 + global.civic.foreign[`gov${id}`].hstl) / 160;
        }
    }
    return 1;
}

export function govTitle(id){
    if (typeof global.civic.foreign[`gov${id}`]['name'] == "undefined"){
        let nameFrags = genCivName();
        global.civic.foreign[`gov${id}`]['name'] = {
            s0: nameFrags.s0,
            s1: nameFrags.s1
        };
    }

    return loc(`civics_gov${global.civic.foreign[`gov${id}`].name.s0}`,[global.civic.foreign[`gov${id}`].name.s1]);
}

export function government(govern){
    var gov = $('<div id="govType" class="govType" v-show="vis()"></div>');
    govern.append(gov);
    
    var type = $(`<div>${loc('civics_government_type')} <span id="govLabel" class="has-text-warning">{{ type | govern }}</span></div>`);
    gov.append(type);
    
    var setgov = $(`<div></div>`);
    gov.append(setgov);

    var change = $(`<span class="change inline"><button class="button" @click="trigModal" :disabled="rev > 0">{{ type | set }}</button></span>`);
    setgov.append(change);

    var modal = {
        template: '<div id="modalBox" class="modalBox"></div>'
    };

    vBind({
        el: '#govType',
        data: global.civic['govern'],
        filters: {
            govern(type){
                if (global.race.universe === 'evil' && type === 'democracy'){ return loc(`govern_managed_democracy`); } 
                return loc(`govern_${type}`);
            },
            set(g){
                return g === 'anarchy' ? loc('civics_set_gov') : loc('civics_revolution');
            }
        },
        methods: {
            trigModal(){
                this.$buefy.modal.open({
                    parent: this,
                    component: modal
                });

                var checkExist = setInterval(function() {
                   if ($('#modalBox').length > 0) {
                      clearInterval(checkExist);
                      drawGovModal();
                   }
                }, 50);
            },
            startrev(){
                global.civic.govern.fr = global.civic.govern.rev;
                global.civic.govern.rev = 0;
            },
            force(){                
                return global.civic.govern.rev > 0 ? loc('civics_force_rev_desc') : loc('civics_force_rev_desc2');
            },
            vis(){
                return global.tech['govern'] ? true : false;
            }
        }
    });

    popover('govLabel', function(){
            let effect_type = global.tech['unify'] && global.tech['unify'] >= 2 && global.civic.govern.type === 'federation' ? 'federation_alt' : global.civic.govern.type;
            if (effect_type === 'theocracy' && global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
                effect_type = 'theocracy_alt';
            }
            return $(`<div>${govDescription(global.civic.govern.type)}</div><div class="has-text-advanced">${government_desc(effect_type)}</div>`);
        }
    );

    popover(`govTypeChange`, function(){
            return global.civic.govern.rev > 0 ? loc('civics_change_desc',[global.civic.govern.rev]) : loc('civics_change_desc2');
        },
        {
            elm: `#govType .change`
        }
    );
}

export function govDescription(type){
    if (global.race['witch_hunter'] && type === 'magocracy'){
        return loc(`witch_hunter_magocracy`);
    }
    else if (global.race.universe === 'evil'){
        switch (type){
            case 'democracy':
                return loc(`govern_managed_democracy_desc`);
        }
    }
    return loc(`govern_${type}_desc`);
}

export function drawGovModal(){
    $('#modalBox').append($(`<p id="modalBoxTitle" class="has-text-warning modalTitle">${loc('civics_government_type')}</p>`));
    let egg = easterEgg(6,10);
    if (egg.length > 0){
        $('#modalBoxTitle').append(egg);
    }
    let trick = trickOrTreat(6,14,false);
    if (trick.length > 0){
        $('#modalBoxTitle').append(trick);
    }
    
    var body = $('<div id="govModal" class="modalBody max40"></div>');
    $('#modalBox').append(body);

    if (global.tech['govern']){
        if (global.civic.govern.type !== 'autocracy'){
            body.append($(`<button class="button gap" data-gov="autocracy" @click="setGov('autocracy')">${loc(`govern_autocracy`)}</button>`));
        }
        if (global.civic.govern.type !== 'democracy' && !global.race['warlord']){
            body.append($(`<button class="button gap" data-gov="democracy" @click="setGov('democracy')">${global.race.universe === 'evil' ? loc(`govern_managed_democracy`) : loc(`govern_democracy`)}</button>`));
        }
        if (global.civic.govern.type !== 'oligarchy' && !global.race['warlord']){
            body.append($(`<button class="button gap" data-gov="oligarchy" @click="setGov('oligarchy')">${loc(`govern_oligarchy`)}</button>`));
        }
        if (global.tech['gov_theo'] && global.civic.govern.type !== 'theocracy' && !global.race['warlord']){
            body.append($(`<button class="button gap" data-gov="theocracy" @click="setGov('theocracy')">${loc(`govern_theocracy`)}</button>`));
        }
        if (global.tech['govern'] >= 2 && global.civic.govern.type !== 'republic' && !global.race['warlord']){
            body.append($(`<button class="button gap" data-gov="republic" @click="setGov('republic')">${loc(`govern_republic`)}</button>`));
        }
        if (global.tech['gov_soc'] && global.civic.govern.type !== 'socialist' && !global.race['warlord']){
            body.append($(`<button class="button gap" data-gov="socialist" @click="setGov('socialist')">${loc(`govern_socialist`)}</button>`));
        }
        if (global.tech['gov_corp'] && global.civic.govern.type !== 'corpocracy' && !global.race['warlord']){
            body.append($(`<button class="button gap" data-gov="corpocracy" @click="setGov('corpocracy')">${loc(`govern_corpocracy`)}</button>`));
        }
        if (global.tech['govern'] >= 3 && global.civic.govern.type !== 'technocracy' && !global.race['warlord']){
            body.append($(`<button class="button gap" data-gov="technocracy" @click="setGov('technocracy')">${loc(`govern_technocracy`)}</button>`));
        }
        if (global.tech['gov_fed'] && global.civic.govern.type !== 'federation' && !global.race['warlord']){
            body.append($(`<button class="button gap" data-gov="federation" @click="setGov('federation')">${loc(`govern_federation`)}</button>`));
        }
        if (global.tech['gov_mage'] && global.civic.govern.type !== 'magocracy'){
            body.append($(`<button class="button gap" data-gov="magocracy" @click="setGov('magocracy')">${loc(`govern_magocracy`)}</button>`));
        }
        if (global.race['wish'] && global.race['wishStats'] && global.race.wishStats.gov && global.civic.govern.type !== 'dictator'){
            body.append($(`<button class="button gap" data-gov="dictator" @click="setGov('dictator')">${loc(`govern_dictator`)}</button>`));
        }
    }

    vBind({
        el: '#govModal',
        data: global.civic['govern'],
        methods: {
            setGov(g){
                if (global.civic.govern.rev === 0){
                    let drawTechs = global.genes['governor'] && global.civic.govern.type === 'anarchy';
                    global.civic.govern.type = g;
                    let time = 1000;
                    if (global.tech['high_tech']){
                        time += 250;
                        if (global.tech['high_tech'] >= 3){
                            time += 250;
                        }
                        if (global.tech['high_tech'] >= 6){
                            time += 250;
                        }
                    }
                    if (global.tech['space_explore'] && global.tech['space_explore'] >= 3){
                        time += 250;
                    }
                    if (global.race['unorganized']){
                        time = Math.round(time * (1 + traits.unorganized.vars()[0] / 100));
                    }
                    if (global.stats.achieve['anarchist']){
                        time = Math.round(time * (1 - (global.stats.achieve['anarchist'].l / 10)));
                    }
                    if (global.race['lawless']){
                        time = Math.round(time * ((100 - traits.lawless.vars()[0]) / 100));
                    }
                    let fathom = fathomCheck('tuskin');
                    if (fathom > 0){
                        time = Math.round(time * ((100 - traits.lawless.vars(1)[0] * fathom) / 100));
                    }
                    let aristoVal = govActive('aristocrat',0);
                    if (aristoVal){
                        time = Math.round(time * (1 - (aristoVal / 100)));
                    }
                    global.civic.govern.rev = time + global.civic.govern.fr;
                    if (drawTechs){
                        drawTech();
                    }
                    vBind({el: '#govModal'},'destroy');
                    $('.modal-background').click();
                    clearPopper();
                }
            }
        }
    });

    popover('GovPop', function(obj){
            let govType = $(obj.this).data('gov');
            let effectType = global.tech['unify'] && global.tech['unify'] >= 2 && govType === 'federation' ? 'federation_alt' : govType;
            if (effectType === 'theocracy' && global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
                effectType = 'theocracy_alt';
            }
            return $(`<div>${govDescription(govType)}</div><div class="has-text-advanced">${government_desc(effectType)}</div>`);
        },
        {
            elm: `#govModal button`,
            self: true,
            classes: `has-background-light has-text-dark`
        }
    );
}

export function foreignGov(){
    if ($('#foreign').length === 0 && !global.race['cataclysm'] && (!global.tech['world_control'] || global.race['truepath']) && !global.tech['isolation']){
        let foreign = $('<div id="foreign" v-show="vis()" class="government is-child"></div>');
        foreign.append($(`<div class="header"><h2 class="has-text-warning">${loc('civics_foreign')}</h2></div>`));
        $('#r_govern0').append(foreign);

        var modal = {
            template: '<div id="modalBox" class="modalBox"></div>'
        };

        let govEnd = global.race['truepath'] ? 5 : 3;
        for (let i=0;i<govEnd;i++){
            let gov = $(`<div id="gov${i}" class="foreign" v-show="gvis(${i})"><span class="has-text-caution">{{ '${i}' | gov }}</span><span v-if="f${i}.occ" class="has-text-advanced"> - ${loc('civics_garrison_occupy')}</span><span v-else-if="f${i}.anx" class="has-text-advanced"> - ${loc('civics_garrison_annex')}</span></span><span v-else-if="f${i}.buy" class="has-text-advanced"> - ${loc('civics_garrison_purchase')}</span></div>`);
            foreign.append(gov);

            let actions = $(`<div></div>`);
            actions.append($(`<button :label="battleAssessment(${i})" class="button gaction attack" @click="campaign(${i})"><span v-show="!f${i}.occ && !f${i}.anx && !f${i}.buy">${loc('civics_garrison_attack')}</span><span v-show="f${i}.occ || f${i}.anx || f${i}.buy">${loc('civics_garrison_unoccupy')}</span></button>`));
            actions.append($(`<span class="tspy inline"><button :label="spyDesc(${i})" v-show="t.spy >= 1 && !f${i}.occ && !f${i}.anx && !f${i}.buy" :disabled="spy_disabled(${i})" class="button gaction" @click="spy(${i})"><span v-show="f${i}.trn === 0">${loc('tech_spy')}: {{ f${i}.spy }}</span><span v-show="f${i}.trn > 0">${loc('civics_train')}: {{ f${i}.trn }}</span></button></span>`));
            actions.append($(`<span class="sspy inline"><button :label="espDesc()" v-show="t.spy >= 2 && !f${i}.occ && !f${i}.anx && !f${i}.buy && f${i}.spy >= 1" :disabled="f${i}.sab > 0" class="button gaction" @click="trigModal(${i})"><span v-show="f${i}.sab === 0">${loc('tech_espionage')}</span><span v-show="f${i}.sab > 0">{{ f${i}.act | sab }}: {{ f${i}.sab }}</span></button></span>`));
            gov.append(actions);

            gov.append($(`<div v-show="!f${i}.occ && !f${i}.anx && !f${i}.buy"><span class="has-text-advanced glabel">${loc('civics_gov_mil_rate')}:</span> <span class="glevel">{{ f${i}.mil | military(${i}) }}<span class="has-text-warning" v-show="f${i}.spy >= 2"> ({{ f${i}.mil }})</span></span></div>`));
            gov.append($(`<div v-show="!f${i}.occ && !f${i}.anx && !f${i}.buy"><span class="has-text-advanced glabel">${loc('civics_gov_relations')}:</span> <span class="glevel">{{ f${i}.hstl | relation }}<span class="has-text-warning" v-show="f${i}.spy >= 1"> ({{ f${i}.hstl | hate }})</span></span></div>`));
            gov.append($(`<div v-show="!f${i}.occ && !f${i}.anx && !f${i}.buy"><span class="has-text-advanced glabel">${loc('civics_gov_eco_rate')}:</span> <span class="glevel">{{ f${i}.eco | eco(${i}) }}<span class="has-text-warning" v-show="f${i}.spy >= 3"> ({{ f${i}.eco }})</span></span></div>`));
            gov.append($(`<div v-show="f${i}.spy >= 2 && !f${i}.occ && !f${i}.anx && !f${i}.buy"><span class="has-text-advanced glabel">${loc('civics_gov_unrest')}:</span> <span class="glevel">{{ f${i}.unrest | discontent(${i}) }}<span class="has-text-warning" v-show="f${i}.spy >= 4"> ({{ f${i}.unrest | turmoil }})</span></span></div>`));
        }

        let bindData = {
            f0: global.civic.foreign[`gov0`],
            f1: global.civic.foreign[`gov1`],
            f2: global.civic.foreign[`gov2`],
            t: global.tech
        };
        if (global.race['truepath']){
            bindData['f3'] = global.civic.foreign[`gov3`];
            bindData['f4'] = global.civic.foreign[`gov4`];
        }

        vBind({
            el: `#foreign`,
            data: bindData,
            filters: {
                military(m,i){
                    if (global.civic.foreign[`gov${i}`].spy >= 1){
                        if (m < 50){
                            return loc('civics_gov_v_weak');
                        }
                        else if (m < 75){
                            return loc('civics_gov_weak');
                        }
                        else if (m > 300){
                            return loc('civics_gov_superpower');
                        }
                        else if (m > 200){
                            return loc('civics_gov_v_strong');
                        }
                        else if (m > 160){
                            return loc('civics_gov_strong');
                        }
                        else if (m > 125){
                            return loc('civics_gov_above_average');
                        }
                        else {
                            return loc('civics_gov_average');
                        }
                    }
                    else {
                        return '???';
                    }
                },
                relation(r){
                    if (r > 80){
                        return loc('civics_gov_hated');
                    }
                    else if (r > 60){
                        return loc('civics_gov_hostile');
                    }
                    else if (r > 40){
                        return loc('civics_gov_poor');
                    }
                    else if (r > 25){
                        return loc('civics_gov_neutral');
                    }
                    else if (r > 10){
                        return loc('civics_gov_liked');
                    }
                    else {
                        return loc('civics_gov_good');
                    }
                },
                eco(e,i){
                    if (global.civic.foreign[`gov${i}`].spy >= 2){
                        if (e < 60){
                            return loc('civics_gov_weak');
                        }
                        else if (e < 80){
                            return loc('civics_gov_recession');
                        }
                        else if (e > 120){
                            return loc('civics_gov_strong');
                        }
                        else {
                            return loc('civics_gov_average');
                        }
                    }
                    else {
                        return '???';
                    }
                },
                discontent(r,i){
                    if (global.civic.foreign[`gov${i}`].spy >= 3){
                        if (r <= 0){
                            return loc('civics_gov_none');
                        }
                        else if (r < 30){
                            return loc('civics_gov_low');
                        }
                        else if (r < 60){
                            return loc('civics_gov_medium');
                        }
                        else if (r < 90){
                            return loc('civics_gov_high');
                        }
                        else {
                            return loc('civics_gov_extreme');
                        }
                    }
                    else {
                        return '???';
                    }
                },
                gov(id){
                    return govTitle(id);
                },
                sab(s){
                    return s === 'none' ? '' : loc(`civics_spy_${s}`);
                },
                hate(h){
                    return `${100 - h}%`;
                },
                turmoil(u){
                    return `${u}%`;
                },
            },
            methods: {
                campaign(gov){
                    war_campaign(gov);
                },
                battleAssessment(gov){
                    return battleAssessment(gov);
                },
                trigModal(i){
                    this.$buefy.modal.open({
                        parent: this,
                        component: modal
                    });

                    var checkExist = setInterval(function() {
                    if ($('#modalBox').length > 0) {
                        clearInterval(checkExist);
                        drawEspModal(i);
                    }
                    }, 50);
                },
                spy_disabled(i){
                    return global.civic.foreign[`gov${i}`].trn > 0 || spyCost(i) > global.resource.Money.amount ? true : false;
                },
                spy(i){
                    trainSpy(i);
                },
                spyDesc(i){
                    return spyDesc(i);
                },
                espDesc(){
                    return espDesc();
                },
                vis(){
                    return global.civic.garrison.display && (!global.tech['world_control'] || global.race['truepath']) && !global.race['cataclysm'] && !global.tech['isolation'] ? true : false;
                },
                gvis(g){
                    if (global.tech['isolation']){ return false; }
                    if (g <= 2){
                        return global.tech['world_control'] ? false : true;
                    }
                    else if (g === 3){
                        return global.tech['rival'] ? true : false;
                    }
                    return false;
                }
            }
        });

        for (let i=0; i<govEnd; i++){
            popover(`gov${i}a`,
                function(){ return '<span>{{ label() }}</span>'; },
                {
                    elm: `#gov${i} .attack`,
                    in: function(obj){
                        vBind({
                            el: `#${obj.id} > span`,
                            data: { test: 'val' },
                            methods: {
                                label(){
                                    return battleAssessment(i);
                                }
                            }
                        });
                    },
                    out: function(obj){
                        vBind({el: obj.id},'destroy');
                    },
                }
            );
            popover(`gov${i}ts`,
                function(){ return '<span>{{ label() }}</span>'; },
                {
                    elm: `#gov${i} .tspy`,
                    in: function(obj){
                        vBind({
                            el: `#${obj.id} > span`,
                            data: { test: 'val' },
                            methods: {
                                label(){
                                    return spyDesc(i);
                                }
                            }
                        });
                    },
                    out: function(obj){
                        vBind({el: obj.id},'destroy');
                    },
                }
            );
            popover(`gov${i}s`,
                function(){
                    return espDesc();
                },
                {
                    elm: `#gov${i} .sspy`
                }
            );
        }

        if (global.race['truepath']){
            popover(`garRivaldesc1`,
                function(){ return loc(`civics_gov_tp_rival`,[govTitle(3),races[global.race.species].home]); },
                {
                    elm: `#gov3 > span`,
                }
            );
        }
    }
}

export function spyDesc(i){
    if (global.civic.foreign[`gov${i}`].trn > 0){
        return loc('civics_progress');
    }
    let cost = sizeApproximation(spyCost(i));
    return loc('civics_gov_spy_desc',[cost]);
}

export function espDesc(){
    return loc('civics_gov_esp_desc');
}

export function spyCost(i){
    let base = Math.round((global.civic.foreign[`gov${i}`].mil / 2) + (global.civic.foreign[`gov${i}`].hstl / 2) - global.civic.foreign[`gov${i}`].unrest) + 10;
    if (base < 50){
        base = 50;
    }
    if (global.race['infiltrator']){
        base /= 3;
    }
    if (astrologySign() === 'scorpio'){
        base *= 1 - (astroVal('scorpio')[0] / 100);
    }
    return Math.round(base ** (global.civic.foreign[`gov${i}`].spy + 1)) + 500;
}

export function trainSpy(i){
    if (global.tech['spy'] && global.civic.foreign[`gov${i}`].trn === 0){
        let cost = spyCost(i)
        if (global.resource.Money.amount >= cost){
            global.resource.Money.amount -= cost;
            let time = 300;
            if (global.tech['spy'] >= 3 && global.city['boot_camp']){
                time -= (global.race['orbit_decayed'] && global.space['space_barracks'] ? global.space.space_barracks.on : global.city['boot_camp'].count) * 10;
                if (time < 10){
                    time = 10;
                }
            }
            if (global.race['infiltrator']){
                time = Math.round(time / 2);
            }
            global.civic.foreign[`gov${i}`].trn = time;
        }
    }
}

export function govPrice(gov){
    let price = global.civic.foreign[`gov${gov}`].eco * 15384;
    price *= 1 + global.civic.foreign[`gov${gov}`].hstl * 1.6 / 100;
    price *= 1 - global.civic.foreign[`gov${gov}`].unrest * 0.25 / 100;
    return +price.toFixed(0);
}

    
export function checkControlling(gov){
    if (gov){
        return global.tech['world_control'] || global.civic.foreign[gov].occ || global.civic.foreign[gov].anx || global.civic.foreign[gov].buy;
    }
    return global.civic.foreign.gov0.occ || global.civic.foreign.gov1.occ || global.civic.foreign.gov2.occ || global.civic.foreign.gov0.anx || global.civic.foreign.gov1.anx || global.civic.foreign.gov2.anx || global.civic.foreign.gov0.buy || global.civic.foreign.gov1.buy || global.civic.foreign.gov2.buy;
}
