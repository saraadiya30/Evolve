import { actions_city } from '../core/registry.js';
import { actions_cityPart1 } from './gift_to_farm.js';
import { actions_cityPart2 } from './compost_to_rock_quarry.js';
import { actions_cityPart3 } from './cement_plant_to_meditation.js';
import { actions_cityPart4 } from './banquet_to_replicator.js';

// Region 'city' dari actions (dipisah dari actions.js). Isi sama persis; digabung via registry.js di actions.js.
Object.assign(actions_city,
    actions_cityPart1,
    actions_cityPart2,
    actions_cityPart3,
    actions_cityPart4
);
export { actions_city };

