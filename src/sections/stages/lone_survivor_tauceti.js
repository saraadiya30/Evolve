// Struktur Tau Ceti dan sekuens ARPA awal skenario Lone Survivor.
import { global } from '../../core/vars.js';
import { initStruct } from '../../actions/core/structure_ui.js';
import { actions } from '../../core/registries.js';

export function loneSurvivorTauCeti($ctx){
        global.tauceti.orbital_station.count = 1; global.tauceti.orbital_station.on = 1;
        initStruct(actions.tauceti.tau_home.repository); global.tauceti.repository.count = 2;
        initStruct(actions.tauceti.tau_home.tauceti_casino);
        initStruct(actions.tauceti.tau_red.orbital_platform);

        global.space['ai_core'] = { count: 100 };
        global.space['ai_core2'] = { count: 0, on: 0 };
        global.space['m_relay'] = { count: 0, on: 0 };

        global.arpa['sequence'] = {
            max: 50000,
            progress: 0,
            time: 50000,
            on: true,
            boost: false,
            auto: false,
            labs: 0,
        };
}
