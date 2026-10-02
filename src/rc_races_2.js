import { loc } from './locale.js';
import { altRace } from './race_helpers.js';
import { global } from './vars.js';
import { races } from './races_registry.js';

// Bagian dari races (24 entri: entish .. synth), dipisah dari races.js. Urutan entri sama persis.
export const racesPart2 = {
    entish: {
        name: loc(altRace('entish') ? 'race_spruce' : 'race_entish'),
        desc: loc(altRace('entish') ? 'race_spruce_desc' : 'race_entish_desc'),
        type: 'plant',
        home: loc(altRace('entish') ? 'race_spruce_home' : 'race_entish_home'),
        entity: loc(altRace('entish') ? 'race_spruce_entity' : 'race_entish_entity'),
        traits: {
            kindling_kindred: 1,
            pyrophobia: 1,
            catnip: 1
        },
        solar: {
            red: loc(altRace('entish') ? 'race_spruce_solar_red' : 'race_entish_solar_red'),
            hell: loc(altRace('entish') ? 'race_spruce_solar_hell' : 'race_entish_solar_hell'),
            gas: loc(altRace('entish') ? 'race_spruce_solar_gas' : 'race_entish_solar_gas'),
            gas_moon: loc(altRace('entish') ? 'race_spruce_solar_gas_moon' : 'race_entish_solar_gas_moon'),
            dwarf: loc(altRace('entish') ? 'race_spruce_solar_dwarf' : 'race_entish_solar_dwarf'),
        },
        fanaticism: 'kindling_kindred',
        basic(){ return true; }
    },
    cacti: {
        name: loc('race_cacti'),
        desc: loc('race_cacti_desc'),
        type: 'plant',
        home: loc('race_cacti_home'),
        entity: loc('race_cacti_entity'),
        traits: {
            hyper: 1,
            skittish: 1
        },
        solar: {
            red: loc('race_cacti_solar_red'),
            hell: loc('race_cacti_solar_hell'),
            gas: loc('race_cacti_solar_gas'),
            gas_moon: loc('race_cacti_solar_gas_moon'),
            dwarf: loc('race_cacti_solar_dwarf'),
        },
        fanaticism: 'hyper',
        basic(){ return true; }
    },
    pinguicula: {
        name: loc('race_pinguicula'),
        desc: loc('race_pinguicula_desc'),
        type: 'plant',
        home: loc('race_pinguicula_home'),
        entity: loc('race_pinguicula_entity'),
        traits: {
            fragrant: 1,
            sticky: 1,
            anise: 1
        },
        solar: {
            red: loc('race_pinguicula_solar_red'),
            hell: loc('race_pinguicula_solar_hell'),
            gas: loc('race_pinguicula_solar_gas'),
            gas_moon: loc('race_pinguicula_solar_gas_moon'),
            dwarf: loc('race_pinguicula_solar_dwarf'),
        },
        fanaticism: 'sticky',
        basic(){ return true; }
    },
    sporgar: {
        name: loc('race_sporgar'),
        desc: loc('race_sporgar_desc'),
        type: 'fungi',
        home: loc('race_sporgar_home'),
        entity: loc('race_sporgar_entity'),
        traits: {
            infectious: 1,
            parasite: 1
        },
        solar: {
            red: loc('race_sporgar_solar_red'),
            hell: loc('race_sporgar_solar_hell'),
            gas: loc('race_sporgar_solar_gas'),
            gas_moon: loc('race_sporgar_solar_gas_moon'),
            dwarf: loc('race_sporgar_solar_dwarf'),
        },
        fanaticism: 'infectious',
        basic(){ return false; }
    },
    shroomi: {
        name: loc('race_shroomi'),
        desc: loc('race_shroomi_desc'),
        type: 'fungi',
        home: loc('race_shroomi_home'),
        entity: loc('race_shroomi_entity'),
        traits: {
            toxic: 1,
            nyctophilia: 1
        },
        solar: {
            red: loc('race_shroomi_solar_red'),
            hell: loc('race_shroomi_solar_hell'),
            gas: loc('race_shroomi_solar_gas'),
            gas_moon: loc('race_shroomi_solar_gas_moon'),
            dwarf: loc('race_shroomi_solar_dwarf'),
        },
        fanaticism: 'toxic',
        basic(){ return true; }
    },
    moldling: {
        name: loc('race_moldling'),
        desc: loc('race_moldling_desc'),
        type: 'fungi',
        home: loc('race_moldling_home'),
        entity: loc('race_moldling_entity'),
        traits: {
            infiltrator: 1,
            hibernator: 1
        },
        solar: {
            red: loc('race_moldling_solar_red'),
            hell: loc('race_moldling_solar_hell'),
            gas: loc('race_moldling_solar_gas'),
            gas_moon: loc('race_moldling_solar_gas_moon'),
            dwarf: loc('race_moldling_solar_dwarf'),
        },
        fanaticism: 'infiltrator',
        basic(){ return true; }
    },
    mantis: {
        name: loc('race_mantis'),
        desc: loc('race_mantis_desc'),
        type: 'insectoid',
        home: loc('race_mantis_home'),
        entity: loc('race_mantis_entity'),
        traits: {
            cannibalize: 1,
            malnutrition: 1
        },
        solar: {
            red: loc('race_mantis_solar_red'),
            hell: loc('race_mantis_solar_hell'),
            gas: loc('race_mantis_solar_gas'),
            gas_moon: loc('race_mantis_solar_gas_moon'),
            dwarf: loc('race_mantis_solar_dwarf'),
        },
        fanaticism: 'cannibalize',
        basic(){ return true; }
    },
    scorpid: {
        name: loc('race_scorpid'),
        desc: loc('race_scorpid_desc'),
        type: 'insectoid',
        home: loc('race_scorpid_home'),
        entity: loc('race_scorpid_entity'),
        traits: {
            claws: 1,
            atrophy: 1
        },
        solar: {
            red: loc('race_scorpid_solar_red'),
            hell: loc('race_scorpid_solar_hell'),
            gas: loc('race_scorpid_solar_gas'),
            gas_moon: loc('race_scorpid_solar_gas_moon'),
            dwarf: loc('race_scorpid_solar_dwarf'),
        },
        fanaticism: 'claws',
        basic(){ return true; }
    },
    antid: {
        name: loc('race_antid'),
        desc: loc('race_antid_desc'),
        type: 'insectoid',
        home: loc('race_antid_home'),
        entity: loc('race_antid_entity'),
        traits: {
            hivemind: 1,
            tunneler: 1
        },
        solar: {
            red: loc('race_antid_solar_red'),
            hell: loc('race_antid_solar_hell'),
            gas: loc('race_antid_solar_gas'),
            gas_moon: loc('race_antid_solar_gas_moon'),
            dwarf: loc('race_antid_solar_dwarf'),
        },
        fanaticism: 'hivemind',
        basic(){ return true; }
    },
    sharkin: {
        name: loc('race_sharkin'),
        desc: loc('race_sharkin_desc'),
        type: 'aquatic',
        home: loc('race_sharkin_home'),
        entity: loc('race_sharkin_entity'),
        traits: {
            blood_thirst: 1,
            apex_predator: 1
        },
        solar: {
            red: loc('race_sharkin_solar_red'),
            hell: loc('race_sharkin_solar_hell'),
            gas: loc('race_sharkin_solar_gas'),
            gas_moon: loc('race_sharkin_solar_gas_moon'),
            dwarf: loc('race_sharkin_solar_dwarf'),
        },
        fanaticism: 'blood_thirst',
        basic(){ return ['oceanic','swamp'].includes(global.city.biome) ? true : false; }
    },
    octigoran: {
        name: loc('race_octigoran'),
        desc: loc('race_octigoran_desc'),
        type: 'aquatic',
        home: loc('race_octigoran_home'),
        entity: loc('race_octigoran_entity'),
        traits: {
            invertebrate: 1,
            suction_grip: 1
        },
        solar: {
            red: loc('race_octigoran_solar_red'),
            hell: loc('race_octigoran_solar_hell'),
            gas: loc('race_octigoran_solar_gas'),
            gas_moon: loc('race_octigoran_solar_gas_moon'),
            dwarf: loc('race_octigoran_solar_dwarf'),
        },
        fanaticism: 'suction_grip',
        basic(){ return ['oceanic','swamp'].includes(global.city.biome) ? true : false; }
    },
    dryad: {
        name: loc('race_dryad'),
        desc: loc('race_dryad_desc'),
        type: 'fey',
        home: loc('race_dryad_home'),
        entity: loc('race_dryad_entity'),
        traits: {
            befuddle: 1,
            environmentalist: 1,
            kindling_kindred: 1
        },
        solar: {
            red: loc('race_dryad_solar_red'),
            hell: loc('race_dryad_solar_hell'),
            gas: loc('race_dryad_solar_gas'),
            gas_moon: loc('race_dryad_solar_gas_moon'),
            dwarf: loc('race_dryad_solar_dwarf'),
        },
        fanaticism: 'befuddle',
        basic(){ return ['forest','swamp','taiga'].includes(global.city.biome) ? true : false; }
    },
    satyr: {
        name: loc('race_satyr'),
        desc: loc('race_satyr_desc'),
        type: 'fey',
        home: loc('race_satyr_home'),
        entity: loc('race_satyr_entity'),
        traits: {
            unorganized: 1,
            musical: 1
        },
        solar: {
            red: loc('race_satyr_solar_red'),
            hell: loc('race_satyr_solar_hell'),
            gas: loc('race_satyr_solar_gas'),
            gas_moon: loc('race_satyr_solar_gas_moon'),
            dwarf: loc('race_satyr_solar_dwarf'),
        },
        fanaticism: 'musical',
        basic(){ return ['forest','swamp','taiga'].includes(global.city.biome) ? true : false; }
    },
    phoenix: {
        name: loc('race_phoenix'),
        desc: loc('race_phoenix_desc'),
        type: 'heat',
        home: loc('race_phoenix_home'),
        entity: loc('race_phoenix_entity'),
        traits: {
            revive: 1,
            slow_regen: 1
        },
        solar: {
            red: loc('race_phoenix_solar_red'),
            hell: loc('race_phoenix_solar_hell'),
            gas: loc('race_phoenix_solar_gas'),
            gas_moon: loc('race_phoenix_solar_gas_moon'),
            dwarf: loc('race_phoenix_solar_dwarf'),
        },
        fanaticism: 'revive',
        basic(){ return ['volcanic','ashland'].includes(global.city.biome) ? true : false; }
    },
    salamander: {
        name: loc('race_salamander'),
        desc: loc('race_salamander_desc'),
        type: 'heat',
        home: loc('race_salamander_home'),
        entity: loc('race_salamander_entity'),
        traits: {
            forge: 1,
            autoignition: 1
        },
        solar: {
            red: loc('race_salamander_solar_red'),
            hell: loc('race_salamander_solar_hell'),
            gas: loc('race_salamander_solar_gas'),
            gas_moon: loc('race_salamander_solar_gas_moon'),
            dwarf: loc('race_salamander_solar_dwarf'),
        },
        fanaticism: 'forge',
        basic(){ return ['volcanic','ashland'].includes(global.city.biome) ? true : false; }
    },
    yeti: {
        name: loc(altRace('yeti') ? 'race_snowman' : 'race_yeti'),
        desc: loc(altRace('yeti') ? 'race_snowman_desc' : 'race_yeti_desc'),
        type: 'polar',
        home: loc(altRace('yeti') ? 'race_snowman_home' : 'race_yeti_home'),
        entity: loc(altRace('yeti') ? 'race_snowman_entity' : 'race_yeti_entity'),
        traits: {
            blurry: 1,
            snowy: 1
        },
        solar: {
            red: loc(altRace('yeti') ? 'race_snowman_solar_red' : 'race_yeti_solar_red'),
            hell: loc(altRace('yeti') ? 'race_snowman_solar_hell' : 'race_yeti_solar_hell'),
            gas: loc(altRace('yeti') ? 'race_snowman_solar_gas' : 'race_yeti_solar_gas'),
            gas_moon: loc(altRace('yeti') ? 'race_snowman_solar_gas_moon' : 'race_yeti_solar_gas_moon'),
            dwarf: loc(altRace('yeti') ? 'race_snowman_solar_dwarf' : 'race_yeti_solar_dwarf'),
        },
        fanaticism: 'blurry',
        basic(){ return ['tundra','taiga'].includes(global.city.biome) ? true : false; }
    },
    wendigo: {
        name: loc(altRace('wendigo') ? 'race_krampus' : 'race_wendigo'),
        desc: loc(altRace('wendigo') ? 'race_krampus_desc' : 'race_wendigo_desc'),
        type: 'polar',
        home: loc(altRace('wendigo') ? 'race_krampus_home' : 'race_wendigo_home'),
        entity: loc(altRace('wendigo') ? 'race_krampus_entity' : 'race_wendigo_entity'),
        traits: {
            ravenous: 1,
            ghostly: 1,
            soul_eater: 1
        },
        solar: {
            red: loc(altRace('wendigo') ? 'race_krampus_solar_red' : 'race_wendigo_solar_red'),
            hell: loc(altRace('wendigo') ? 'race_krampus_solar_hell' : 'race_wendigo_solar_hell'),
            gas: loc(altRace('wendigo') ? 'race_krampus_solar_gas' : 'race_wendigo_solar_gas'),
            gas_moon: loc(altRace('wendigo') ? 'race_krampus_solar_gas_moon' : 'race_wendigo_solar_gas_moon'),
            dwarf: loc(altRace('wendigo') ? 'race_krampus_solar_dwarf' : 'race_wendigo_solar_dwarf'),
        },
        fanaticism: 'ghostly',
        basic(){ return ['tundra','taiga'].includes(global.city.biome) ? true : false; }
    },
    tuskin: {
        name: loc('race_tuskin'),
        desc: loc('race_tuskin_desc'),
        type: 'sand',
        home: loc('race_tuskin_home'),
        entity: loc('race_tuskin_entity'),
        traits: {
            lawless: 1,
            mistrustful: 1
        },
        solar: {
            red: loc('race_tuskin_solar_red'),
            hell: loc('race_tuskin_solar_hell'),
            gas: loc('race_tuskin_solar_gas'),
            gas_moon: loc('race_tuskin_solar_gas_moon'),
            dwarf: loc('race_tuskin_solar_dwarf'),
        },
        fanaticism: 'lawless',
        basic(){ return ['desert','ashland'].includes(global.city.biome) ? true : false; }
    },
    kamel: {
        name: loc('race_kamel'),
        desc: loc('race_kamel_desc'),
        type: 'sand',
        home: loc('race_kamel_home'),
        entity: loc('race_kamel_entity'),
        traits: {
            humpback: 1,
            unfavored: 1
        },
        solar: {
            red: loc('race_kamel_solar_red'),
            hell: loc('race_kamel_solar_hell'),
            gas: loc('race_kamel_solar_gas'),
            gas_moon: loc('race_kamel_solar_gas_moon'),
            dwarf: loc('race_kamel_solar_dwarf')
        },
        fanaticism: 'humpback',
        basic(){ return ['desert','ashland'].includes(global.city.biome) ? true : false; }
    },
    balorg: {
        name: loc('race_balorg'),
        desc: loc('race_balorg_desc'),
        type: 'demonic',
        home: loc('race_balorg_home'),
        entity: loc('race_balorg_entity'),
        traits: {
            fiery: 1,
            terrifying: 1,
            slaver: 1
        },
        solar: {
            red: loc('race_balorg_solar_red'),
            hell: loc('race_balorg_solar_hell'),
            gas: loc('race_balorg_solar_gas'),
            gas_moon: loc('race_balorg_solar_gas_moon'),
            dwarf: loc('race_balorg_solar_dwarf'),
        },
        fanaticism: 'fiery',
        basic(){ return global.city.biome === 'hellscape' ? true : false; }
    },
    imp: {
        name: loc('race_imp'),
        desc: loc('race_imp_desc'),
        type: 'demonic',
        home: loc('race_imp_home'),
        entity: loc('race_imp_entity'),
        traits: {
            compact: 1,
            conniving: 1,
            pathetic: 1,
        },
        solar: {
            red: loc('race_imp_solar_red'),
            hell: loc('race_imp_solar_hell'),
            gas: loc('race_imp_solar_gas'),
            gas_moon: loc('race_imp_solar_gas_moon'),
            dwarf: loc('race_imp_solar_dwarf'),
        },
        fanaticism: 'conniving',
        basic(){ return global.city.biome === 'hellscape' ? true : false; }
    },
    seraph: {
        name: loc(altRace('seraph') ? 'race_cherub' : 'race_seraph'),
        desc: loc(altRace('seraph') ? 'race_cherub_desc' : 'race_seraph_desc'),
        type: 'angelic',
        home: loc(altRace('seraph') ? 'race_cherub_home' : 'race_seraph_home'),
        entity: loc(altRace('seraph') ? 'race_cherub_entity' : 'race_seraph_entity'),
        traits: {
            unified: 1,
            spiritual: 1,
            truthful: 1
        },
        solar: {
            red: loc(altRace('seraph') ? 'race_cherub_solar_red' : 'race_seraph_solar_red'),
            hell: loc(altRace('seraph') ? 'race_cherub_solar_hell' : 'race_seraph_solar_hell'),
            gas: loc(altRace('seraph') ? 'race_cherub_solar_gas' : 'race_seraph_solar_gas'),
            gas_moon: loc(altRace('seraph') ? 'race_cherub_solar_gas_moon' : 'race_seraph_solar_gas_moon'),
            dwarf: loc(altRace('seraph') ? 'race_cherub_solar_dwarf' : 'race_seraph_solar_dwarf'),
        },
        fanaticism: 'spiritual',
        basic(){ return global.city.biome === 'eden' ? true : false; }
    },
    unicorn: {
        name: loc(altRace('unicorn') ? 'race_emocorn' : 'race_unicorn'),
        desc: loc(altRace('unicorn') ? 'race_emocorn_desc' : 'race_unicorn_desc'),
        type: 'angelic',
        home: loc(altRace('unicorn') ? 'race_emocorn_home' : 'race_unicorn_home'),
        entity: loc(altRace('unicorn') ? 'race_emocorn_entity' : 'race_unicorn_entity'),
        traits: {
            rainbow: 1,
            magnificent: 1,
            noble: 1,
        },
        solar: {
            red: loc(altRace('unicorn') ? 'race_emocorn_solar_red' : 'race_unicorn_solar_red'),
            hell: loc(altRace('unicorn') ? 'race_emocorn_solar_hell' : 'race_unicorn_solar_hell'),
            gas: loc(altRace('unicorn') ? 'race_emocorn_solar_gas' : 'race_unicorn_solar_gas'),
            gas_moon: loc(altRace('unicorn') ? 'race_emocorn_solar_gas_moon' : 'race_unicorn_solar_gas_moon'),
            dwarf: loc(altRace('unicorn') ? 'race_emocorn_solar_dwarf' : 'race_unicorn_solar_dwarf'),
        },
        fanaticism: 'magnificent',
        basic(){ return global.city.biome === 'eden' ? true : false; }
    },
    synth: {
        name: loc('race_synth'),
        desc(){
            let race = global.race.hasOwnProperty('srace') ? global.race.srace : 'human';
            return loc('race_synth_desc',[races[race].name]);
        },
        type: 'synthetic',
        home: loc('race_synth_home'),
        entity: loc('race_synth_entity'),
        traits: {
            imitation: 1,
            emotionless: 1,
            logical: 1
        },
        solar: {
            red: loc('race_synth_solar_red'),
            hell: loc('race_synth_solar_hell'),
            gas: loc('race_synth_solar_gas'),
            gas_moon: loc('race_synth_solar_gas_moon'),
            dwarf: loc('race_synth_solar_dwarf'),
        },
        fanaticism: 'logical',
        basic(){ return false; }
    },
};
