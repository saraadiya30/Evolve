// Matematika orbit/posisi truepath: xShift, xPosition, genXYcoord, setOrbits, sensorRange, syndicate. Modul daun (core, registries, truepath_data, ship_stats), dipisah dari lone_survivor.js dan ship_orbits.js supaya solar_map, tau_ceti_shipyard, resources, dan space_requirements tidak saling menyeret.
import { spacePlanetStats } from './truepath_data.js';
import { global, support_on, p_on } from '../core/vars.js';
import { actions, traits } from '../core/registries.js';
import { shipAttackPower } from './ship_stats.js';

export function xShift(id){
    if (spacePlanetStats[id].orbit !== -2){
        let x = spacePlanetStats[id].dist / 3;
        if (global.city.ptrait.includes('elliptical') && id === 'spc_home'){
            x += 0.15;
        }
        if (id === 'spc_eris'){
            x += 25;
        }
        return x;
    }
    return 0;
}

export function xPosition(x,p){
    if (spacePlanetStats[p].orbit !== -2){
        let e = 1.075 + (spacePlanetStats[p].dist / 100);
        if (global.city.ptrait.includes('elliptical')){
            switch (p){
                case 'spc_home':
                    e = 1.5;
                    break;
                default:
                    e = 1.275 + (spacePlanetStats[p].dist / 100);
                    break;
            }
        }
        x *= e;
    }
    return x;
}

export function genXYcoord(planet){
    let cx = xPosition(+(Math.cos(global.space.position[planet] * (Math.PI / 180))).toFixed(5) * spacePlanetStats[planet].dist, planet);
    let cy = +(Math.sin(global.space.position[planet] * (Math.PI / 180))).toFixed(5) * spacePlanetStats[planet].dist;
    cx += xShift(planet);
    return {x: cx, y: cy};
}

export function setOrbits(){
    if (!global.space['position']){
        global.space['position'] = {};
    }
    Object.keys(spacePlanetStats).forEach(function(o){
        if (!global.space.position.hasOwnProperty(o)){
            global.space.position[o] = Math.rand(0,360);
        }
    });
    global.space.position.spc_home = global.space.position.spc_moon;
    global.space.position.spc_gas_moon = global.space.position.spc_gas;
    global.space.position.spc_titan = global.space.position.spc_enceladus;
    global.space.position.spc_saturn = global.space.position.spc_titan;
    global.space.position.spc_neptune = global.space.position.spc_triton;
}

export function sensorRange(s){
    let hf = 1;
    switch (s.class){
        case 'corvette':
        case 'frigate':
            hf = 2;
            break;
        case 'destroyer':
        case 'cruiser':
            hf = 1.5;
            break;
        case 'explorer':
            hf = 5;
            break;
        default:
            hf = 1;
            break;
    }
    switch (s.sensor){
        case 'visual':
            return 1;
        case 'radar':
            return 10 * hf;
        case 'lidar':
            return 18 * hf;
        case 'quantum':
            return 32 * hf;
    }
}

export function syndicate(region,extra){
    if (!global.tech['isolation'] && global.tech['syndicate'] && global.race['truepath'] && global.space['syndicate'] && global.space.syndicate.hasOwnProperty(region)){
        let divisor = 1000;

        let rival = 0;
        if (global.civic.foreign.gov3.hstl < 10){
            rival = 250 - (25 * global.civic.foreign.gov3.hstl);
        }
        else if (global.civic.foreign.gov3.hstl > 60){
            rival = (-13 * (global.civic.foreign.gov3.hstl - 60));
        }

        switch (region){
            case 'spc_home':
            case 'spc_moon':
            case 'spc_red':
            case 'spc_hell':
                divisor = 1250 + rival;
                break;
            case 'spc_gas':
            case 'spc_gas_moon':
            case 'spc_belt':
                divisor = 1020 + rival;
                break;
            case 'spc_titan':
            case 'spc_enceladus':
                divisor = actions.space[region].info.syndicate_cap();
                break;
            case 'spc_triton':
            case 'spc_kuiper':
            case 'spc_eris':
                divisor = actions.space[region].info.syndicate_cap();
                break;
        }

        let piracy = global.space.syndicate[region];
        if (global.race['chicken']){
            piracy *= 1 + (traits.chicken.vars()[1] / 100);
            piracy = Math.round(piracy);
        }
        if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.f){
            piracy *= 1 - (traits.ocular_power.vars()[1] / 500);
            piracy = Math.round(piracy);
        }
        let patrol = 0;
        let sensor = 0;
        let overkill = 0;
        if (global.space.hasOwnProperty('shipyard') && global.space.shipyard.hasOwnProperty('ships')){
            global.space.shipyard.ships.forEach(function(ship){
                if (ship.location === region && ship.transit === 0 && ship.fueled){
                    let rating = shipAttackPower(ship);
                    patrol += ship.damage > 0 ? Math.round(rating * (100 - ship.damage) / 100) : rating;
                    sensor += sensorRange(ship);
                }
            });

            if (region === 'spc_enceladus' && Math.min(support_on['operating_base'],p_on['operating_base']) > 0){
                let active = Math.min(support_on['operating_base'],p_on['operating_base']);
                patrol += active * 50;
            }
            else if (region === 'spc_titan' && p_on['sam'] > 0){
                patrol += p_on['sam'] * 25;
            }
            else if (region === 'spc_triton' && p_on['fob'] > 0){
                patrol += 500;
                sensor += 10;
            }

            if (sensor > 100){
                sensor = Math.round((sensor - 100) / ((sensor - 100) + 200) * 100) + 100;
            }

            patrol = Math.round(patrol * ((sensor + 25) / 125));
            if (patrol > piracy){
                overkill = patrol - piracy;
            }
            piracy = piracy - patrol > 0 ? piracy - patrol : 0;
        }

        if (extra){
            return {
                p: 1 - +(piracy / divisor).toFixed(4),
                r: piracy,
                s: sensor,
                o: overkill,
            };
        }
        return 1 - +(piracy / divisor).toFixed(4);
    }

    if (extra){
        return { p: 1, r: 0, s: 0, o: 0 };
    }
    return 1;
}
