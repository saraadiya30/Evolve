import { clearElement, vBind } from '../../functions/dom_helpers.js';
import { initMessageQueue } from '../../functions/message_log.js';
import { easterEgg, drawIcon, trickOrTreat } from '../../functions/icons_easter_eggs.js';
import { global, message_filters, message_logs } from '../../core/vars.js';
import { loc, locales } from '../../core/locale.js';
import { alevel } from '../../achievements/achievement_helpers.js';

// Bagian dari index (index.js), dipisah mekanis: variabel yang dibagi antar bagian ada di $ctx.

export function index_s1($ctx){
        clearElement($('body'));

    $('html').addClass(global.settings.font);

    // Top Bar
    $('body').append(`<div id="topBar" class="topBar">
        <h2 class="is-sr-only">Top Bar</h2>
        <span class="planetWrap">
            <span class="planet">{{ race.species | planet }}</span>
            <span class="universe" v-show="showUniverse()">{{ race.universe | universe }}</span>
            <span class="pet" id="playerPet" v-show="showPet()" @click="petPet()"></span>
            <span class="simulation" v-show="showSim()">${loc(`evo_challenge_simulation`)}</span>
        </span>
        <span class="calendar">
            <span class="infoTimer" id="infoTimer"></span>
            <span v-show="city.calendar.day">
                <span class="is-sr-only" v-html="sign()"></span><span id="astroSign" class="astro" v-html="getAstroSign()"></span>
                <b-tooltip :label="moon()" :aria-label="moon()" position="is-bottom" size="is-small" multilined animated><i id="moon" class="moon wi"></i></b-tooltip>
                <span class="year">${loc('year')} <span class="has-text-warning">{{ city.calendar.year }}</span></span>
                <span class="day">${loc('day')} <span class="has-text-warning">{{ city.calendar.day }}</span></span>
                <span class="season">{{ season() }}</span>
                <b-tooltip :label="weather()" :aria-label="weather()" position="is-bottom" size="is-small" multilined animated><i id="weather" class="weather wi"></i></b-tooltip>
                <b-tooltip :label="temp()" :aria-label="temp()" position="is-bottom" size="is-small" multilined animated><i id="temp" class="temp wi"></i></b-tooltip>
                <b-tooltip :label="atRemain()" v-show="s.at" :aria-label="atRemain()" position="is-bottom" size="is-small" multilined animated><span class="atime has-text-caution">{{ s.at | remain }}</span></b-tooltip>
                <span role="button" class="atime" style="padding: 0 0.5rem; margin-left: 0.5rem; cursor: pointer" @click="pause" :aria-label="pausedesc()">
                    <span id="pausegame"></span>
                </span>
            </span>
        </span>
        <span class="version" id="versionLog"><a href="wiki.html#changelog" target="_blank"></a></span>
    </div>`);

    let main = $(`<div id="main" class="main"></div>`);
    $ctx.columns = $(`<div class="columns is-gapless"></div>`);
    $('body').append(main);
    main.append($ctx.columns);

    // Left Column
    $ctx.columns.append(`<div class="column is-one-quarter leftColumn">
        <div id="race" class="race colHeader">
            <h2 class="is-sr-only">Race Info</h2>
            <div class="name">{{ name() }}</div>
            <div class="morale-contain"><span id="morale" v-show="city.morale.current" class="morale">${loc('morale')} <span class="has-text-warning">{{ city.morale.current | mRound }}%</span></div>
            <div class="power"><span id="powerStatus" class="has-text-warning" v-show="city.powered"><span>MW</span> <span id="powerMeter" class="meter">{{ city.power | replicate | approx }}</span></span></div>
        </div>
        <div id="sideQueue">
            <div id="buildQueue" class="bldQueue standardqueuestyle has-text-info" v-show="display"></div>
            <div id="msgQueue" class="msgQueue vscroll has-text-info" aria-live="polite">
                <div id="msgQueueHeader">
                    <h2 class="has-text-success">${loc('message_log')}</h2>
                    <span class="special" role="button" title="message queue options" @click="trigModal">
                        <svg version="1.1" x="0px" y="0px" width="12px" height="12px" viewBox="340 140 280 279.416" enable-background="new 340 140 280 279.416" xml:space="preserve">
                            <path class="gear" d="M620,305.666v-51.333l-31.5-5.25c-2.333-8.75-5.833-16.917-9.917-23.917L597.25,199.5l-36.167-36.75l-26.25,18.083
                            c-7.583-4.083-15.75-7.583-23.916-9.917L505.667,140h-51.334l-5.25,31.5c-8.75,2.333-16.333,5.833-23.916,9.916L399.5,163.333
                            L362.75,199.5l18.667,25.666c-4.083,7.584-7.583,15.75-9.917,24.5l-31.5,4.667v51.333l31.5,5.25
                            c2.333,8.75,5.833,16.334,9.917,23.917l-18.667,26.25l36.167,36.167l26.25-18.667c7.583,4.083,15.75,7.583,24.5,9.917l5.25,30.916
                            h51.333l5.25-31.5c8.167-2.333,16.333-5.833,23.917-9.916l26.25,18.666l36.166-36.166l-18.666-26.25
                            c4.083-7.584,7.583-15.167,9.916-23.917L620,305.666z M480,333.666c-29.75,0-53.667-23.916-53.667-53.666s24.5-53.667,53.667-53.667
                            S533.667,250.25,533.667,280S509.75,333.666,480,333.666z"/>
                        </svg>
                    </span>
                    <span role="button" class="zero has-text-advanced" @click="clearLog(m.view)">${loc('message_log_clear')}</span>
                    <span role="button" class="zero has-text-advanced" @click="clearLog()">${loc('message_log_clear_all')}</span>
                </div>
                <h2 class="is-sr-only">${loc('message_filters')}</h2>
                <div id="msgQueueFilters" class="hscroll msgQueueFilters"></div>
                <h2 class="is-sr-only">${loc('messages')}</h2>
                <div id="msgQueueLog" aria-live="polite"></div>
            </div>
        </div>
        <div id="resources" class="resources vscroll"><h2 class="is-sr-only">${loc('tab_resources')}</h2></div>
    </div>`);
    message_filters.forEach(function (filter){
        $(`#msgQueueFilters`).append(`
            <span id="msgQueueFilter-${filter}" class="${filter === 'all' ? 'is-active' : ''}" aria-disabled="${filter === 'all' ? 'true' : 'false'}" @click="swapFilter('${filter}')" v-show="s.${filter}.vis" role="button">${loc('message_log_' + filter)}</span>
        `);
    });
    vBind({
        el: `#msgQueue`,
        data: {
            m: message_logs,
            s: global.settings.msgFilters
        },
        methods: {
            swapFilter(filter){
                if (message_logs.view !== filter){
                    $(`#msgQueueFilter-${message_logs.view}`).removeClass('is-active').attr('aria-disabled', 'false');
                    $(`#msgQueueFilter-${filter}`).addClass('is-active').attr('aria-disabled', 'true');
                    message_logs.view = filter;
                    let queue = $(`#msgQueueLog`);
                    clearElement(queue);
                    message_logs[filter].forEach(function (msg){
                        queue.append($('<p class="has-text-'+msg.color+'"></p>').text(msg.msg));
                    });
                }
            },
            clearLog(filter){
                filter = filter ? [filter] : filter;
                initMessageQueue(filter);
                clearElement($(`#msgQueueLog`));
                if (filter){
                    global.lastMsg[filter] = [];
                }
                else {
                    Object.keys(global.lastMsg).forEach(function (tag){
                        global.lastMsg[tag] = [];
                    });
                }
            },
            trigModal(){
                let modal = {
                    template: '<div id="modalBox" class="modalBox"></div>'
                };
                this.$buefy.modal.open({
                    parent: this,
                    component: modal
                });

                let checkExist = setInterval(function(){
                    if ($('#modalBox').length > 0){
                        clearInterval(checkExist);
                        let egg16 = easterEgg(16,12);
                        $('#modalBox').append($(`<p id="modalBoxTitle" class="has-text-warning modalTitle">${loc('message_log')}${egg16.length > 0 ? egg16 : ''}</p>`));

                        let body = $('<div id="specialModal" class="modalBody vscroll"></div>');
                        $('#modalBox').append(body);
                        
                        let catVis = $(`
                            <div>
                                <div>
                                    <span class="has-text-warning">${loc('message_log_settings_visible')}</span>
                                </div>
                            </div>
                        `);
                        let catMax = $(`
                            <hr>
                            <div>
                                <div>
                                    <span class="has-text-warning">${loc('message_log_settings_length')}</span>
                                </div>
                            </div>
                        `);
                        let catSave = $(`
                            <hr>
                            <div>
                                <div>
                                    <span class="has-text-warning">${loc('message_log_settings_save')}</span>
                                </div>
                            </div>
                        `);
                        body.append(catVis);
                        body.append(catMax);
                        body.append(catSave);
                        
                        let visSet = ``;
                        let maxSet = ``;
                        let saveSet = ``;
                        
                        let maxInputs = {};
                        let saveInputs = {};
                        message_filters.forEach(function (filter){
                            visSet += `<div class="msgInput" v-show="s.${filter}.unlocked"><span>${loc('message_log_' + filter)}</span> <b-checkbox class="patrol" v-model="s.${filter}.vis" :disabled="checkDisabled('${filter}',s.${filter}.vis)" :input="check('${filter}')"></b-checkbox></div>`;
                            maxSet += `<div class="msgInput" v-show="s.${filter}.unlocked"><span>${loc('message_log_' + filter)}</span> <b-numberinput :input="maxVal('${filter}')" min="1" v-model="mi.${filter}" :controls="false"></b-numberinput></div>`;
                            saveSet += `<div class="msgInput" v-show="s.${filter}.unlocked"><span>${loc('message_log_' + filter)}</span> <b-numberinput :input="saveVal('${filter}')" min="0" :max="s.${filter}.max" v-model="si.${filter}" :controls="false"></b-numberinput></div>`;
                            
                            maxInputs[filter] = global.settings.msgFilters[filter].max;
                            saveInputs[filter] = global.settings.msgFilters[filter].save;
                        });
                        catVis.append(visSet);
                        catMax.append(maxSet);
                        catSave.append(saveSet);
                        catMax.append(`
                            <div class="msgInputApply">
                                <button class="button" @click="applyMax()">${loc('message_log_settings_apply')}</button>
                            </div>
                        `);
                        catSave.append(`
                            <div class="msgInputApply">
                                <button class="button" @click="applySave()">${loc('message_log_settings_apply')}</button>
                            </div>
                        `);
                        
                        
                        vBind({
                            el: `#specialModal`,
                            data: {
                                s: global.settings.msgFilters,
                                mi: maxInputs,
                                si: saveInputs
                            },
                            methods: {
                                check(filter){
                                    if (!global.settings.msgFilters[filter].vis && message_logs.view === filter){
                                       let haveVis = false;
                                        Object.keys(global.settings.msgFilters).forEach(function (filt){
                                            if (global.settings.msgFilters[filt].vis && !haveVis){
                                                haveVis = true;
                                                $(`#msgQueueFilter-${message_logs.view}`).removeClass('is-active');
                                                $(`#msgQueueFilter-${filt}`).addClass('is-active');
                                                message_logs.view = filt;
                                                let queue = $(`#msgQueueLog`);
                                                clearElement(queue);
                                                message_logs[filt].forEach(function (msg){
                                                    queue.append($('<p class="has-text-'+msg.color+'"></p>').text(msg.msg));
                                                });
                                            }
                                        });
                                    }
                                },
                                checkDisabled(filter,fill){
                                    if (!global.settings.msgFilters[filter].vis){
                                        return false;
                                    }
                                    let totVis = 0;
                                    Object.keys(global.settings.msgFilters).forEach(function (filt){
                                        if (global.settings.msgFilters[filt].vis){
                                            totVis++;
                                        }
                                    });
                                    
                                    return totVis === 1;
                                },
                                maxVal(filter){
                                    if (maxInputs[filter] < 1){
                                        maxInputs[filter] = 1;
                                    }
                                },
                                saveVal(filter){
                                    if (saveInputs[filter] < 0){
                                        saveInputs[filter] = 0;
                                    }
                                    else if (saveInputs[filter] > global.settings.msgFilters[filter].max){
                                        saveInputs[filter] = global.settings.msgFilters[filter].max;
                                    }
                                },
                                applyMax(){
                                    message_filters.forEach(function (filter){
                                        let max = maxInputs[filter];
                                        global.settings.msgFilters[filter].max = max;
                                        if (max < global.settings.msgFilters[filter].save){
                                            saveInputs[filter] = max;
                                            global.settings.msgFilters[filter].save = max;
                                            global.lastMsg[filter].splice(max);
                                        }
                                        message_logs[filter].splice(max);
                                        if (message_logs.view === filter){
                                            $('#msgQueueLog').children().slice(max).remove();
                                        }
                                    });
                                },
                                applySave(){
                                    message_filters.forEach(function (filter){
                                        global.settings.msgFilters[filter].save = saveInputs[filter];
                                        global.lastMsg[filter].splice(saveInputs[filter]);
                                    });
                                }
                            }
                        });
                    }
                }, 50);
            }
        }
    });

    // Center Column
    let mainColumn = $(`<div id="mainColumn" class="column is-three-quarters"></div>`);
    $ctx.columns.append(mainColumn);
    let content = $(`<div class="content"></div>`);
    mainColumn.append(content);

    content.append(`<h2 class="is-sr-only">Tab Navigation</h2>`);
    $ctx.tabs = $(`<b-tabs id="mainTabs" v-model="s.civTabs" :animated="s.animated" @input="swapTab"></b-tabs>`);
    content.append($ctx.tabs);

    // Evolution Tab
    let evolution = $(`<b-tab-item id="evolution" class="tab-item sticky" :visible="s.showEvolve">
        <template slot="header">
            {{ 'tab_evolve' | label }}
        </template>
    </b-tab-item>`);
    $ctx.tabs.append(evolution);

    // City Tab
    let city = $(`<b-tab-item :visible="s.showCiv">
        <template slot="header">
            {{ 'tab_civil' | label }}
        </template>
        <div id="mTabCivil"></div>
    </b-tab-item>`);
    $ctx.tabs.append(city);

    // Civics Tab
    let civic = $(`<b-tab-item :visible="s.showCivic">
        <template slot="header">
            {{ 'tab_civics' | label }}
        </template>
        <div id="mTabCivic"></div>
    </b-tab-item>`);
    $ctx.tabs.append(civic);

    // Research Tab
    let research = $(`<b-tab-item :visible="s.showResearch">
        <template slot="header">
            {{ 'tab_research' | label }}
        </template>
        <div id="mTabResearch"></div>
    </b-tab-item>`);
    $ctx.tabs.append(research);

    // Resources Tab
    let resources = $(`<b-tab-item :visible="s.showResources">
        <template slot="header">
            {{ 'tab_resources' | label }}
        </template>
        <div id="mTabResource"></div>
    </b-tab-item>`);
    $ctx.tabs.append(resources);

    // ARPA Tab
    let arpa = $(`<b-tab-item :visible="s.showGenetics">
        <template slot="header">
            {{ 'tech_arpa' | label }}
        </template>
        <div id="mTabArpa"></div>
    </b-tab-item>`);
    $ctx.tabs.append(arpa);

    // Misc Tab
    let misc = $(`<b-tab-item :visible="showMiscTab()">
        <template slot="header">
            {{ 'tab_misc' | label }}
        </template>
        <div id="mTabMisc"></div>
    </b-tab-item>`);
    $ctx.tabs.append(misc);

    // Stats Tab
    let stats = $(`<b-tab-item :visible="s.showAchieve">
        <template slot="header">
            {{ 'tab_stats' | label }}
        </template>
        <div id="mTabStats"></div>
    </b-tab-item>`);
    $ctx.tabs.append(stats);

    $ctx.iconlist = '';
    let icons = [
        {i: 'nuclear',      f: 'steelem',               r: 2 },
        {i: 'zombie',       f: 'the_misery',            r: 2 },
        {i: 'fire',         f: 'ill_advised',           r: 2 },
        {i: 'mask',         f: 'friday',                r: 1 },
        {i: 'skull',        f: 'demon_slayer',          r: 2 },
        {i: 'taijitu',      f: 'equilibrium',           r: 2 },
        {i: 'martini',      f: 'utopia',                r: 2 },
        {i: 'lightbulb',    f: 'energetic',             r: 2 },
        {i: 'trash',        f: 'garbage_pie',           r: 2 },
        {i: 'banana',       f: 'banana',                r: 2 },
        {i: 'turtle',       f: 'finish_line',           r: 2 },
        {i: 'floppy',       f: 'digital_ascension',     r: 2 },
        {i: 'slime',        f: 'slime_lord',            r: 2 },
        {i: 'sludge',       f: 'grand_death_tour',      r: 2 },
        {i: 'lightning',    f: 'annihilation',          r: 2 },
        {i: 'trophy',       f: 'wish',                  r: 2 },
        {i: 'robot',        f: 'planned_obsolescence',  r: 2 },
        {i: 'heart',        f: 'valentine',             r: 1 },
        {i: 'clover',       f: 'leprechaun',            r: 1 },
        {i: 'bunny',        f: 'easter',                r: 1 },
        {i: 'egg',          f: 'egghunt',               r: 1 },
        {i: 'rocket',       f: 'launch_day',            r: 1 },
        {i: 'sun',          f: 'solstice',              r: 1 },
        {i: 'firework',     f: 'firework',              r: 1 },
        {i: 'ghost',        f: 'halloween',             r: 1 },
        {i: 'candy',        f: 'trickortreat',          r: 1 },
        {i: 'turkey',       f: 'thanksgiving',          r: 1 },
        {i: 'meat',         f: 'immortal',              r: 1 },
        {i: 'present',      f: 'xmas',                  r: 1 },
    ];

    $ctx.irank = alevel();
    if ($ctx.irank < 2){ $ctx.irank = 2; }
    for (let i=0; i<icons.length; i++){
        if (global.stats.feat[icons[i].f] && global.stats.feat[icons[i].f] >= icons[i].r){
            $ctx.iconlist = $ctx.iconlist + `<b-dropdown-item v-on:click="icon('${icons[i].i}')">${drawIcon(icons[i].i, 16, $ctx.irank)} {{ '${icons[i].i}' | label }}</b-dropdown-item>`;
        }
        else if (global.settings.icon === icons[i].i){
            global.settings.icon = 'star';
        }
    }

    let egg9 = easterEgg(9,14);
    $ctx.hideEgg = '';
    if (egg9.length > 0){
        $ctx.hideEgg = `<b-dropdown-item>${egg9}</b-dropdown-item>`;
    }

    let trick = trickOrTreat(5,12,true);
    $ctx.hideTreat = '';
    if (trick.length > 0){
        $ctx.hideTreat = `<b-dropdown-item>${trick}</b-dropdown-item>`;
    }

    $ctx.localelist = '';
    $ctx.current_locale = '';
}

export function index_s2($ctx){
        if (Object.keys(locales).length > 1){
        Object.keys(locales).forEach(function (locale){
          let selected = global.settings.locale;
            if (selected === locale) {
              $ctx.current_locale = locales[locale];
            }
            $ctx.localelist = $ctx.localelist + `<b-dropdown-item v-on:click="lChange('${locale}')">${locales[locale]}</b-dropdown-item>`;
        });
    }

    // Settings Tab
    let settings = $(`<b-tab-item id="settings" class="settings sticky">
        <template slot="header">
            {{ 'tab_settings' | label }}
        </template>
        <div class="theme">
            <span>{{ 'theme' | label }} </span>
            <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>{{ 'theme_' + s.theme | label }}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                <b-dropdown-item v-on:click="setTheme('dark')">{{ 'theme_dark' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('light')">{{ 'theme_light' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('night')">{{ 'theme_night' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('darkNight')">{{ 'theme_darkNight' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('redgreen')">{{ 'theme_redgreen' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('gruvboxLight')">{{ 'theme_gruvboxLight' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('gruvboxDark')">{{ 'theme_gruvboxDark' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('gruvboxDarkRG')">{{ 'theme_gruvboxDarkRG' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('orangeSoda')">{{ 'theme_orangeSoda' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('dracula')">{{ 'theme_dracula' | label }}</b-dropdown-item>
                ${$ctx.hideEgg}
            </b-dropdown>

            <span>{{ 'units' | label }} </span>
            <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>{{ s.affix | notation }}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                <b-dropdown-item v-on:click="numNotation('sci')">{{ 'scientific' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="numNotation('eng')">{{ 'engineering' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="numNotation('sln')">{{ 'sln' | label }}</b-dropdown-item>
                ${$ctx.hideTreat}
            </b-dropdown>

            <span>{{ 'icons' | label }} </span>
            <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>{{ s.icon | label }}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                <b-dropdown-item v-on:click="icon('star')">${drawIcon('star',16,$ctx.irank)} {{ 'star' | label }}</b-dropdown-item>
                ${$ctx.iconlist}
            </b-dropdown>
        </div>
        <div id="localization" class="localization">
            <span>{{ 'locale' | label }} </span>
            <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>${$ctx.current_locale}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                ${$ctx.localelist}
            </b-dropdown>

            <span>{{ 'font' | label }} </span>
            <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>{{ s.font | label }}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                <b-dropdown-item v-on:click="font('standard')">{{ 'standard' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="font('large_log')">{{ 'large_log' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="font('large_all')">{{ 'large_all' | label }}</b-dropdown-item>
            </b-dropdown>
        </div>

        <div class="queue">
            <span>{{ 'queuestyle' | label }} </span>
            <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>{{ s.queuestyle | label }}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                <b-dropdown-item v-on:click="setQueueStyle('standardqueuestyle')">{{ 'standardqueuestyle' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setQueueStyle('listqueuestyle')">{{ 'listqueuestyle' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setQueueStyle('bulletlistqueuestyle')">{{ 'bulletlistqueuestyle' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setQueueStyle('numberedlistqueuestyle')">{{ 'numberedlistqueuestyle' | label }}</b-dropdown-item>
            </b-dropdown>

            <span class="settings15" aria-label="${loc('settings15')}">{{ 'q_merge' | label }} </span>
            <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>{{ s.q_merge | label }}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                <b-dropdown-item v-on:click="q_merge('merge_never')">{{ 'merge_never' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="q_merge('merge_nearby')">{{ 'merge_nearby' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="q_merge('merge_all')">{{ 'merge_all' | label }}</b-dropdown-item>
            </b-dropdown>

            <span>{{ 'q_resize' | label }} </span>
            <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>{{ 'q_resize_' + s.q_resize | label }}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                <b-dropdown-item v-on:click="setQueueResize('auto')">{{ 'q_resize_auto' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setQueueResize('grow')">{{ 'q_resize_grow' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setQueueResize('shrink')">{{ 'q_resize_shrink' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setQueueResize('manual')">{{ 'q_resize_manual' | label }}</b-dropdown-item>
            </b-dropdown>
        </div>

        <b-switch class="setting" v-model="s.pause" @input="unpause"><span class="settings12" aria-label="${loc('settings12')}">{{ 'pause' | label }}</span></b-switch>
        <b-switch class="setting" v-model="s.mKeys"><span class="settings1" aria-label="${loc('settings1')}">{{ 'm_keys' | label }}</span></b-switch>
        <b-switch class="setting" v-model="s.cLabels"><span class="settings5" aria-label="${loc('settings5')}">{{ 'c_cat' | label }}</span></b-switch>
        <b-switch class="setting" v-model="s.alwaysPower"><span class="settings17" aria-label="${loc('settings17')}">{{ 'always_power' | label }}</span></b-switch>
        <b-switch class="setting" v-model="s.qKey"><span class="settings6" aria-label="${loc('settings6')}">{{ 'q_key' | label }}</span></b-switch>
        <b-switch class="setting" v-model="s.qAny"><span class="settings7" aria-label="${loc('settings7')}">{{ 'q_any' | label }}</span></b-switch>
        <b-switch class="setting" v-model="s.qAny_res"><span class="settings14" aria-label="${loc('settings14')}">{{ 'q_any_res' | label }}</span></b-switch>
        <b-switch class="setting" v-model="s.sPackOn" @input="stringPackOn"><span class="settings13" aria-label="${loc('settings13')}">{{ 's_pack_on' | label }}</span></b-switch>
        <b-switch class="setting" v-model="s.expose"><span class="settings8" aria-label="${loc('settings8')}">{{ 'expose' | label }}</span></b-switch>
        <b-switch class="setting" v-model="s.tabLoad" @input="toggleTabLoad"><span class="settings11" aria-label="${loc('settings11')}">{{ 'tabLoad' | label }}</span></b-switch>
        <b-switch class="setting" v-model="s.boring"><span class="settings10" aria-label="${loc('settings10')}">{{ 'boring' | label }}</span></b-switch>
        <b-switch class="setting" v-model="s.touch"><span class="settings16" aria-label="${loc('settings16')}">{{ 'touch' | label }}</span></b-switch>
        <div>
            <div>${loc('key_mappings')}</div>
            <div class="keyMap"><span>${loc('multiplier',[10])}</span> <b-input v-model="s.keyMap.x10" id="x10Key"></b-input></div>
            <div class="keyMap"><span>${loc('multiplier',[25])}</span> <b-input class="keyMap" v-model="s.keyMap.x25" id="x25Key"></b-input></div>
            <div class="keyMap"><span>${loc('multiplier',[100])}</span> <b-input class="keyMap" v-model="s.keyMap.x100" id="x100Key"></b-input></div>
            <div class="keyMap"><span>${loc('q_key')}</span> <b-input class="keyMap" v-model="s.keyMap.q" id="queueKey"></b-input></div>
        </div>
        <div class="importExport">
            <div>${loc('tab_mappings')}</div>
            <div class="keyMap"><span>${loc('tab_civil')}</span> <b-input v-model="s.keyMap.showCiv" id="showCivKey"></b-input></div>
            <div class="keyMap"><span>${loc('tab_civics')}</span> <b-input v-model="s.keyMap.showCivic" id="showCivicKey"></b-input></div>
            <div class="keyMap"><span>${loc('tab_research')}</span> <b-input v-model="s.keyMap.showResearch" id="showResearchKey"></b-input></div>
            <div class="keyMap"><span>${loc('tab_resources')}</span> <b-input v-model="s.keyMap.showResources" id="showResourcesKey"></b-input></div>
            <div class="keyMap"><span>${loc('tech_arpa')}</span> <b-input v-model="s.keyMap.showGenetics" id="showGeneticsKey"></b-input></div>
            <div class="keyMap"><span>${loc('tab_misc')}</span> <b-input v-model="s.keyMap.showMisc" id="showMiscKey"></b-input></div>
            <div class="keyMap"><span>${loc('tab_stats')}</span> <b-input v-model="s.keyMap.showAchieve" id="showAchieveKey"></b-input></div>
            <div class="keyMap"><span>${loc('tab_settings')}</span> <b-input v-model="s.keyMap.settings" id="settingshKey"></b-input></div>
        </div>
        <div class="stringPack setting">
            <button id="stringPack" class="button" @click="importStringFile">{{ 'load_string_pack' | label }}</button>
            <input type="file" class="fileImport" id="stringPackFile" accept="text/plain, application/json">
            <button class="button right" @click="clearStringFile">{{ 'clear_string_pack' | label }}</button>
        </div>
        <div class="stringPack setting">
            <span>{{  | sPack}}</span>
        </div>
        <div class="importExport">
            <b-field label="${loc('import_export')}">
                <b-input id="importExport" type="textarea"></b-input>
            </b-field>
            <button class="button" @click="saveImport">{{ 'import' | label }}</button>
            <button class="button" @click="saveExport">{{ 'export' | label }}</button>
            <button class="button" @click="saveExportFile">{{ 'export_file' | label }}</button>
            <button class="button right" @click="restoreGame"><span class="settings9" aria-label="${loc('settings9')}">{{ 'restore' | label }}</span></button>
        </div>
        <div class="reset">
            <b-collapse :open="false">
                <b-switch v-model="s.disableReset" slot="trigger">{{ 'enable_reset' | label }}</b-switch>
                <div class="notification">
                    <div class="content">
                        <h4 class="has-text-danger">
                            {{ 'reset_warn' | label }}
                        </h4>
                        <p>
                            <button class="button" :disabled="!s.disableReset" @click="soft_reset()"><span class="settings4" aria-label="${loc('settings4')}">{{ 'reset_soft' | label }}</span></button>
                            <button class="button right" :disabled="!s.disableReset" @click="reset()"><span class="settings3" aria-label="${loc('settings3')}">{{ 'reset_hard' | label }}</span></button>
                        </p>
                    </div>
                </div>
            </b-collapse>
        </div>
    </b-tab-item>`);

    $ctx.tabs.append(settings);

    // (Hidden Last Tab) Hell Observation Tab
    let observe = $(`<b-tab-item disabled>
        <template slot="header"></template>
        <div id="mTabObserve"></div>
    </b-tab-item>`);
    $ctx.tabs.append(observe);

    // Right Column
    $ctx.columns.append(`<div id="queueColumn" class="queueCol column"></div>`);

    let egg15 = easterEgg(15,8);
    // Bottom Bar
    $('body').append(`
        <div class="promoBar">
            <span class="left">
                <h1>
                    <span class="has-text-warning">${egg15.length > 0 ? `Ev${egg15}lve` : `Evolve`}</span>
                    by
                    <span class="has-text-success">Demagorddon</span>
                </h1>
            </span>
            <span class="right">
                <h2 class="is-sr-only">External Links</h2>
                <ul class="external-links">
                    <li><a href="wiki.html" target="_blank">Wiki</a></li>
                    <li><a href="https://www.reddit.com/r/EvolveIdle/" target="_blank">Reddit</a></li>
                    <li><a href="https://discord.gg/dcwdQEr" target="_blank">Discord</a></li>
                    <li><a href="https://github.com/pmotschmann/Evolve" target="_blank">GitHub</a></li>
                    <li><a href="https://www.patreon.com/demagorddon" target="_blank">Patreon</a></li>
                    <li><a href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=PTRJZBW9J662C&currency_code=USD&source=url" target="_blank">Donate</a></li>
                </ul>
            </span>
        </div>
    `);
}
