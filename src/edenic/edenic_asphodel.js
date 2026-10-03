import { edenicModules } from './edenic_registry.js';
import { edenAsphodel } from './edenic_registry2.js';
import { edenAsphodelPart1 } from './edn_asphodel_1.js';
import { edenAsphodelPart2 } from './edn_asphodel_2.js';
import { edenAsphodelPart3 } from './edn_asphodel_3.js';

// Region 'eden_asphodel' dari edenicModules (dipisah dari edenic.js). Urutan/isi entri sama persis; digabung di edenic.js.
Object.assign(edenAsphodel,
    edenAsphodelPart1,
    edenAsphodelPart2,
    edenAsphodelPart3
);
export { edenAsphodel };

