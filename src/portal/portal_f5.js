import { clearElement, vBind, popover } from '../functions/functions.js';
import { loc } from '../core/locale.js';
import { global, spire_on, seededRandom } from '../core/vars.js';
import { monsters } from './portal_registry.js';
import { mechCost } from './portal_f3.js';

// Fungsi-fungsi dipindah dari portal.js (urutan sumber dipertahankan). portal.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function drawMechs(){
    clearMechDrag();
    clearElement($('#mechList'));
    let list = $('#mechList');

    list.append(`
      <div v-for="(mech, index) of mechs" :key="index" class="mechRow" :class="index < active ? '' : 'inactive-row' ">
        <a class="scrap" @click="scrap(index)" role="button">${loc(global.race['warlord'] ? 'portal_mech_unsummon' : 'portal_mech_scrap')}</a>
        <span> | </span><span>${loc(global.race['warlord'] ? 'portal_demon' : 'portal_mech')} #{{index + 1}}: </span>
        <span class="has-text-caution">{{ mech.infernal ? "${loc('portal_mech_infernal')} " : "" }}{{ mech | size }} {{ mech | chassis }}</span>
        <div :class="'gearList '+mech.size">
          <div>
            <template v-for="hp of mech.hardpoint">
              <span> | </span>
              <span class="has-text-danger">{{ hp | weapon }}</span>
            </template>
          </div>
        </div>
        <div :class="'gearList '+mech.size">
          <div>
            <template v-for="eq of mech.equip">
              <span> | </span>
              <span class="has-text-warning">{{ eq, mech.size | equipment }}</span>
            </template>
          </div>
        </div>
      </div>`);

    vBind({
        el: '#mechList',
        data: global.portal.mechbay,
        methods: {
            scrap(id){
                if (global.portal.mechbay.mechs[id]){
                    let costs = mechCost(global.portal.mechbay.mechs[id].size,global.portal.mechbay.mechs[id].infernal);
                    let size = mechSize(global.portal.mechbay.mechs[id].size);
                    global.portal.purifier.supply += Math.floor(costs.c / 3);
                    global.resource.Soul_Gem.amount += Math.floor(costs.s / 2);

                    if (global.portal.purifier.supply > global.portal.purifier.sup_max){
                        global.portal.purifier.supply = global.portal.purifier.sup_max;
                    }
                    global.portal.mechbay.mechs.splice(id,1);
                    global.portal.mechbay.bay -= size;
                    global.portal.mechbay.active--;
                }
            }
        },
        filters: {
            equipment(e,size){
                if (e !== 'special'){
                    return loc(`portal_mech_equip_${e}`);
                }
                let type = 'jumpjet';
                switch (size){
                    case 'large':
                    case 'cyberdemon':
                        type = 'battery';
                        break;
                    case 'titan':
                        type = 'target';
                        break;
                }
                return loc(`portal_mech_equip_${type}`);
            },
            weapon(hp) {
                return loc(`portal_mech_weapon_${hp}`);
            },
            size(m) {
                return loc(`portal_mech_size_${m.size}`);
            },
            chassis(m) {
                return loc(`portal_mech_chassis_${m.chassis}`);
            }
        }
    });

    dragMechList();

    $(`#mechList .scrap`).each(function(i, node){
        popover(`mechList-scrap${i}`, function(){
            let costs = mechCost(global.portal.mechbay.mechs[i].size,global.portal.mechbay.mechs[i].infernal);
            return loc(`portal_mech_scrap_refund`,[Math.floor(costs.c / 3),Math.floor(costs.s / 2)]);
        },
        {
            elm: node,
        });
    });
}

export function mechSize(s){
    switch (s){
        case 'minion':
            return 1;
        case 'small':
            return 2;
        case 'fiend':
            return global.blood['prepared'] && global.blood.prepared >= 2 ? 3 : 4;
        case 'medium':
            return global.blood['prepared'] && global.blood.prepared >= 2 ? 4 : 5;
        case 'cyberdemon':
            return global.blood['prepared'] && global.blood.prepared >= 2 ? 6 : 8;
        case 'large':
            return global.blood['prepared'] && global.blood.prepared >= 2 ? 8 : 10;
        case 'archfiend':
            return global.blood['prepared'] && global.blood.prepared >= 2 ? 15 : 20;
        case 'titan':
            return global.blood['prepared'] && global.blood.prepared >= 2 ? 20 : 25;
        case 'collector':
            return 1;
        case 'default':
            return 25;
    }
}

export function clearMechDrag(){
    let el = $('#mechList')[0];
    if (el){
        let sort = Sortable.get(el);
        if (sort){
            sort.destroy();
        }
    }
}

export function dragMechList(){
    let el = $('#mechList')[0];
    Sortable.create(el,{
        onEnd(e){
            let items = e.from.querySelectorAll(':scope > .mechRow');
            e.from.insertBefore(e.item, items[e.oldIndex + (e.oldIndex > e.newIndex)]);

            let order = global.portal.mechbay.mechs;
            order.splice(e.newDraggableIndex, 0, order.splice(e.oldDraggableIndex, 1)[0]);
            updateMechbay();
        }
    });
}

export function updateMechbay(){
    let max = (spire_on['mechbay'] || 0) * 25;
    let bay = 0;
    let active = 0;
    let scouts = 0;
    for (let mech of global.portal.mechbay.mechs) {
        bay += mechSize(mech.size);
        if (bay <= max){
            active++;
            if (mech.size === 'small' || mech.size === 'minion') {
                scouts++;
            }
            if (mech.equip.includes('scouter')){
                scouts++;
            }
        }
    }
    global.portal.mechbay.bay = bay;
    global.portal.mechbay.max = max;
    global.portal.mechbay.active = active;
    global.portal.mechbay.scouts = scouts;
}

export function genSpireFloor(){
    let types = ['sand','swamp','forest','jungle','rocky','gravel','muddy','grass','brush','concrete'];
    global.portal.spire.type = types[Math.floor(seededRandom(0,types.length))];
    if (global.portal.spire.count >= 10){
        global.portal.spire.status = {};
        let effects = ['freeze','hot','corrosive','humid','windy','hilly','mountain','radioactive','quake','dust','river','tar','steam','flooded','fog','rain','hail','chasm','dark','gravity'];
        assignValidStatus(effects[Math.floor(seededRandom(0,effects.length))]);
        
        if (global.portal.spire.count >= 25 && global.portal.spire.count <= 100){
            let odds = 105 - global.portal.spire.count;
            if (Math.floor(seededRandom(0,odds) <= 5)){
                assignValidStatus(effects[Math.floor(seededRandom(0,effects.length))]);
            }
        }
        else if (global.portal.spire.count > 100 && global.portal.spire.count <= 250){
            assignValidStatus(effects[Math.floor(seededRandom(0,effects.length))]);
            let odds = 260 - global.portal.spire.count;
            if (Math.floor(seededRandom(0,odds) <= 10)){
                assignValidStatus(effects[Math.floor(seededRandom(0,effects.length))]);
            }
        }
        else if (global.portal.spire.count > 250 && global.portal.spire.count <= 1000){
            assignValidStatus(effects[Math.floor(seededRandom(0,effects.length))]);
            assignValidStatus(effects[Math.floor(seededRandom(0,effects.length))]);
            let odds = 1025 - global.portal.spire.count;
            if (Math.floor(seededRandom(0,odds) <= 25)){
                assignValidStatus(effects[Math.floor(seededRandom(0,effects.length))]);
            }
        }
        else if (global.portal.spire.count > 1000){
            assignValidStatus(effects[Math.floor(seededRandom(0,effects.length))]);
            assignValidStatus(effects[Math.floor(seededRandom(0,effects.length))]);
            assignValidStatus(effects[Math.floor(seededRandom(0,effects.length))]);
        }
    }

    let mobs = Object.keys(monsters).filter(function (k){
        let exclude = Object.keys(monsters[k].nozone);
        if (exclude.some(i => Object.keys(global.portal.spire.status).includes(i)) || exclude.includes(global.portal.spire.type)){
            return false;
        }
        return true;
    });
    global.portal.spire.boss = mobs[Math.floor(seededRandom(0,mobs.length))];
}

export function assignValidStatus(effect){
    if (global.portal.spire.status['freeze'] || global.portal.spire.status['hot']){
        if (effect !== 'freeze' && effect !== 'hot'){
            global.portal.spire.status[effect] = true;
        }
    }
    else if (global.portal.spire.status['rain'] || global.portal.spire.status['hail']){
        if (effect !== 'rain' && effect !== 'hail'){
            global.portal.spire.status[effect] = true;
        }
    }
    else {
        global.portal.spire.status[effect] = true;
    }
}

export function terrainRating(mech,rating,effects){
    if (mech.equip.includes('special') && (mech.size === 'small' || mech.size === 'medium' || mech.size === 'collector')){
        if (rating < 1){
            rating += (1 - rating) * (effects.includes('gravity') ? 0.1 : 0.2);
        }
    }
    if (mech.size !== 'small' && rating < 1){
        rating += (effects.includes('fog') || effects.includes('dark') ? 0.005 : 0.01) * global.portal.mechbay.scouts;
        if (rating > 1){
            rating = 1;
        }
    }
    return rating;
}

export function weaponPower(mech,power){
    if (power < 1 && power !== 0){
        if (mech.equip.includes('special') && mech.size === 'titan'){
            power += (1 - power) * 0.25;
        }
    }
    if (mech.equip.includes('special') && (mech.size === 'large' || mech.size === 'cyberdemon')){
        power *= 1.02;
    }
    return power;
}

export function statusEffect(mech,effect){
    let rating = 1;
    switch (effect){
        case 'freeze':
            {
                if (!mech.equip.includes('radiator') && !mech.equip.includes('cold')){
                    rating = 0.25;
                }
            }
            break;
        case 'hot':
            {
                if (!mech.equip.includes('coolant') && !mech.equip.includes('heat')){
                    rating = 0.25;
                }
            }
            break;
        case 'corrosive':
            {
                if (!mech.equip.includes('ablative')){
                    if (mech.equip.includes('stoneskin')){
                        rating = 0.9;
                    }
                    else if (mech.equip.includes('shields')){
                        rating = 0.75;
                    }
                    else {
                        rating = mech.equip.includes('manashield') ? 0.5 : 0.25;
                    }
                }
            }
            break;
        case 'humid':
            {
                if (!mech.equip.includes('seals')){
                    rating = mech.equip.includes('heat') ? 0.85 : 0.75;
                }
            }
            break;
        case 'windy':
            {
                if (['hover','flying_imp','harpy','dragon'].includes(mech.chassis)){
                    rating = 0.5;
                }
            }
            break;
        case 'hilly':
            {
                if (!['spider','flying_imp','harpy','dragon'].includes(mech.chassis)){
                    rating = 0.75;
                }
            }
            break;
        case 'mountain':
            {
                if (mech.chassis !== 'spider' && !mech.equip.includes('grapple')){
                    rating = mech.equip.includes('flare') || mech.equip.includes('echo') ? 0.75 : 0.5;
                }
            }
            break;
        case 'radioactive':
            {
                if (!mech.equip.includes('shields') && !mech.equip.includes('manashield')){
                    rating = 0.5;
                }
            }
            break;
        case 'quake':
            {
                if (!mech.equip.includes('stabilizer')){
                    rating = mech.equip.includes('athletic') ? 0.75 : 0.25;
                }
            }
            break;
        case 'dust':
            {
                if (!mech.equip.includes('seals') && !mech.equip.includes('thermal')){
                    rating = 0.5;
                }
            }
            break;
        case 'river':
            {
                if (!['hover','flying_imp','harpy','dragon'].includes(mech.chassis)){
                    rating = 0.65;
                }
            }
            break;
        case 'tar':
            {
                if (mech.chassis !== 'quad'){
                    rating = mech.chassis === 'tread' || mech.chassis === 'wheel' ? 0.5 : 0.75;
                }
            }
            break;
        case 'steam':
            {
                if (!mech.equip.includes('shields') && !mech.equip.includes('heat')){
                    rating = 0.75;
                }
            }
            break;
        case 'flooded':
            {
                if (mech.chassis !== 'hover'){
                    rating = ['snake'].includes(mech.chassis) ? 0.85 : 0.35;
                }
            }
            break;
        case 'fog':
            {
                if (!mech.equip.includes('sonar') && !mech.equip.includes('echo')){
                    rating = 0.2;
                }
            }
            break;
        case 'rain':
            {
                if (!mech.equip.includes('seals')){
                    rating = mech.equip.includes('cold') ? 0.9 : 0.75;
                }
            }
            break;
        case 'hail':
            {
                if (!mech.equip.includes('ablative') && !mech.equip.includes('shields') && !mech.equip.includes('manashield') && !mech.equip.includes('stoneskin')){
                    rating = 0.75;
                }
            }
            break;
        case 'chasm':
            {
                if (!mech.equip.includes('grapple') && !['flying_imp','harpy','dragon'].includes(mech.chassis)){
                    rating = mech.equip.includes('athletic') ? 0.35 : 0.1;
                }
            }
            break;
        case 'dark':
            {
                if (!mech.equip.includes('infrared') && !mech.equip.includes('darkvision')){
                    rating = mech.equip.includes('flare') ? 0.25 : 0.1;
                }
            }
            break;
        case 'gravity':
            {
                switch (mech.size){
                    case 'fiend':
                    case 'medium':
                        rating = 0.8;
                        break;
                    case 'cyberdemon':
                        rating = 0.5;
                        break;
                    case 'large':
                        rating = 0.45;
                        break;
                    case 'archfiend':
                        rating = 0.35;
                        break;
                    case 'titan':
                        rating = 0.25;
                        break;
                }
                if (['flying_imp','harpy','dragon'].includes(mech.chassis)){
                    rating -= 0.15;
                }
                if (mech.equip.includes('athletic') && rating < 1){
                    rating += 0.1;
                }
            }
            break;
    }
    if (mech.equip.includes('lucky')){
        rating += 0.01 * Math.floor(seededRandom(1,10,false, global.stats.reset + (global.portal?.spire?.count || 1) * 42 ));
        if (rating > 1){ rating = 1; }
    }
    return rating;
}

export function terrainEffect(mech,type){
    let terrain = type || global.portal.spire.type;
    let terrainFactor = 1;
    switch (mech.chassis){
        case 'wheel':
        case 'nightmare':
        case 'hound':
            {
                switch (terrain){
                    case 'sand':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.9 : 0.85;
                        break;
                    case 'swamp':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.35 : 0.18;
                        break;
                    case 'jungle':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.92 : 0.85;
                        break;
                    case 'rocky':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.65 : 0.5;
                        break;
                    case 'gravel':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 1 : 0.95;
                        break;
                    case 'muddy':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.85 : 0.58;
                        break;
                    case 'grass':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 1.3 : 1.2;
                        break;
                    case 'brush':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.9 : 0.8;
                        break;
                    case 'concrete':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 1.1 : 1;
                        break;
                }
            }
            break;
        case 'tread':
        case 'rakshasa':
        case 'harpy':
        case 'dragon':
            {
                switch (terrain){
                    case 'sand':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 1.15 : 1.1;
                        break;
                    case 'swamp':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.55 : 0.4;
                        break;
                    case 'forest':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 1 : 0.95;
                        break;
                    case 'jungle':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.95 : 0.9;
                        break;
                    case 'rocky':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.65 : 0.5;
                        break;
                    case 'gravel':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 1.3 : 1.2;
                        break;
                    case 'muddy':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.88 : 0.72;
                        break;
                }
            }
            break;
        case 'cambion':
        case 'biped':
        case 'imp':
        case 'gorgon':
            {
                switch (terrain){
                    case 'sand':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.78 : 0.65;
                        break;
                    case 'swamp':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.68 : 0.5;
                        break;
                    case 'forest':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 1 : 0.95;
                        break;
                    case 'jungle':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.82 : 0.7;
                        break;
                    case 'rocky':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.48 : 0.4;
                        break;
                    case 'muddy':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.85 : 0.7;
                        break;
                    case 'grass':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 1.25 : 1.2;
                        break;
                    case 'brush':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.92 : 0.85;
                        break;
                }
            }
            break;
        case 'quad':
        case 'golem':
        case 'barghest':
            {
                switch (terrain){
                    case 'sand':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.86 : 0.75;
                        break;
                    case 'swamp':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.58 : 0.42;
                        break;
                    case 'forest':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 1.25 : 1.2;
                        break;
                    case 'rocky':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.95 : 0.9;
                        break;
                    case 'gravel':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.9 : 0.8;
                        break;
                    case 'muddy':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.68 : 0.5;
                        break;
                    case 'grass':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 1 : 0.95;
                        break;
                    case 'brush':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.95 : 0.9;
                        break;
                }
            }
            break;
        case 'spider':
        case 'minotaur':
        case 'hydra':
            {
                switch (terrain){
                    case 'sand':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.75 : 0.65;
                        break;
                    case 'swamp':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.9 : 0.78;
                        break;
                    case 'forest':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.82 : 0.75;
                        break;
                    case 'jungle':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.77 : 0.65;
                        break;
                    case 'rocky':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 1.25 : 1.2;
                        break;
                    case 'gravel':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.86 : 0.75;
                        break;
                    case 'muddy':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.92 : 0.82;
                        break;
                    case 'brush':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 1 : 0.95;
                        break;
                }
            }
            break;
        case 'hover':
        case 'flying_imp':
        case 'snake':
            {
                switch (terrain){
                    case 'swamp':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 1.35 : 1.2;
                        break;
                    case 'forest':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.65 : 0.48;
                        break;
                    case 'jungle':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.55 : 0.35;
                        break;
                    case 'rocky':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.82 : 0.68;
                        break;
                    case 'muddy':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 1.15 : 1.08;
                        break;
                    case 'brush':
                        terrainFactor = ['small','medium','minion','fiend'].includes(mech.size) ? 0.78 : 0.7;
                        break;
                }
            }
            break;
    }
    return terrainFactor;
}

export function mechCollect(mech){
    let rating = mech.infernal ? 31.25 : 25;
    let terrainFactor = terrainEffect(mech);
    let effects = [];
    Object.keys(global.portal.spire.status).forEach(function(effect){
        effects.push(effect);
        rating *= statusEffect(mech,effect);
    });
    rating *= terrainRating(mech,terrainFactor,effects);
    if (global.race['warlord']){
        rating *= 0.1;
    }
    return rating;
}
