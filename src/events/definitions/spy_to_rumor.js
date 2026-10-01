import { global, seededRandom } from '../../core/vars.js';
import { fathomCheck } from '../../races/trait_logic/fathom_check.js';
import { blubberFill } from '../../races/powers/psychic_powers.js';
import { traits, races } from '../../core/registries.js';
import { loc } from '../../core/locale.js';
import { govTitle } from '../../civics/military/government_definitions.js';
import { soldierDeath } from '../../civics/military/army_rating.js';
import { jobScale } from '../../civics/jobs/job_scale.js';
import { flib } from '../../functions/run_stats_helpers.js';
import { slaveLoss, basicEvent } from '../event_helpers.js';

// Bagian dari events (54 entri: spy .. rumor), dipisah dari events.js. Urutan entri sama persis.
export const eventsPart2 = {
    spy: {
        reqs: {
            tech: 'primitive',
            notech: 'world_control'
        },
        type: 'major',
        condition(){
            if (global.race['elusive']){
                return false;
            }
            let fathom = fathomCheck('satyr');
            if (fathom > 0.25){
                return false;
            }
            for (let i=0; i<3; i++){
                if (global.civic.foreign[`gov${i}`].spy > 0 && !global.civic.foreign[`gov${i}`].occ && !global.civic.foreign[`gov${i}`].anx && !global.civic.foreign[`gov${i}`].buy){
                    return true;
                }
            }
            return false;
        },
        effect(){
            let govs = [];
            for (let i=0; i<3; i++){
                if (global.civic.foreign[`gov${i}`].spy > 0 && !global.civic.foreign[`gov${i}`].occ && !global.civic.foreign[`gov${i}`].anx && !global.civic.foreign[`gov${i}`].buy){
                    govs.push(i);
                }
            }
            let gov = govs[Math.rand(0,govs.length)];
            global.civic.foreign[`gov${gov}`].spy--;
            if (global.civic.foreign[`gov${gov}`].spy === 0) {
                global.civic.foreign[`gov${gov}`].act = 'none';
                global.civic.foreign[`gov${gov}`].sab = 0;
            }
            
            return loc('event_spy',[govTitle(gov)]);
        }
    },
    mine_collapse: {
        reqs: {
            tech: 'mining',
        },
        type: 'major',
        condition(){
            if (global.resource[global.race.species].amount > 0 && global.civic.miner.workers > 0){
                return true;
            }
            return false;
        },
        effect(){
            global.resource[global.race.species].amount--;
            global.civic.miner.workers--;
            blubberFill(1);
            return loc('event_mine_collapse');
        }
    },
    klepto: {
        reqs: {
            trait: 'rogue',
            resource: 'Money'
        },
        type: 'major',
        effect(){
            let stealList = [];
            [
                'Money','Food','Lumber','Stone','Chrysotile','Crystal','Furs','Copper','Iron',
                'Cement','Coal','Uranium','Aluminium','Steel','Titanium','Alloy','Polymer','Iridium',
                'Neutronium','Adamantite','Infernite','Elerium','Nano_Tube','Graphene','Stanene',
                'Bolognium','Vitreloy','Orichalcum','Asphodel_Powder','Elysanite','Unobtainium','Quantium',
                'Plywood','Brick','Wrought_Iron','Sheet_Metal','Mythril','Aerogel','Nanoweave','Scarletite'
            ].forEach(function(r){
                if (global.resource[r].display){
                    stealList.push(r);
                }
            });

            let maxRoll = Math.round(global.stats.know / 25);
            let res = stealList[Math.floor(seededRandom(0,stealList.length))];
            if (global.resource[res].max > 0 && maxRoll > global.resource[res].max * traits.rogue.vars()[0] / 100){
                maxRoll = Math.round(global.resource[res].max * traits.rogue.vars()[0] / 100);
            }

            let gain = Math.floor(seededRandom(1,maxRoll));
            if (global.resource[res].max !== -1 && global.resource[res].amount + gain > global.resource[res].max){
                global.resource[res].amount = global.resource[res].max;
            }
            else {
                global.resource[res].amount += gain;
            }

            return res === 'Money' ? loc('event_klepto_money',[gain]) : loc('event_klepto',[gain,global.resource[res].name]);
        }
    },
    chicken_feast:{ 
        reqs: {
            tech: 'primitive',
            trait: 'chicken'
        },
        condition(){
            if (global.resource[global.race.species].amount > 0){
                return true;
            }
            return false;
        },
        type: 'major',
        effect(){
            let dead = Math.floor(seededRandom(2,jobScale(10)));
            let type = Math.floor(seededRandom(0,10));
            if (dead > global.resource[global.race.species].amount){ dead = global.resource[global.race.species].amount; }
            global.resource[global.race.species].amount -= dead;
            blubberFill(dead);
            if(type === 7){
                return loc('event_chicken',[loc(`event_chicken_eaten${type}`,[flib('name')]),dead,loc(`event_chicken_seasoning${Math.floor(seededRandom(0,10))}`)]);
            }
            return loc('event_chicken',[loc(`event_chicken_eaten${type}`),dead,loc(`event_chicken_seasoning${Math.floor(seededRandom(0,10))}`)]);
        }
    },
    brawl:{ 
        reqs: {
            tech: 'primitive',
            trait: 'aggressive'
        },
        condition(){
            if (global.resource[global.race.species].amount > 0){
                return true;
            }
            return false;
        },
        type: 'major',
        effect(){
            let dead = Math.floor(seededRandom(1,jobScale(traits.aggressive.vars()[0] + 1)));
            if (dead > global.civic.garrison.workers){ dead = global.civic.garrison.workers; }
            soldierDeath(dead);
            return loc('event_brawl_s',[loc(`event_brawl${Math.floor(seededRandom(0,10))}`),dead]);
        }
    },
    m_curious: {
        reqs: {
            tech: 'primitive',
            trait: 'curious',
        },
        condition(){
            if (global.resource[global.race.species].amount >= 40){
                return true;
            }
            return false;
        },
        type: 'major',
        effect(){
            switch (Math.rand(0,5)){
                case 0:
                    {
                        let res = 'Money';
                        let vol = Math.rand(50000,5000000);
                        switch (Math.rand(0,5)){
                            case 0:
                                if (global.resource.Steel.display){
                                    res = 'Steel';
                                    vol = Math.rand(100,100000);
                                }
                                break;
                            case 1:
                                if (global.resource.Bolognium.display){
                                    res = 'Bolognium';
                                    vol = Math.rand(500,50000);
                                }
                                break;
                            case 2:
                                if (global.resource.Alloy.display){
                                    res = 'Alloy';
                                    vol = Math.rand(250,1000000);
                                }
                                break;
                            case 3:
                                if (global.resource.Adamantite.display){
                                    res = 'Adamantite';
                                    vol = Math.rand(1000,250000);
                                }
                                break;
                            case 4:
                                if (global.resource.Soul_Gem.display){
                                    res = 'Soul_Gem';
                                    vol = 1;
                                }
                                break;
                        }
                        global.resource[res].amount += vol;
                        if (global.resource[res].max >= 0 && global.resource[res].amount > global.resource[res].max){
                            global.resource[res].amount = global.resource[res].max;
                        }
                        if (res === 'Money'){
                            return loc(`event_m_curious0`,[races[global.race.species].name,'$',vol.toLocaleString()]);
                        }
                        return loc(`event_m_curious0`,[races[global.race.species].name,vol.toLocaleString(),global.resource[res].name]);
                    }
                case 1:
                    {
                        global.resource[global.race.species].amount -= 10;
                        global.civic[global.civic.d_job].workers -= 10;
                        if (global.civic[global.civic.d_job].workers < 0){
                            global.civic[global.civic.d_job].workers = 0;
                        }
                        return loc(`event_m_curious1`,[races[global.race.species].name]);
                    }
                case 2:
                    {
                        global.race['inspired'] = Math.rand(600,1200);
                        return loc(`event_m_curious2`,[races[global.race.species].name]);
                    }
                case 3:
                    {
                        global.race['distracted'] = Math.rand(200,600);
                        return loc(`event_m_curious3`,[races[global.race.species].name]);
                    }
                case 4:
                    {
                        if (global.race.species === 'cath'){
                            global.race['stimulated'] = Math.rand(500,1000);
                            return loc(`event_m_curious4a`,[races[global.race.species].name]);
                        }
                        else {
                            return loc(`event_m_curious4b`,[races[global.race.species].name]);
                        }
                    }
            }
        }
    },
    curious1: {
        reqs: {
            tech: 'primitive',
            trait: 'curious',
        },
        type: 'minor',
        effect(){
            let num = Math.rand(0,5);
            return loc(`event_curious${num}`,[races[global.race.species].name]);
        }
    },
    curious2: {
        reqs: {
            tech: 'primitive',
            trait: 'curious',
        },
        type: 'minor',
        effect(){
            let num = Math.rand(5,10);
            return loc(`event_curious${num}`,[races[global.race.species].name]);
        }
    },
    slave_escape1: slaveLoss('minor','escape1'),
    slave_escape2: slaveLoss('minor','escape2'),
    slave_escape3: slaveLoss('minor','death4'),
    shooting_star: basicEvent('shooting_star','primitive'),
    tumbleweed: basicEvent('tumbleweed','primitive'),
    flashmob: basicEvent('flashmob','high_tech'),
    witch_hunt: {
        reqs: {
            tech: 'magic',
        },
        type: 'minor',
        condition(){
            return global.race['witch_hunter'] && global.resource.Sus.amount >= 50 && global.civic.scientist.workers > 0 ? true : false;
        },
        effect(){
            global.resource[global.race.species].amount--;
            global.civic.scientist.workers--;
            global.civic.scientist.assigned--;
            blubberFill(1);
            return loc(`witch_hunter_witch_hunt`);
        }
    },
    chicken:{ 
        reqs: {
            tech: 'primitive',
            trait: 'chicken'
        },
        condition(){
            if (global.resource[global.race.species].amount > 0){
                return true;
            }
            return false;
        },
        type: 'minor',
        effect(){
            global.resource[global.race.species].amount--;
            blubberFill(1);
            let type = Math.floor(seededRandom(0,10));
            if(type === 7){
                return loc('event_chicken',[loc(`event_chicken_eaten${type}`,[flib('name')]),1,loc(`event_chicken_seasoning${Math.floor(seededRandom(0,10))}`)]);
            }
            return loc('event_chicken',[loc(`event_chicken_eaten${type}`),1,loc(`event_chicken_seasoning${Math.floor(seededRandom(0,10))}`)]);
        }
    },
    fight:{ 
        reqs: {
            tech: 'primitive',
            trait: 'aggressive'
        },
        condition(){
            if (global.resource[global.race.species].amount > 0){
                return true;
            }
            return false;
        },
        type: 'minor',
        effect(){
            let dead = Math.floor(seededRandom(1,jobScale(traits.aggressive.vars()[1] + 1)));
            if (dead > global.resource[global.race.species].amount){ dead = global.resource[global.race.species].amount; }
            global.resource[global.race.species].amount -= dead;
            blubberFill(dead);
            return loc('event_brawl_c',[loc(`event_brawl${Math.floor(seededRandom(0,10))}`),dead]);
        }
    },
    heatwave: {
        reqs: {
            tech: 'primitive',
        },
        type: 'minor',
        condition(){
            // No planet or already hot
            if (global.race['cataclysm'] || global.race['orbit_decayed'] || global.city.calendar.temp === 2){
                return false;
            }
            // Winter on tundra or taiga biome is always cold
            // Eden is idyllic, so normally cannot be hot except in summer. For heat wave, allow in spring, summer, or autumn.
            if (global.city.calendar.season === 3 && ['tundra','taiga','eden'].includes(global.city.biome)){
                return false;
            }
            // Always allow heat wave on other biomes, even during winter
            return true;
        },
        effect(){
            global.city.calendar.temp = 2;
            global.city.cold = 0;
            return loc('event_heatwave');
        }
    },
    coldsnap: {
        reqs: {
            tech: 'primitive',
        },
        type: 'minor',
        condition(){
            // No planet or already cold
            if (global.race['cataclysm'] || global.race['orbit_decayed'] || global.city.calendar.temp === 0){
                return false;
            }
            // Hellscape is never cold (except allow on custom planet hellscape with permafrost)
            if (global.city.biome === 'hellscape' && !global.city.ptrait.includes('permafrost')){
                return false;
            }
            // Summer on volcanic or ashland biome is always hot
            // Eden is idyllic, so normally cannot be cold except in winter. For cold snap, allow in autumn, winter, or spring.
            if (global.city.calendar.season === 1 && ['ashland','volcanic','eden'].includes(global.city.biome)){
                return false;
            }
            // Always allow cold snap on other biomes, even during summer
            return true;
        },
        effect(){
            global.city.calendar.temp = 0;
            global.city.hot = 0;
            return loc('event_coldsnap');
        }
    },
    cucumber: basicEvent('cucumber','primitive'),
    planking: basicEvent('planking','high_tech'),
    furryfish: basicEvent('furryfish','primitive'),
    meteor_shower: basicEvent('meteor_shower','primitive'),
    hum: basicEvent('hum','high_tech'),
    bloodrain: basicEvent('bloodrain','primitive'),
    haunting: basicEvent('haunting','science'),
    mothman: basicEvent('mothman','science'),
    dejavu: basicEvent('dejavu','theology'),
    dollar: basicEvent('dollar','currency',function(){
        let cash = Math.rand(1,10);
        global.resource.Money.amount += cash;
        if (global.resource.Money.amount > global.resource.Money.max){
            global.resource.Money.amount = global.resource.Money.max;
        }
        return cash;
    }),
    pickpocket: basicEvent('pickpocket','currency',function(){
        let cash = Math.rand(1,10);
        global.resource.Money.amount -= cash;
        if (global.resource.Money.amount < 0){
            global.resource.Money.amount = 0;
        }
        return cash;
    }),
    bird: basicEvent('bird','primitive'),
    contest: {
        reqs: {
            tech: 'science',
        },
        type: 'minor',
        effect(){
            let place = Math.rand(0,3);
            let contest = Math.rand(0,10);
            return loc('event_contest',[loc(`event_contest_place${place}`),loc(`event_contest_type${contest}`)]);
        }
    },
    cloud: basicEvent('cloud','primitive',function(){
        let type = Math.rand(0,11);
        return loc(`event_cloud_type${type}`);
    }),
    dark_cloud: {
        reqs: {
            tech: 'primitive',
        },
        type: 'minor',
        condition(){
            if (!global.race['cataclysm'] && !global.race['orbit_decayed'] && global.city.calendar.weather !== 0){
                return true;
            }
            return false;
        },
        effect(){
            global.city.calendar.weather = 0;
            return loc('event_dark_cloud');
        }
    },
    gloom: {
        reqs: {
            tech: 'primitive',
        },
        type: 'minor',
        condition(){
            if (!global.race['cataclysm'] && !global.race['orbit_decayed'] && global.city.calendar.weather !== 1){
                return true;
            }
            return false;
        },
        effect(){
            global.city.calendar.weather = 1;
            return loc('event_gloom');
        }
    },
    tracks: basicEvent('tracks','primitive'),
    hoax: basicEvent('hoax','primitive'),
    burial: basicEvent('burial','primitive'),
    artifacts: basicEvent('artifacts','high_tech'),
    parade: basicEvent('parade','world_control'),
    crop_circle: basicEvent('crop_circle','agriculture'),
    llama: basicEvent('llama','primitive',function(){
        let food = Math.rand(25,100);
        global.resource.Food.amount -= food;
        if (global.resource.Food.amount < 0){
            global.resource.Food.amount = 0;
        }
        return food;
    },
    function(){
        if (global.race['carnivore'] || global.race['soul_eater'] || global.race['detritivore'] || global.race['artifical']){
            return false;
        }
        return true;
    }),
    cat: basicEvent('cat','primitive'),
    omen: basicEvent('omen','primitive'),
    theft: basicEvent('theft','primitive',function(){
        let thief = Math.rand(0,10);
        return loc(`event_theft_type${thief}`);
    }),
    compass: basicEvent('compass','mining'),
    bone: basicEvent('bone','primitive'),
    delicacy: basicEvent('delicacy','high_tech'),
    prank: basicEvent('prank','primitive',function(){
        let prank = Math.rand(0,10);
        return loc(`event_prank_type${prank}`);
    }),
    graffiti: basicEvent('graffiti','science'),
    soul: basicEvent('soul','soul_eater'),
    cheese: {
        reqs: {
            tech: 'banking',
        },
        type: 'minor',
        condition(){
            if (global.tech['banking'] && global.tech.banking >= 7){
                return true;
            }
            return false;
        },
        effect(){
            let resets = global.stats.hasOwnProperty('reset') ? global.stats.reset + 1 : 1;
            global.race['cheese'] = Math.rand(10,10 + resets);
            return loc(`event_cheese`);
        }
    },
    tremor: basicEvent('tremor','primitive'),
    rumor: basicEvent('rumor','primitive',function(){
        let rumor = Math.rand(0,10);
        return loc(`event_rumor_type${rumor}`);
    }),
};
