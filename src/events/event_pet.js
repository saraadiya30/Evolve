import { global } from '../core/vars.js';
import { loc } from '../core/locale.js';
import { drawPet } from '../functions/icons_easter_eggs.js';

// Bagian dari events (1 entri: pet .. pet), dipisah dari events.js. Urutan entri sama persis.
export const eventsPart3 = {
    pet: {
        reqs: {
            tech: 'primitive',
        },
        type: 'minor',
        effect(){
            if (global.race['pet']){
                global.race.pet.event += Math.rand(300,600);
                let interaction = Math.rand(0,10);
                return loc(`event_${global.race.pet.type}_interaction${interaction}`,[loc(`event_${global.race.pet.type}_name${global.race.pet.name}`)]);
            }
            else {
                let pet = global.race['catnip'] && global.race['catnip'] >= 1 ? 'cat' : (global.race['anise'] && global.race['anise'] >= 1 ? 'dog' : (Math.rand(0,2) === 0 ? 'cat' : 'dog'));
                global.race['pet'] = {
                    type: pet,
                    name: pet === 'cat' ? Math.rand(0,12) : Math.rand(0,10),
                    event: 0,
                    pet: 0
                };
                drawPet();
                return loc(`event_pet_${global.race.pet.type}`,[loc(`event_${global.race.pet.type}_name${global.race.pet.name}`)]);
            }
        }
    },
};
