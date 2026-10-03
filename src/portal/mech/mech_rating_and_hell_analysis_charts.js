import { global, hell_graphs } from '../../core/vars.js';
import { universeAffix } from '../../achievements/achieve.js';
import { clearElement, vBind } from '../../functions/functions.js';
import { loc } from '../../core/locale.js';
import { weaponPower, terrainEffect, statusEffect, terrainRating } from './mechbay_and_spire_floor.js';
import { checkBossResist } from './hellguard_and_mech_costs.js';
import { drawHellReports } from '../hell/hell_reports_and_warlord_achievement.js';
import { drawHellAnalysis_s1, drawHellAnalysis_s2, drawHellAnalysis_s3 } from '../../sections/portal/draw_hell_analysis_parts.js';

// Fungsi-fungsi dipindah dari portal.js (urutan sumber dipertahankan). portal.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function mechWeaponPower(size){
    switch (size){
        case 'minion':
            return 0.0015;
        case 'small':
            return 0.0025;
        case 'fiend':
            return 0.006;
        case 'medium':
            return 0.0075;
        case 'cyberdemon':
            return 0.009;
        case 'large':
            return 0.01;
        case 'archfiend':
            return 0.011;
        case 'titan':
            return 0.012;
        default:
            return 0;
    }
}

export function mechRating(mech,boss){
    let rating = mechWeaponPower(mech.size);
    if (rating === 0){
        return 0;
    }

    if (mech.hasOwnProperty('infernal') && mech.infernal && global.blood['prepared'] && global.blood.prepared >= 3){
        rating *= 1.25;
    }
    if (global.blood['wrath']){
        rating *= 1 + (global.blood.wrath / 20);
    }
    if (mech.size === 'archfiend' && mech.chassis != 'hydra'){
        rating *= 2;
    }

    if (boss){
        if (global.stats.achieve['gladiator'] && global.stats.achieve.gladiator.l > 0){
            rating *= 1 + global.stats.achieve.gladiator.l * 0.1;
        }
        if (mech.size === 'titan' || mech.size === 'archfiend'){
            rating *= 1.1;
        }

        let affix = universeAffix();
        if (global.stats.spire.hasOwnProperty(affix) && global.stats.spire[affix].hasOwnProperty('dlstr')){
            rating /= 100 + (global.stats.spire[affix].dlstr * 25);
        }
        else {
            rating /= 100;
        }

        let damage = 0;
        for (let i=0; i<mech.hardpoint.length; i++){
            damage += rating * weaponPower(mech,1);
        }
        return damage;
    }
    else {
        if (global.stats.achieve['gladiator'] && global.stats.achieve.gladiator.l > 0){
            rating *= 1 + global.stats.achieve.gladiator.l * 0.2;
        }

        if (global.portal.spire.type === 'concrete'){
            switch (mech.size){
                case 'minion':
                case 'small':
                    rating *= 0.92;
                    break;
                case 'fiend':
                case 'medium':
                    rating *= 0.95;
                    break;
                case 'archfiend':
                case 'titan':
                    rating *= 1.25;
                    break;
            }
        }

        let terrainFactor = terrainEffect(mech);

        let effects = [];
        Object.keys(global.portal.spire.status).forEach(function(effect){
            effects.push(effect);
            rating *= statusEffect(mech,effect);
        });

        rating *= terrainRating(mech,terrainFactor,effects);

        rating /= global.portal.spire.count;
        let damage = 0;
        for (let i=0; i<mech.hardpoint.length; i++){
            let effect = checkBossResist(global.portal.spire.boss,mech.hardpoint[i]);
            damage += rating * weaponPower(mech,effect);
        }
        return damage;
    }
}

export function drawHellObservations(startup){
    if (!global.settings.tabLoad && global.settings.civTabs !== ($(`#mainTabs > nav ul li`).length - 1) && !startup){
        return;
    }
    let info = $('#mTabObserve');
    clearElement(info);
    
    let observe = $(`<div id="hellObservations"></div>`);
    info.append(observe);
    
    observe.append(`<b-tabs id="hellTabs" class="resTabs" v-model="s.hellTabs" :animated="s.animated" @input="swapTab">
        <b-tab-item id="h_Report">
            <template slot="header">
                <span>${loc('hell_tabs_reports')}</span>
            </template>
        </b-tab-item>
        <b-tab-item id="h_Analysis">
            <template slot="header">
                <span>${loc('hell_tabs_analysis')}</span>
            </template>
        </b-tab-item>
    </b-tabs>`);
    
    vBind({
        el: `#hellObservations`,
        data: {
            s: global.settings
        },
        methods: {
            swapTab(tab){
                if (!global.settings.tabLoad){
                    clearElement($(`#h_Report`));
                    clearElement($(`#h_Analysis`));
                    switch (tab){
                        case 0:
                            drawHellReports();
                            break;
                        case 1:
                            drawHellAnalysis();
                            break;
                    }
                }
                return tab;
            }
        }
    });
    
    if (!global.settings.tabLoad){
        switch (global.settings.hellTabs){
            case 0:
                drawHellReports();
                break;
            case 1:
                drawHellAnalysis();
                break;
        }
    }
    else {
        drawHellReports();
        drawHellAnalysis();
    }
}

function drawHellAnalysis(){
    const $ctx = {};
    { const $r = drawHellAnalysis_s1($ctx); if ($r) return $r.$r; }
    
    drawHellAnalysis_s2($ctx);
    
    drawHellAnalysis_s3($ctx);
}

export function newGraph(name,type,labels,data,settings){
    let id = `hellGraph-${global.portal.observe.graphID}`;
    global.portal.observe.graphID++;
    global.portal.observe.graphs[id] = {
        id: id,
        chartID: `${id}-chart`,
        name: name,
        type: type,
        labels: labels,
        data: data,
        settings: settings
    };
    return id;
}

export function drawGraph(info,graphInfo){
    let id = graphInfo.id;
    if (hell_graphs[id]){
        hell_graphs[id].graph.destroy();
    }
    
    let chartCont = $(`<div id="graph-${id}-container" class="graphContainer"></div>`);
    info.append(chartCont);
    chartCont.append(`<div id="graph-${id}-controls" class="graphControls">
        <div>
            <h2></h2>
            <h2 class="text-button has-text-danger" @click="deleteGraph()">Delete</h2>
        </div>
        <div class="graphTitle">
            <h2>${graphInfo.name}</h2>
        </div>
    </div>`);
    let graph = $(`<div class="graph"></div>`);
    chartCont.append(graph);
    
    vBind({
        el: `#graph-${id}-controls`,
        methods: {
            deleteGraph(){
                hell_graphs[id].graph.destroy();
                delete hell_graphs[id];
                delete global.portal.observe.graphs[id];
                clearElement($(`#graph-${id}-container`),true);
                return;
            }
        }
    });
    
    let newChart = $(`<canvas id="${graphInfo.chartID}"></canvas>`);
    graph.append(newChart);
    
    hell_graphs[id] = {
        data: graphInfo.data
    };
    switch (graphInfo.type){
        case 'pie':
            hell_graphs[id].graph = drawPieChart(newChart,graphInfo.labels,graphInfo.data,graphInfo.settings);
            break;
        default:
            break;
    }
}

function drawPieChart(info,labels,data,settings){
    let drawData = [];
    data.forEach(function (dataPath){
        drawData.push(dataPath.length === 3 ? global.portal.observe.stats[dataPath[0]][dataPath[1]][dataPath[2]] : global.portal.observe.stats[dataPath[0]][dataPath[1]]);
    });
    return new Chart(info, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: drawData,
                backgroundColor: ['rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 205, 86)',
                'rgb(201, 203, 207)',
                'rgb(75, 192, 192)',
                '#B86BFF',
                '#48c774'],
                hoverOffset: 4
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}
