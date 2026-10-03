import { global, sizeApproximation } from '../core/vars.js';
import { loc } from '../core/locale.js';
import { vBind, clearElement } from '../functions/functions.js';
import { traits } from '../races/races.js';
import { newGraph, drawGraph } from '../portal/portal_f6.js';

// Bagian dari drawHellAnalysis (portal_f6.js), dipisah mekanis: variabel yang dibagi antar bagian ada di $ctx.

export function drawHellAnalysis_s1($ctx){
        if (!global.settings.tabLoad && global.settings.hellTabs !== 1){
        return {$rv: 0};
    }
    let info = ($(`#h_Analysis`));
    $ctx.stats = $(`<div id="hellAnalysis" class="vscroll"></div>`);
    info.append($ctx.stats);
    let bd_settings = $(`<div></div>`);
    $ctx.stats.append(bd_settings);
    let analysis = $(`<div class="hellAnalysis"></div>`);
    $ctx.stats.append(analysis);
    let breakdown = $(`<div class="hellAnalysis"></div>`);
    analysis.append(breakdown);
    
    let totalAnal = $(`<div id="hellAnalysisTotal" class="analysisColumn"></div>`);
    let partialAnal = $(`<div id="hellAnalysisPeriod" class="analysisColumn"></div>`);
    breakdown.append(totalAnal);
    breakdown.append(partialAnal);
    
    bd_settings.append(`
        <div>
            <h2 class="has-text-warning">${loc('tab_settings')}</h2>
        </div>
        <div>
            <b-checkbox v-model="s.expanded">${loc('hell_analysis_expanded')}</b-checkbox>
            <b-checkbox v-model="s.average">${loc('hell_analysis_average')}</b-checkbox>
            <b-checkbox v-show="r.hyper || r.slow" v-model="s.hyperSlow">${loc('hell_analysis_hyperSlow')}</b-checkbox>
        </div>
        <div>
            <b-radio v-model="s.display" native-value="game_days">${loc('hell_analysis_time_game_days')}</b-radio>
            <b-radio v-model="s.display" native-value="seconds">${loc('hell_analysis_time_seconds')}</b-radio>
            <b-radio v-model="s.display" native-value="minutes">${loc('hell_analysis_time_minutes')}</b-radio>
            <b-radio v-model="s.display" native-value="hours">${loc('hell_analysis_time_hours')}</b-radio>
            <b-radio v-model="s.display" native-value="days">${loc('hell_analysis_time_days')}</b-radio>
        </div>
    `);
    
    vBind({
        el: '#hellAnalysis',
        data: {
            s: global.portal.observe.settings,
            r: global.race
        }
    });
    
    $ctx.calcAverage = function(num,gameDays,units){
        if (num){
            if (units !== 'game_days' && global.portal.observe.settings.hyperSlow){
                if (global.race['slow']){
                    gameDays *= 1 + (traits.slow.vars()[0] / 100);
                }
                if (global.race['hyper']){
                    gameDays *= 1 - (traits.hyper.vars()[0] / 100);
                }
            }
            num /= gameDays;
            switch (units){
                case 'seconds':
                    num /= 5;
                    break;
                case 'minutes':
                    num *= 12;
                    break;
                case 'hours':
                    num *= 720;
                    break;
                case 'days':
                    num *= 17280;
                    break;
                default:
                    break;
            }
            num = sizeApproximation(num, 5, global.portal.observe.settings.expanded);
        }
        return loc('hell_analysis_time_average',[num,loc(`hell_analysis_time_${units}_abbr`)])
    };
}

export function drawHellAnalysis_s2($ctx){
        let drawStats = function(id,type){
        if (!id){
            return;
        }
        let elem = $(`#${id}`)
        clearElement(elem);
        
        elem.append(`
            <div><h2 class="has-text-warning">${loc('hell_analysis_' + type)}</h2>${type === 'period' ? '<h2 id="resetHellObservation" class="text-button has-text-danger" @click="resetObservations()">{{ | resetLabel }}</h2>' : ''}</div>
            <div><h2 class="has-text-alert">{{ st.${type}.start | startLabel }}</h2></div>
            <div><h2>{{ st.${type}.days, s.display | time }}</h2></div>
            <div><h2>{{ st.${type}.kills, 'kills', s.average | genericMulti }}</h2><h2 class="text-button has-text-advanced" aria-label="${loc('hell_analysis_toggle_bd',[loc('hell_analysis_toggle_bd_kills')])}" @click="toggleDropdown('dropKills')">{{ s.dropKills | dropdownLabel }}</h2></div>
            <div v-show="s.dropKills">
                <div v-show="p.war_drone"><h2>{{ st.${type}.kills.drones, 'kills_drones', s.average | genericSub }}</h2></div>
                <div><h2>{{ st.${type}.kills.patrols, 'kills_patrols', s.average | genericSub }}</h2></div>
                <div><h2>{{ st.${type}.kills.sieges, 'kills_sieges', s.average | genericSub }}</h2></div>
                <div v-show="p.gun_emplacement"><h2>{{ st.${type}.kills.guns, 'kills_guns', s.average | genericSub }}</h2></div>
                <div v-show="p.soul_forge"><h2>{{ st.${type}.kills.soul_forge, 'kills_soul_forge', s.average | genericSub }}</h2></div>
                <div v-show="p.gate_turret"><h2>{{ st.${type}.kills.turrets, 'kills_turrets', s.average | genericSub }}</h2></div>
            </div>
            <div v-show="sg.display"><h2>{{ st.${type}.gems, 'gems', s.average | genericMulti }}</h2><h2 class="text-button has-text-advanced" aria-label="${loc('hell_analysis_toggle_bd',[global.resource.Soul_Gem.name])}" @click="toggleDropdown('dropGems')">{{ s.dropGems | dropdownLabel }}</h2></div>
            <div v-show="sg.display && s.dropGems">
                <div><h2>{{ st.${type}.gems.patrols, 'gems_patrols', s.average | genericSub }}</h2></div>
                <div v-show="p.gun_emplacement"><h2>{{ st.${type}.gems.guns, 'gems_guns', s.average | genericSub }}</h2></div>
                <div v-show="p.soul_forge"><h2>{{ st.${type}.gems.soul_forge, 'gems_soul_forge', s.average | genericSub }}</h2></div>
                <div v-show="p.soul_forge"><h2>{{ st.${type}.gems.crafted, 'gems_crafted', s.average | genericSub }}</h2></div>
                <div v-show="p.gate_turret"><h2>{{ st.${type}.gems.turrets, 'gems_turrets', s.average | genericSub }}</h2></div>
                <div v-show="p.war_drone && p.carport"><h2>{{ st.${type}.gems.surveyors, 'gems_surveyors', s.average | genericSub }}</h2></div>
                <div v-show="e.soul_compactor"><h2>{{ st.${type}.gems.compactor, 'gems_compactor', s.average | genericSub }}</h2></div>
            </div>
            <div><h2>{{ st.${type}.wounded, 'wounded', s.average | generic }}</h2></div>
            <div><h2>{{ st.${type}.died, 'died', s.average | generic }}</h2></div>
            <div v-show="r.revive"><h2>{{ st.${type}.revived, 'revived', s.average | generic }}</h2></div>
            <div><h2>{{ st.${type}.surveyors, 'surveyors', s.average | generic }}</h2></div>
            <div><h2>{{ st.${type}.sieges, 'sieges', s.average | generic }}</h2></div>
        `);
    
        vBind({
            el: `#${id}`,
            data: {
                st: global.portal.observe.stats,
                s: global.portal.observe.settings,
                p: global.portal,
                r: global.race,
                sg: global.resource.Soul_Gem,
                e: global.eden,
            },
            methods: {
                resetObservations(){
                    Object.keys(global.portal.observe.stats.period).forEach(function(stat){
                        if (['kills','gems'].includes(stat)){
                            Object.keys(global.portal.observe.stats.period[stat]).forEach(function(subStat){
                                global.portal.observe.stats.period[stat][subStat] = 0;
                            });
                        }
                        else if (stat === 'start'){
                            global.portal.observe.stats.period.start = { year: global.city.calendar.year, day: global.city.calendar.day }
                        }
                        else {
                            global.portal.observe.stats.period[stat] = 0;
                        }
                    });
                },
                toggleDropdown(type){
                    global.portal.observe.settings[type] = !global.portal.observe.settings[type];
                }
            },
            filters: {
                generic(num, name, average){
                    if (!average){
                        let val = sizeApproximation(num, 5, global.portal.observe.settings.expanded);
                        return loc('hell_analysis_number_display', [loc(`hell_analysis_${name}`), val]);
                    }
                    return loc('hell_analysis_number_display',[loc(`hell_analysis_${name}`),$ctx.calcAverage(num,global.portal.observe.stats[type].days,global.portal.observe.settings.display)]);
                },
                genericSub(num, name, average){
                    if (!average){
                        let val = sizeApproximation(num, 5, global.portal.observe.settings.expanded);
                        return 'ᄂ' + loc('hell_analysis_number_display', [loc(`hell_analysis_${name}`), val]);
                    }
                    return 'ᄂ' + loc('hell_analysis_number_display',[loc(`hell_analysis_${name}`),$ctx.calcAverage(num,global.portal.observe.stats[type].days,global.portal.observe.settings.display)]);
                },
                genericMulti(group, name, average){
                    let num = 0;
                    Object.keys(group).forEach(function(type){
                        num += group[type];
                    });
                    if (!average){
                        let val = sizeApproximation(num, 5, global.portal.observe.settings.expanded);
                        return loc('hell_analysis_number_display', [loc(`hell_analysis_${name}`), val]);
                    }
                    return loc('hell_analysis_number_display',[loc(`hell_analysis_${name}`),$ctx.calcAverage(num,global.portal.observe.stats[type].days,global.portal.observe.settings.display)]);
                },
                time(days, units){
                    if (units !== 'game_days' && global.portal.observe.settings.hyperSlow){
                        if (global.race['slow']){
                            days *= 1 + (traits.slow.vars()[0] / 100);
                        }
                        if (global.race['hyper']){
                            days *= 1 - (traits.hyper.vars()[0] / 100);
                        }
                    }
                    switch (units){
                        case 'seconds':
                            days *= 5;
                            break;
                        case 'minutes':
                            days /= 12;
                            break;
                        case 'hours':
                            days /= 720;
                            break;
                        case 'days':
                            days /= 17280;
                            break;
                        default:
                            break;
                    }
                    let formattedTime = sizeApproximation(days, global.portal.observe.settings.expanded ? 8 : 5, global.portal.observe.settings.expanded);
                    return loc('hell_analysis_time', [loc(`hell_analysis_time_${units}`), formattedTime]);
                },
                resetLabel(){
                    return loc('hell_analysis_period_reset');
                },
                startLabel(start){
                    return loc('hell_analysis_start',[start.year, start.day]);
                },
                dropdownLabel(open){
                    return open ? '▲' : '▼';
                }
            }
        });
    }
    drawStats('hellAnalysisTotal','total');
    drawStats('hellAnalysisPeriod','period');
    
    $ctx.stats = ($(`#hellAnalysis`));
    let graphs = $(`<div></div>`);
    $ctx.stats.append(graphs);
    graphs.append(`<div><h2 id="hellGraphCreator" class="text-button has-text-success" @click="createGraph()">${loc('hell_graph_create')}</h2></div>`);
    $ctx.graphArea = $(`<div id="hellGraphingArea" class="graphingArea"></div>`);
    graphs.append($ctx.graphArea);
}

export function drawHellAnalysis_s3($ctx){
        vBind({
        el: '#hellGraphCreator',
        methods: {
            createGraph(){
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
                        $('#modalBox').append($(`<p id="modalBoxTitle" class="has-text-warning modalTitle">${loc('hell_graph_title')}</p>`));

                        var body = $('<div id="specialModal" class="modalBody vscroll"></div>');
                        $('#modalBox').append(body);
                        let creator = $(`<div class="graphCreator"></div>`);
                        body.append(creator);

                        let settings = {
                            chartType: 'pie',
                            name: '',
                            chartName: '',
                            data: [],
                            radioFake: '',
                            showGroups: true
                        };
                        let error = {
                            show: false,
                            message: ''
                        }
                        
                        creator.append(`
                            <div><h2 class="has-text-warning">${loc('hell_graph_name')}</h2> <b-input v-model="s.name" :input="nameUpdate(s.name)"></b-input></div>
                        `)
                        creator.append(`
                            <div>
                                <div>
                                    <h2 class="has-text-warning">${loc('hell_graph_type')}</h2>
                                </div>
                                <div>
                                    <b-radio v-model="s.chartType" native-value="pie" @click.native="dataOptions('pie')">${loc('hell_graph_pie')}</b-radio>
                                </div>
                            </div>
                        `);
                        
                        let dataRegion = $(`<div id="graphDataSelection"></div>`);
                        creator.append(dataRegion); 
                        dataRegion.append(`<div><h2 class="has-text-warning">${loc('hell_graph_data')}</h2></div>`);
                        Object.keys(global.portal.observe.stats).forEach(function(dataSet){
                            ['kills','gems'].forEach(function(group){
                                dataRegion.append(`<div>
                                    <b-radio v-show="${group === 'gems' ? 'sg.display && ' : ''}s.showGroups" v-model="s.radioFake" native-value="${dataSet}${group}" @click.native="setData('${dataSet}','${group}')">${loc('hell_graph_datapoint',[loc(`hell_analysis_${dataSet}`),loc(`hell_analysis_${group}`)])}</b-radio>
                                </div>`);
                            });
                        });

                        creator.append(`
                            <div>
                                <div v-show="e.show">
                                    <h2 class="has-text-danger">{{ e.message }}</h2>
                                </div>
                                <div>
                                    <button class="button" @click="createGraph()">${loc('hell_graph_create')}</button>
                                </div>
                            </div>
                        `);
                        
                        vBind({
                            el: `#specialModal`,
                            data: {
                                s: settings,
                                e: error,
                                sg: global.resource.Soul_Gem
                            },
                            methods: {
                                nameUpdate(name){
                                    if (settings.chartName !== name){
                                        error.show = false;
                                        settings.chartName = name;
                                    }
                                },
                                dataOptions(type){
                                    switch (type){
                                        case 'pie':
                                            settings.showGroups = true;
                                            break;
                                        case 'bar':
                                            settings.showGroups = false;
                                            break;
                                    }
                                },
                                setData(type,group){
                                    error.show = false;
                                    settings.data = [type,group];
                                },
                                createGraph(){
                                    if (!settings.name){
                                        error.show = true;
                                        error.message = loc('hell_graph_error_name_blank');
                                        return;
                                    }
                                    else if (settings.data.length === 0){
                                        error.show = true;
                                        error.message = loc('hell_graph_error_data_missing');
                                        return;
                                    }
                                    let graphLabels = [];
                                    let graphData = [];
                                    switch(settings.chartType){
                                        case 'pie':
                                            Object.keys(global.portal.observe.stats[settings.data[0]][settings.data[1]]).forEach(function(dataPoint){
                                                graphLabels.push(loc(`hell_analysis_${settings.data[1]}_${dataPoint}`));
                                                graphData.push([settings.data[0],settings.data[1],dataPoint]);
                                            });
                                            break;
                                        case 'bar':
                                            break;
                                    }
                                    let graphID = newGraph(settings.chartName,settings.chartType,graphLabels,graphData,{title: settings.chartName});
                                    drawGraph($ctx.graphArea,global.portal.observe.graphs[graphID]);
                                    //Exit the modal
                                    document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape'}));
                                    document.dispatchEvent(new KeyboardEvent('keyup', {'key': 'Escape'}));
                                }
                            }
                        });
                    }
                }, 50);
            }
        }
    });
    
    //Draw existing graphs.
    Object.keys(global.portal.observe.graphs).forEach(function(id){
        drawGraph($ctx.graphArea,global.portal.observe.graphs[id]);
    });
}
