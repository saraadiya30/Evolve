import { actions } from './actions_registry.js';
import { actions_city } from './actions_registry.js';
import { actions_cityPart1 } from './ac_city_1.js';
import { actions_cityPart2 } from './ac_city_2.js';
import { actions_cityPart3 } from './ac_city_3.js';
import { actions_cityPart4 } from './ac_city_4.js';

// Region 'city' dari actions (dipisah dari actions.js). Isi sama persis; digabung via actions_registry.js di actions.js.
Object.assign(actions_city,
    actions_cityPart1,
    actions_cityPart2,
    actions_cityPart3,
    actions_cityPart4
);
export { actions_city };

