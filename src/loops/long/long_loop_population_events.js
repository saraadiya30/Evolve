// Event populasi per detik: scavenger, homeless meninggalkan kota, unstable, dan blubber. Dulu bagian dari longLoop_s1.
import { global } from '../../core/vars.js';
import { traits } from '../../core/registries.js';
import { blubberFill } from '../../races/powers/psychic_powers.js';

export function longLoopPopulationEvents($ctx){
        if (global.city.ptrait.includes('trashed') || global.race['scavenger']){
            global.civic.scavenger.display = true;
        }
        else {
            global.civic.scavenger.display = false;
            global.civic.scavenger.workers = 0;
        }

        // Homeless
        if (global.civic.homeless > 0){
            let railway = global.arpa['railway'] ? global.arpa.railway.rank : 0;
            let abandon_odds = Math.floor(railway / (railway + 25) * 10);
            if (Math.rand(0,10) <= abandon_odds){
                global.civic.homeless--;
            }
        }

        if (global.race['unstable']){
            if (global.resource[global.race.species].amount > 0 && Math.rand(0,100) < traits.unstable.vars()[0]){
                let bound = Math.ceil((global.resource[global.race.species].amount ** 0.9) * traits.unstable.vars()[1] / 100);
                let died = Math.rand(0,bound);
                global.resource[global.race.species].amount -= died;
                if (global.resource[global.race.species].amount < 0){ global.resource[global.race.species].amount = 0; }
                global.stats.uDead += died;
            }
        }

        if (global.race['blubber'] && global.resource[global.race.species].amount >= 50){
            let oldAge = Math.rand(0,1 + Math.floor(global.resource[global.race.species].amount / 50));
            blubberFill(oldAge);
        }
}
