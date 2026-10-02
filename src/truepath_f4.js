import { global } from './vars.js';
import { actions } from './actions.js';
import { spacePlanetStats } from './truepath.js';
import { genXYcoord, syndicate } from './truepath_f2.js';
import { xShift, xPosition } from './truepath_f3.js';
import { S } from './truepath_f_state.js';

// Fungsi-fungsi dipindah dari truepath.js (urutan sumber dipertahankan). truepath.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function drawMap() {
    let canvas = document.getElementById("mapCanvas");
    let ctx = canvas.getContext("2d");
    canvas.width = canvas.getBoundingClientRect().width;
    canvas.height = canvas.getBoundingClientRect().height;

    ctx.save();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.translate(S.mapShift.x, S.mapShift.y);
    ctx.scale(S.mapScale, S.mapScale);

    // Calculate positions
    let planetLocation = {};
    for (let [id, planet] of Object.entries(spacePlanetStats)) {
        planetLocation[id] = genXYcoord(id);
    }

    // Draw orbits
    ctx.lineWidth = 1 / S.mapScale;
    ctx.strokeStyle = "#c0c0c0";
    for (let [id, planet] of Object.entries(spacePlanetStats)) {
        if (!planet.moon && planet.orbit !== -2) {
            ctx.beginPath();
            if (planet.belt || (global.race['orbit_decayed'] && id === 'spc_home')){
                ctx.setLineDash([0.01, 0.01]);
            }
            else {
                ctx.setLineDash([]);
            }
            let cx = xShift(id);
            ctx.ellipse(cx, 0, xPosition(planet.dist,id), planet.dist, 0, 0, Math.PI * 2, true);
            ctx.stroke();
        }
    }

    // Ship trail
    ctx.fillStyle = "#0000ff";
    ctx.strokeStyle = "#0000ff";
    for (let ship of global.space.shipyard.ships) {
        if (ship.transit > 0) {
            ctx.beginPath();
            ctx.setLineDash([0.1, 0.4]);
            ctx.moveTo(ship.xy.x, ship.xy.y);
            ctx.lineTo(ship.destination.x, ship.destination.y);
            ctx.stroke();
        }
    }

    // Planets and moons
    for (let [id, planet] of Object.entries(spacePlanetStats)) {
        if (global.race['orbit_decayed'] && ['spc_home','spc_moon'].includes(id)){
            continue;
        }
        let color = '558888';
        if (actions.space[id] && actions.space[id].info.syndicate() && global.settings.space[id.substring(4)]){
            let shift = syndicate(id);
            color = ((Math.round(255*(1-shift)) << 16) + (Math.round(255*shift) << 8)).toString(16).padStart(6, 0);
        }
        if (id === 'spc_dwarf'){
            color = '7132a8';
        }
        else if (id === 'spc_sun' || id === 'tauceti'){
            color = 'f8ff2b';
        }
        ctx.fillStyle = "#" + color;
        ctx.beginPath();
        let size = planet.size / 10;
        if (planet.moon) {
            switch (id){
                case 'spc_moon':
                    ctx.arc(planetLocation[id].x + 0.05, planetLocation[id].y + 0.05, size, 0, Math.PI * 2, true);
                    break;
                case 'spc_titan':
                    ctx.arc(planetLocation[id].x - 0.2, planetLocation[id].y - 0.2, size, 0, Math.PI * 2, true);
                    break;
                default:
                    ctx.arc(planetLocation[id].x + 0.2, planetLocation[id].y + 0.2, size, 0, Math.PI * 2, true);
                    break;
            }
        }
        else {
            let size = planet.size / 10;
            switch (id){
                case 'spc_sun':
                    ctx.arc(planetLocation[id].x, planetLocation[id].y, size, 0, Math.PI * 2, true);
                    break;
                default:
                    ctx.arc(planetLocation[id].x, planetLocation[id].y, size, 0, Math.PI * 2, true);
                    break;
            }
        }
        ctx.fill();
    }

    // Ships
    ctx.fillStyle = "#0000ff";
    ctx.strokeStyle = "#0000ff";
    for (let ship of global.space.shipyard.ships) {
        if (ship.transit > 0) {
            ctx.beginPath();
            ctx.arc(ship.xy.x, ship.xy.y, 0.1, 0, Math.PI * 2, true);
            ctx.fill();
        }
    }

    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 2;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';

    ctx.fillStyle = "#009aff";
    ctx.font = `${20 / S.mapScale}px serif`;
    // Ship names
    for (let ship of global.space.shipyard.ships) {
        if (ship.transit > 0) {
            ctx.fillText(ship.name, ship.xy.x + 0.15, ship.xy.y - 0.15);
        }
    }

    ctx.fillStyle = "#ffa500";
    ctx.font = `${25 / S.mapScale}px serif`;
    // Planet names
    for (let [id, planet] of Object.entries(spacePlanetStats)) {
        if (actions.space[id] && global.settings.space[id.substring(4)]){
            if (global.race['orbit_decayed'] && ['spc_home'].includes(id)){
                continue;
            }
            let nameRef = actions.space[id].info.name;
            let nameText = typeof nameRef === "function" ? nameRef() : nameRef;
            if (planet.moon) {
                switch (id){
                    case 'spc_moon':
                        ctx.fillText(nameText, planetLocation[id].x + 0.1, planetLocation[id].y + 0.1);
                        break;
                    case 'spc_titan':
                        ctx.fillText(nameText, planetLocation[id].x - 0.3, planetLocation[id].y - 0.3);
                        break;
                    default:
                        ctx.fillText(nameText, planetLocation[id].x + 0.25, planetLocation[id].y + 0.2);
                        break;
                }
            } else {
                switch (id){
                    case 'spc_sun':
                        // Do Nothing
                        break;
                    default:
                        ctx.fillText(nameText, planetLocation[id].x, planetLocation[id].y - (0.2 * planet.size));
                        break;
                }
            }
        }
    }
    ctx.restore();
}

export function buildSolarMap(parentNode) {
    let currentNode = $(`<div style="margin-top: 10px; margin-bottom: 10px;"></div>`).appendTo(parentNode);
    let canvasOffset = {};
    let dragOffset = {};
    let mouseDown = false;
    S.mapShift = {};
    S.mapScale = 20.0;

    currentNode.append(
      $(`<canvas id="mapCanvas" style="width: 100%; height: 75vh"></canvas>`)
        .on("mouseup mouseover mouseout", () => mouseDown = false)
        .on("mousedown", (e) => {
            mouseDown = true;
            dragOffset.x = e.clientX - S.mapShift.x;
            dragOffset.y = e.clientY - S.mapShift.y;
        })
        .on("mousemove", (e) => {
            if (mouseDown) {
                S.mapShift.x = e.clientX - dragOffset.x;
                S.mapShift.y = e.clientY - dragOffset.y;
                drawMap();
            }
        })
        .on("wheel", (e) => {
            if(e.originalEvent.deltaY < 0) {
                S.mapScale /= 0.8;
                S.mapShift.x = canvasOffset.x + (S.mapShift.x - canvasOffset.x) / 0.8;
                S.mapShift.y = canvasOffset.y + (S.mapShift.y - canvasOffset.y) / 0.8;
                drawMap();
            }
            else {
                S.mapScale *= 0.8;
                S.mapShift.x = canvasOffset.x + (S.mapShift.x - canvasOffset.x) * 0.8;
                S.mapShift.y = canvasOffset.y + (S.mapShift.y - canvasOffset.y) * 0.8;
                drawMap();
            }
            return false;
        }),
      $(`<input type="button" value="+" style="position: absolute; width: 30px; height: 30px; top: 32px; right: 2px;">`)
        .on("click", () => {
            S.mapScale /= 0.8;
            S.mapShift.x = canvasOffset.x + (S.mapShift.x - canvasOffset.x) / 0.8;
            S.mapShift.y = canvasOffset.y + (S.mapShift.y - canvasOffset.y) / 0.8;
            drawMap();
        }),
      $(`<input type="button" value="-" style="position: absolute; width: 30px; height: 30px; top: 64px; right: 2px;">`)
        .on("click", () => {
            S.mapScale *= 0.8;
            S.mapShift.x = canvasOffset.x + (S.mapShift.x - canvasOffset.x) * 0.8;
            S.mapShift.y = canvasOffset.y + (S.mapShift.y - canvasOffset.y) * 0.8;
            drawMap();
        })
    );

    let bounds = document.getElementById("mapCanvas").getBoundingClientRect();
    canvasOffset.x = bounds.width / 2;
    canvasOffset.y = bounds.height / 2;
    S.mapShift.x = canvasOffset.x;
    S.mapShift.y = canvasOffset.y;

    drawMap();
}

export function solarModal(){
    $('#modalBox').append($('<p id="modalBoxTitle" class="has-text-warning modalTitle">Solar System</p>'));
    buildSolarMap($(`#modalBox`));
}
