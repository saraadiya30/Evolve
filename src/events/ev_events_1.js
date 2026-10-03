import { global, support_on, p_on, seededRandom } from '../core/vars.js';
import { loc } from '../core/locale.js';
import { races, traits } from '../races/races.js';
import { actions, drawTech, housingLabel } from '../actions/actions.js';
import { checkControlling, armyRating, garrisonSize, soldierDeath } from '../civics/civics.js';
import { unlockAchieve } from '../achievements/achieve.js';
import { govActive } from '../governor/governor.js';
import { slaveLoss } from './ev_helpers.js';
import { pillaged, tax_revolt } from './events.js';

// Bagian dari events (24 entri: dna_replication .. scandal), dipisah dari events.js. Urutan entri sama persis.
export const eventsPart1 = {
    dna_replication: {
        reqs: {
            race: 'protoplasm',
            resource: 'DNA'
        },
        type: 'major',
        effect(){
            var gain = Math.rand(1,Math.round(global.resource.DNA.max / 3));
            var res = global.resource.DNA.amount + gain;
            if (res > global.resource.DNA.max){ res = global.resource.DNA.max; }
            global.resource.DNA.amount = res;
            return loc('event_dna',[gain.toLocaleString()]);
        }
    },
    rna_meteor: {
        reqs: {
            race: 'protoplasm',
            resource: 'RNA'
        },
        type: 'major',
        effect(){
            var gain = Math.rand(1,Math.round(global.resource.RNA.max / 2));
            var res = global.resource.RNA.amount + gain;
            if (res > global.resource.RNA.max){ res = global.resource.RNA.max; }
            global.resource.RNA.amount = res;
            return loc('event_rna',[gain.toLocaleString()]);
        }
    },
    inspiration: {
        reqs: {
            resource: 'Knowledge'
        },
        type: 'major',
        effect(){
            global.race['inspired'] = Math.rand(300,600);
            return loc('event_inspiration');
        }
    },
    motivation: {
        reqs: {
            tech: 'primitive',
        },
        type: 'major',
        effect(){
            global.race['motivated'] = Math.rand(300,600);
            return loc('event_motivation');
        }
    },
    fire: {
        reqs: {
            resource: 'Lumber',
            nogenus: 'aquatic',
            notrait: 'evil'
        },
        type: 'major',
        effect(){
            var loss = Math.rand(1,Math.round(global.resource.Lumber.amount / 4));
            var res = global.resource.Lumber.amount - loss;
            if (res < 0){ res = 0; }
            global.resource.Lumber.amount = res;
            return loc('event_fire',[loss.toLocaleString()]);
        }
    },
    flare: {
        reqs: {
            tech: 'primitive',
        },
        type: 'major',
        condition(){
            return global.city.ptrait.includes('flare') ? true : false;
        },
        effect(wiki){
            let at_risk = 0;
            let planet = races[global.race.species].home;
            if (global.race['cataclysm'] || global.race['orbit_decayed']){
                if (global.space.hasOwnProperty('living_quarters')){
                    let num_lq_on = wiki ? global.space.living_quarters.on : support_on['living_quarters'];
                    at_risk += Math.round(num_lq_on * actions.space.spc_red.living_quarters.citizens());
                }
                planet = races[global.race.species].solar.red;
            }
            else {
                if (global.city.hasOwnProperty('basic_housing')){
                    at_risk += global.city.basic_housing.count * actions.city.basic_housing.citizens();
                }
                if (global.city.hasOwnProperty('cottage')){
                    at_risk += global.city.cottage.count * actions.city.cottage.citizens();
                }
                if (global.city.hasOwnProperty('apartment')){
                    let num_apartment_on = wiki ? global.city.apartment.on : p_on['apartment'];
                    at_risk += num_apartment_on * actions.city.apartment.citizens();
                }
            }
            if (at_risk > global.resource[global.race.species].amount){
                at_risk = global.resource[global.race.species].amount;
            }
            at_risk = Math.floor(at_risk * 0.1);

            let loss = Math.rand(0,at_risk);
            global.resource[global.race.species].amount -= loss;
            global.civic[global.civic.d_job].workers -= loss;
            if (global.civic[global.civic.d_job].workers < 0){
                global.civic[global.civic.d_job].workers = 0;
            }

            if (global.city.biome !== 'oceanic'){
                let time = 400;
                if (global.city.biome === 'forest'){
                    time *= 2;
                }
                else if (global.city.biome === 'desert' || global.city.biome === 'volcanic'){
                    time /= 2;
                }
                global.city['firestorm'] = Math.rand(time,time * 10);
            }

            return loc(global.city.biome === 'oceanic' ? 'event_flare2' : 'event_flare',[planet, loss.toLocaleString()]);
        }
    },
    raid: {
        reqs: {
            tech: 'military',
            notech: 'world_control'
        },
        type: 'major',
        condition(){
            if (checkControlling(`gov0`) && checkControlling(`gov1`) && checkControlling(`gov2`)){
                return false;
            }
            return !global.race['truepath'] && !global.race['cataclysm'] && (global.civic.foreign.gov0.hstl > 60 || global.civic.foreign.gov1.hstl > 60 || global.civic.foreign.gov2.hstl > 60) ? true : false;
        },
        effect(){
            let army = armyRating(garrisonSize(),'army',global.civic.garrison.wounded);
            let eAdv = global.tech['high_tech'] ? global.tech['high_tech'] + 1 : 1;
            let enemy = Math.rand(25,50) * eAdv;

            let injured = global.civic.garrison.wounded > garrisonSize() ? garrisonSize() : global.civic.garrison.wounded;
            let killed =  Math.floor(seededRandom(0,injured));
            let wounded = Math.floor(seededRandom(0,garrisonSize() - injured));
            if (global.race['instinct']){
                killed = Math.round(killed / 2);
                wounded = Math.round(wounded / 2);
            }
            soldierDeath(killed);
            global.civic.garrison.wounded += wounded;
            if (global.civic.garrison.wounded > global.civic.garrison.workers){
                global.civic.garrison.wounded = global.civic.garrison.workers;
            }

            if (global.race['blood_thirst']){
                global.race['blood_thirst_count'] += Math.ceil(enemy / 5);
                if (global.race['blood_thirst_count'] > traits.blood_thirst.vars()[0]){
                    global.race['blood_thirst_count'] = traits.blood_thirst.vars()[0];
                }
            }

            if (army > enemy){
                return loc('event_raid1',[killed.toLocaleString(),wounded.toLocaleString()]);
            }
            else {
                let loss = Math.rand(1,Math.round(global.resource.Money.amount / 4));
                if (loss <= 0){
                    return loc('event_raid1',[killed.toLocaleString(),wounded.toLocaleString()]);
                }
                else {
                    let res = global.resource.Money.amount - loss;
                    if (res < 0){ res = 0; }
                    global.resource.Money.amount = res;
                    return loc('event_raid2',[loss.toLocaleString(),killed.toLocaleString(),wounded.toLocaleString()]);
                }
            }
        }
    },
    siege: {
        reqs: {
            tech: 'military',
            notech: 'world_control'
        },
        type: 'major',
        condition(){
            if (checkControlling(`gov0`) || checkControlling(`gov1`) || checkControlling(`gov2`)){
                return false;
            }
            return !global.race['truepath'] && global.civic.foreign.gov0.hstl > 80 && global.civic.foreign.gov1.hstl > 80 && global.civic.foreign.gov2.hstl > 80 ? true : false;
        },
        effect(){
            let army = armyRating(garrisonSize(),'army',global.civic.garrison.wounded);
            let eAdv = global.tech['high_tech'] ? global.tech['high_tech'] + 1 : 1;
            let enemy = (global.civic.foreign.gov0.mil + global.civic.foreign.gov1.mil + global.civic.foreign.gov2.mil) * eAdv;

            let injured = global.civic.garrison.wounded > garrisonSize() ? garrisonSize() : global.civic.garrison.wounded;
            let killed =  Math.floor(seededRandom(0,injured));
            let wounded = Math.floor(seededRandom(0,garrisonSize() - injured));

            if (global.race['instinct']){
                killed = Math.round(killed / 2);
                wounded = Math.round(wounded / 2);
            }
            soldierDeath(killed);
            global.civic.garrison.wounded += wounded;
            if (global.civic.garrison.wounded > global.civic.garrison.workers){
                global.civic.garrison.wounded = global.civic.garrison.workers;
            }

            if (global.race['blood_thirst']){
                global.race['blood_thirst_count'] += Math.ceil(enemy / 5);
                if (global.race['blood_thirst_count'] > traits.blood_thirst.vars()[0]){
                    global.race['blood_thirst_count'] = traits.blood_thirst.vars()[0];
                }
            }

            if (army > enemy){
                return loc('event_siege1',[killed.toLocaleString(),wounded.toLocaleString()]);
            }
            else {
                var loss = Math.rand(1,Math.round(global.resource.Money.amount / 2));
                var res = global.resource.Money.amount - loss;
                if (res < 0){ res = 0; }
                global.resource.Money.amount = res;
                return loc('event_siege2',[loss.toLocaleString(),killed.toLocaleString(),wounded.toLocaleString()]);
            }
        }
    },
    pillage0: {
        reqs: {
            tech: 'military',
            notech: 'world_control'
        },
        type: 'major',
        condition(){
            return global.race['truepath'] && !global.tech['isolation'] && !checkControlling(`gov0`) && global.civic.foreign.gov0.hstl > 60 ? true : false;
        },
        effect(){
            return pillaged(`gov0`);
        }
    },
    pillage1: {
        reqs: {
            tech: 'military',
            notech: 'world_control'
        },
        type: 'major',
        condition(){
            return global.race['truepath'] && !global.tech['isolation'] && !checkControlling(`gov1`) && global.civic.foreign.gov1.hstl > 60 ? true : false;
        },
        effect(){
            return pillaged(`gov1`);
        }
    },
    pillage2: {
        reqs: {
            tech: 'military',
            notech: 'world_control'
        },
        type: 'major',
        condition(){
            return global.race['truepath'] && !global.tech['isolation'] && !checkControlling(`gov2`) && global.civic.foreign.gov2.hstl > 60 ? true : false;
        },
        effect(){
            return pillaged(`gov2`);
        }
    },
    pillage3: {
        reqs: {
            tech: 'military',
        },
        type: 'major',
        condition(){
            return global.race['truepath'] && !global.tech['isolation'] && global.tech['rival'] && global.civic.foreign.gov3.hstl > 60 ? true : false;
        },
        effect(){
            return pillaged(`gov3`,true);
        }
    },
    witch_hunt_crusade: {
        reqs: {
            tech: 'magic',
        },
        type: 'major',
        condition(){
            return global.race['witch_hunter'] && global.resource.Sus.amount >= 100 ? true : false;
        },
        effect(){
            return pillaged(`witchhunt`,true);
        }
    },
    terrorist: {
        reqs: {
            tech: 'world_control',
            notrait: 'truepath'
        },
        type: 'major',
        effect(){            
            let killed = Math.floor(seededRandom(0,global.civic.garrison.wounded));
            let wounded = Math.floor(seededRandom(0,global.civic.garrison.workers - global.civic.garrison.wounded));
            if (global.race['instinct']){
                killed = Math.round(killed / 2);
                wounded = Math.round(wounded / 2);
            }
            soldierDeath(killed);
            global.civic.garrison.wounded += wounded;
            if (global.civic.garrison.wounded > global.civic.garrison.workers){
                global.civic.garrison.wounded = global.civic.garrison.workers;
            }

            if (global.race['blood_thirst']){
                global.race['blood_thirst_count'] += 1000;
                if (global.race['blood_thirst_count'] > traits.blood_thirst.vars()[0]){
                    global.race['blood_thirst_count'] = traits.blood_thirst.vars()[0];
                }
            }

            if (killed === 0){
                return loc('event_terrorist1',[wounded.toLocaleString()]);
            }
            else {
                return loc('event_terrorist2',[wounded.toLocaleString(),killed.toLocaleString()]);
            }
        }
    },
    quake: {
        reqs: {
            tech: 'wsc',
            notech: 'quaked'
        },
        type: 'major',
        condition(){
            return global.city.ptrait.includes('unstable') ? true : false;
        },
        effect(){
            global.tech['quaked'] = 1;
            drawTech();
            return loc('event_quake',[global.race['cataclysm'] || global.race['orbit_decayed'] ? races[global.race.species].solar.red : races[global.race.species].home]);
        }
    },
    doom: {
        reqs: {
            tech: 'wsc',
            notech: 'portal_guard'
        },
        type: 'major',
        condition(){
            return global.space['space_barracks'] && global.space.space_barracks.on > 0 ? true : false;
        },
        effect(){
            unlockAchieve('doomed');
            global.stats.portals++;
            return loc(global.race['evil'] ? 'event_doom_alt' : 'event_doom',[races[global.race.species].solar.dwarf]);
        }
    },
    demon_influx: {
        reqs: {
            tech: 'portal_guard'
        },
        type: 'major',
        effect(){
            let surge = Math.rand(2500,5000);
            global.portal.fortress.threat += surge;
            return loc('event_demon_influx',[surge.toLocaleString()]);
        }
    },
    ruins: {
        reqs: {
            trait: 'ancient_ruins',
            resource: 'Knowledge'
        },
        type: 'major',
        effect(){
            let resources = ['Iron','Copper','Steel','Cement'];
            for (var i = 0; i < resources.length; i++){
                let res = resources[i];
                if (global.resource[res].display){
                    let gain = Math.rand(1,Math.round(global.resource[res].max / 4));
                    if (global.resource[res].amount + gain > global.resource[res].max){
                        global.resource[res].amount = global.resource[res].max;
                    }
                    else {
                        global.resource[res].amount += gain;
                    }
                }
            }
            return loc('event_ruins');
        }
    },
    tax_revolt: {
        reqs: {
            low_morale: 99,
            notrait: 'blissful',
            tech: 'primitive'
        },
        type: 'major',
        condition(){
            let threshold = global.civic.govern.type === 'oligarchy' ? 45 : 25;
            let aristoVal = govActive('aristocrat',2);
            if (aristoVal){
                threshold -= aristoVal;
            }
            return global.civic.taxes.tax_rate > threshold;
        },
        effect(){
            return tax_revolt();
        }
    },
    slave_death1: slaveLoss('major','death1'),
    slave_death2: slaveLoss('major','death2'),
    slave_death3: slaveLoss('major','death3'),
    protest: {
        reqs: {
            tech: 'primitive'
        },
        type: 'major',
        condition(){
            return global.civic.govern.type === 'republic' ? true : false;
        },
        effect(){
            global.civic.govern['protest'] = Math.rand(30,60);
            switch(Math.rand(0,10)){
                case 0:
                    return loc('event_protest0',[housingLabel('small')]);
                case 1:
                    return loc('event_protest1');
                case 2:
                    return loc('event_protest2');
                case 3:
                    global.civic.govern['protest'] = Math.rand(45,75);
                    return loc('event_protest3');
                case 4:
                    return loc('event_protest4');
                case 5:
                    global.civic.govern['protest'] = Math.rand(45,75);
                    return loc('event_protest5');
                case 6:
                    return loc('event_protest6');
                case 7:
                    return loc('event_protest7');
                case 8:
                    return loc('event_protest8');
                case 9:
                    global.civic.govern['protest'] = Math.rand(60,90);
                    return loc('event_protest9');
            }
        }
    },
    scandal: {
        reqs: {
            tech: 'govern'
        },
        type: 'major',
        condition(){
            return govActive('muckraker',0) ? true : false;
        },
        effect(){
            global.civic.govern['scandal'] = Math.rand(15,90);
            switch(Math.rand(0,10)){
                case 0:
                    return loc('event_scandal0');
                case 1:
                    return loc('event_scandal1');
                case 2:
                    return loc('event_scandal2');
                case 3:
                    return loc('event_scandal3');
                case 4:
                    return loc('event_scandal4');
                case 5:
                    return loc('event_scandal5');
                case 6:
                    return loc('event_scandal6');
                case 7:
                    return loc('event_scandal7');
                case 8:
                    return loc('event_scandal8');
                case 9:
                    return loc('event_scandal9');
            }
        }
    },
};
