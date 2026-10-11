// clearSpyopDrag / removeTask / genGovernor: utilitas governor. Modul daun (core, registries, gov_men), dipisah dari governor.js supaya draw_govern_office_parts dan structure_ui tidak menyeret seluruh governor.
import { global, seededRandom } from '../core/vars.js';
import { races } from '../core/registries.js';
import { gmen } from './gov_men.js';
import { loc } from '../core/locale.js';

export function clearSpyopDrag(){
    Object.keys(global.civic.foreign).forEach(function (gov){
        let el = $(`#spyopConfig${gov}`)[0];
        if (el){
            let sort = Sortable.get(el);
            if (sort){
                sort.destroy();
            }
        }
    });
}

export function removeTask(task){
    if (global.genes['governor'] && global.tech['governor'] && global.race['governor'] && global.race.governor['g'] && global.race.governor['tasks']){
        for (let i=0; i<Object.keys(global.race.governor.tasks).length; i++){
            if (global.race.governor.tasks[`t${i}`] === task){
                global.race.governor.tasks[`t${i}`] = 'none';
            }
        }
    }
}

export const names = {
    humanoid: ['Sanders','Smith','Geddon','Burgundy','Cristo','Crunch','Berg','Morros','Bower','Maximus'],
    carnivore: ['Instinct','Prowl','Paws','Fluffy','Snarl','Claws','Fang','Stalker','Pounce','Sniff'],
    herbivore: ['Sense','Grazer','Paws','Fluffy','Fern','Claws','Fang','Grass','Stampy','Sniff'],
    omnivore: ['Pelt','Munchy','Paws','Fluffy','Snarl','Claws','Fang','Skavers','Pounce','Sniff'],
    small: ['Bahgins','Banks','Shorty','Parte','Underfoot','Shrimp','Finkle','Littlefoot','Cub','Runt'],
    giant: ['Slender','Titan','Colossus','Bean','Tower','Cloud','Bigfoot','Mountain','Crusher','Megaton'],
    reptilian: ['Scale','Chimera','Ecto','Bask','Forks','Croc','Slither','Sunny','Coldfoot','Webtoe'],
    avian: ['Sparrow','Soar','Shiney','Raven','Squaks','Eddy','Breeze','Flap','Kettle','Flock'],
    insectoid: ['Compound','Centi','Hiver','Buzz','Carpace','Swarm','Devour','Carpi','Chitter','Burrow'],
    plant: ['Grover','Blossom','Leaf','Sapper','Stem','Seed','Sprout','Greensly','Root','Fruit'],
    fungi: ['Detritus','Psychedelic','Cap','Rotface','Patch','Spore','Infecto','Filament','Symbiote','Shade'],
    aquatic: ['Seawolf','Finsley','Inko','Sucker','McBoatFace','Wave','Riptide','Shell','Coral','Pearl'],
    fey: ['Whisper','Prank','Mischief','Flutter','Nature','Dirt','Story','Booker','Tales','Spirit'],
    heat: ['Ash','Magnus','Pumice','Vulcano','Sweat','Flame','Lava','Ember','Smoke','Tinder','Spark'],
    polar: ['Frosty','Snowball','Flake','Chiller','Frost','Cooler','Icecube','Arctic','Tundra','Avalanche'],
    sand: ['Dune','Oasis','Sarlac','Spice','Quick','Grain','Spike','Storm','Glass','Castle'],
    demonic: ['Yekun','Kesabel','Gadreel','Penemue','Abaddon','Azazyel','Leviathan','Samyaza','Kasyade','Typhon'],
    angelic: ['Lightbringer','Illuminous','Sparks','Chrub','Halo','Star','Pompous','Radiant','Fluffy','Fabio'],
    synthetic: ['HK47','D2R2','Bishop','Wally','Number5','Sunny','Data','Beta','Dot','Motoko'],
    eldritch: ['Tentacle','Faceless','Horror','Darkness','Void','Dreamer','Mindflayer','Whisper','Paranoia','Empty'],
};

export function genGovernor(setSize){
    let governors = [];
    let genus = global.race.maintype || races[global.race.species].type;
    let backgrounds = Object.keys(gmen);
    let nameList = JSON.parse(JSON.stringify(names[genus]));

    setSize = setSize || backgrounds.length;
    for (let i=0; i<setSize; i++){
        if (nameList.length === 0){
            nameList = JSON.parse(JSON.stringify(names[genus]));
        }
        if (backgrounds.length === 0){
            backgrounds = Object.keys(gmen);
        }

        let bgIdx = Math.floor(seededRandom(0,backgrounds.length));
        let nameIdx = Math.floor(seededRandom(0,nameList.length));

        let bg = backgrounds.splice(bgIdx,1)[0];
        let name = loc("gov_name_" + nameList.splice(nameIdx,1)[0]);

        let title = gmen[bg].title[Math.floor(seededRandom(0,gmen[bg].title.length))];
        if (typeof title === 'object'){
            title = Math.floor(seededRandom(0,2)) === 0 ? title.m : title.f;
        }
        governors.push({ bg: bg, t: title, n: name });
    }
    
    return governors;
}
