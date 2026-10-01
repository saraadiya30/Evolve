// newGraph / drawGraph / drawPieChart: grafik analisis hell.
import { global, hell_graphs } from '../../core/vars.js';
import { vBind, clearElement } from '../../functions/dom_helpers.js';

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

export function drawPieChart(info,labels,data,settings){
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
