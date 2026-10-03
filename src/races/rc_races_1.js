import { loc } from '../core/locale.js';
import { altRace } from './race_helpers.js';
import { global } from '../core/vars.js';
import { foxColor, shellColor } from './races.js';

// Bagian dari races (22 entri: protoplasm .. dracnid), dipisah dari races.js. Urutan entri sama persis.
export const racesPart1 = {
    protoplasm: {
        name: loc('race_protoplasm'),
        desc: loc('race_protoplasm_desc'),
        type: 'organism',
        home: loc('race_prehistoric'),
        entity: loc('race_protoplasm_entity'),
        traits: {},
        solar: {
            red: loc('race_human_solar_red'),
            hell: loc('race_human_solar_hell'),
            gas: loc('race_human_solar_gas'),
            gas_moon: loc('race_human_solar_gas_moon'),
            dwarf: loc('race_human_solar_dwarf'),
        },
        fanaticism: 'none',
        basic(){ return false; }
    },
    human: {
        name: loc(altRace('human') ? 'race_zombie' : 'race_human'),
        desc: loc(altRace('human') ? 'race_zombie_desc' : 'race_human_desc'),
        type: 'humanoid',
        home: loc('race_human_home'),
        entity: loc('race_human_entity'),
        traits: {
            creative: 1,
            diverse: 1
        },
        solar: {
            red: loc(altRace('human') ? 'race_zombie_solar_red' : 'race_human_solar_red'),
            hell: loc(altRace('human') ? 'race_zombie_solar_hell' : 'race_human_solar_hell'),
            gas: loc(altRace('human') ? 'race_zombie_solar_gas' : 'race_human_solar_gas'),
            gas_moon: loc(altRace('human') ? 'race_zombie_solar_gas_moon' : 'race_human_solar_gas_moon'),
            dwarf: loc(altRace('human') ? 'race_zombie_solar_dwarf' : 'race_human_solar_dwarf'),
        },
        fanaticism: 'creative',
        basic(){ return true; }
    },
    elven: {
        name: loc('race_elven'),
        desc: loc(altRace('elven') ? 'race_xmas_elf_desc' : 'race_elven_desc'),
        type: 'humanoid',
        home: loc(altRace('elven') ? 'race_xmas_elf_home' : 'race_elven_home'),
        entity: altRace('elven') ? loc('race_xmas_elf_entity') : loc('race_elven_entity'),
        traits: {
            studious: 1,
            arrogant: 1
        },
        solar: {
            red: loc(altRace('elven') ? 'race_xmas_elf_solar_red' : 'race_elven_solar_red'),
            hell: loc(altRace('elven') ? 'race_xmas_elf_solar_hell' : 'race_elven_solar_hell'),
            gas: loc(altRace('elven') ? 'race_xmas_elf_solar_gas' : 'race_elven_solar_gas'),
            gas_moon: loc(altRace('elven') ? 'race_xmas_elf_solar_gas_moon' : 'race_elven_solar_gas_moon'),
            dwarf: loc(altRace('elven') ? 'race_xmas_elf_solar_dwarf' : 'race_elven_solar_dwarf'),
        },
        fanaticism: 'studious',
        basic(){ return true; }
    },
    orc: {
        name: loc('race_orc'),
        desc: loc('race_orc_desc'),
        type: 'humanoid',
        home: loc('race_orc_home'),
        entity: loc('race_orc_entity'),
        traits: {
            brute: 1,
            angry: 1
        },
        solar: {
            red: loc('race_orc_solar_red'),
            hell: loc('race_orc_solar_hell'),
            gas: loc('race_orc_solar_gas'),
            gas_moon: loc('race_orc_solar_gas_moon'),
            dwarf: loc('race_orc_solar_dwarf'),
        },
        fanaticism: 'brute',
        basic(){ return true; }
    },
    cath: {
        name: loc('race_cath'),
        desc: loc('race_cath_desc'),
        type: 'carnivore',
        home: loc('race_cath_home'),
        entity: loc('race_cath_entity'),
        traits: {
            lazy: 1,
            curious: 1
        },
        solar: {
            red: loc('race_cath_solar_red'),
            hell: loc('race_cath_solar_hell'),
            gas: loc('race_cath_solar_gas'),
            gas_moon: loc('race_cath_solar_gas_moon'),
            dwarf: loc('race_cath_solar_dwarf'),
        },
        fanaticism: 'curious',
        basic(){ return true; }
    },
    wolven: {
        name: altRace('wolven') ? loc('race_rabbit') : loc('race_wolven'),
        desc: altRace('wolven') ? loc('race_rabbit_desc') : loc('race_wolven_desc'),
        type: 'carnivore',
        home: altRace('wolven') ? loc('race_rabbit_home') : loc('race_wolven_home'),
        entity: altRace('wolven') ? loc('race_rabbit_entity') : loc('race_wolven_entity'),
        traits: {
            pack_mentality: 1,
            tracker: 1
        },
        solar: {
            red: altRace('wolven') ? loc('race_rabbit_solar_red') : loc('race_wolven_solar_red'),
            hell: altRace('wolven') ? loc('race_rabbit_solar_hell') : loc('race_wolven_solar_hell'),
            gas: altRace('wolven') ? loc('race_rabbit_solar_gas') : loc('race_wolven_solar_gas'),
            gas_moon: altRace('wolven') ? loc('race_rabbit_solar_gas_moon') : loc('race_wolven_solar_gas_moon'),
            dwarf: altRace('wolven') ? loc('race_rabbit_solar_dwarf') : loc('race_wolven_solar_dwarf'),
        },
        fanaticism: 'tracker',
        basic(){ return true; }
    },
    vulpine: {
        name: altRace('vulpine') ? loc('race_chocolate_rabbit') : (loc(global.race.universe === 'magic' ? 'race_kitsune' : 'race_vulpine')),
        desc(){ return altRace('vulpine') ? loc('race_chocolate_rabbit_desc') : (loc('race_vulpine_desc',[loc(global.race.universe === 'magic' ? 'race_kitsune' : 'race_vulpine'), foxColor()])); },
        type: 'carnivore',
        home: altRace('vulpine') ? loc('race_chocolate_rabbit_home') : loc('race_vulpine_home'),
        entity: altRace('vulpine') ? loc('race_chocolate_rabbit_entity') : loc('race_vulpine_entity'),
        traits: {
            playful: 1,
            freespirit: 1
        },
        solar: {
            red: altRace('vulpine') ? loc('race_chocolate_rabbit_solar_red') : loc('race_vulpine_solar_red'),
            hell: altRace('vulpine') ? loc('race_chocolate_rabbit_solar_hell') : loc('race_vulpine_solar_hell'),
            gas: altRace('vulpine') ? loc('race_chocolate_rabbit_solar_gas') : loc('race_vulpine_solar_gas'),
            gas_moon: altRace('vulpine') ? loc('race_chocolate_rabbit_solar_gas_moon') : loc('race_vulpine_solar_gas_moon'),
            dwarf: altRace('vulpine') ? loc('race_chocolate_rabbit_solar_dwarf') : loc('race_vulpine_solar_dwarf'),
        },
        fanaticism: 'playful',
        basic(){ return true; }
    },
    centaur: {
        name: loc(altRace('centaur') ? 'race_reindeer' : 'race_centaur'),
        desc: loc(altRace('centaur') ? 'race_reindeer_desc' : 'race_centaur_desc'),
        type: 'herbivore',
        home: loc(altRace('centaur') ? 'race_reindeer_home' : 'race_centaur_home'),
        entity: loc(altRace('centaur') ? 'race_reindeer_entity' : 'race_centaur_entity'),
        traits: {
            sniper: 1,
            hooved: 1
        },
        solar: {
            red: loc(altRace('centaur') ? 'race_reindeer_solar_red' : 'race_centaur_solar_red'),
            hell: loc(altRace('centaur') ? 'race_reindeer_solar_hell' : 'race_centaur_solar_hell'),
            gas: loc(altRace('centaur') ? 'race_reindeer_solar_gas' : 'race_centaur_solar_gas'),
            gas_moon: loc(altRace('centaur') ? 'race_reindeer_solar_gas_moon' : 'race_centaur_solar_gas_moon'),
            dwarf: loc(altRace('centaur') ? 'race_reindeer_solar_dwarf' : 'race_centaur_solar_dwarf'),
        },
        fanaticism: 'sniper',
        basic(){ return true; }
    },
    rhinotaur: {
        name: loc('race_rhinotaur'),
        desc: loc('race_rhinotaur_desc'),
        type: 'herbivore',
        home: loc('race_rhinotaur_home'),
        entity: loc('race_rhinotaur_entity'),
        traits: {
            rage: 1,
            heavy: 1
        },
        solar: {
            red: loc('race_rhinotaur_solar_red'),
            hell: loc('race_rhinotaur_solar_hell'),
            gas: loc('race_rhinotaur_solar_gas'),
            gas_moon: loc('race_rhinotaur_solar_gas_moon'),
            dwarf: loc('race_rhinotaur_solar_dwarf'),
        },
        fanaticism: 'rage',
        basic(){ return true; }
    },
    capybara: {
        name: loc(altRace('capybara') ? 'race_donkey' : 'race_capybara'),
        desc: loc(altRace('capybara') ? 'race_donkey_desc' : 'race_capybara_desc'),
        type: 'herbivore',
        home: loc(altRace('capybara') ? 'race_donkey_home' : 'race_capybara_home'),
        entity: loc(altRace('capybara') ? 'race_donkey_entity' : 'race_capybara_entity'),
        traits: {
            gnawer: 1,
            calm: 1
        },
        solar: {
            red: loc(altRace('capybara') ? 'race_donkey_solar_red' : 'race_capybara_solar_red'),
            hell: loc(altRace('capybara') ? 'race_donkey_solar_hell' : 'race_capybara_solar_hell'),
            gas: loc(altRace('capybara') ? 'race_donkey_solar_gas' : 'race_capybara_solar_gas'),
            gas_moon: loc(altRace('capybara') ? 'race_donkey_solar_gas_moon' : 'race_capybara_solar_gas_moon'),
            dwarf: loc(altRace('capybara') ? 'race_donkey_solar_dwarf' : 'race_capybara_solar_dwarf'),
        },
        fanaticism: 'calm',
        basic(){ return true; }
    },
    kobold: {
        name: loc('race_kobold'),
        desc: loc('race_kobold_desc'),
        type: 'small',
        home: loc('race_kobold_home'),
        entity: loc('race_kobold_entity'),
        traits: {
            pack_rat: 1,
            paranoid: 1
        },
        solar: {
            red: loc('race_kobold_solar_red'),
            hell: loc('race_kobold_solar_hell'),
            gas: loc('race_kobold_solar_gas'),
            gas_moon: loc('race_kobold_solar_gas_moon'),
            dwarf: loc('race_kobold_solar_dwarf'),
        },
        fanaticism: 'pack_rat',
        basic(){ return true; }
    },
    goblin: {
        name: loc('race_goblin'),
        desc: loc('race_goblin_desc'),
        type: 'small',
        home: loc('race_goblin_home'),
        entity: loc('race_goblin_entity'),
        traits: {
            greedy: 1,
            merchant: 1
        },
        solar: {
            red: loc('race_goblin_solar_red'),
            hell: loc('race_goblin_solar_hell'),
            gas: loc('race_goblin_solar_gas'),
            gas_moon: loc('race_goblin_solar_gas_moon'),
            dwarf: loc('race_goblin_solar_dwarf'),
        },
        fanaticism: 'merchant',
        basic(){ return true; }
    },
    gnome: {
        name: loc('race_gnome'),
        desc: loc('race_gnome_desc'),
        type: 'small',
        home: loc('race_gnome_home'),
        entity: loc('race_gnome_entity'),
        traits: {
            smart: 1,
            puny: 1
        },
        solar: {
            red: loc('race_gnome_solar_red'),
            hell: loc('race_gnome_solar_hell'),
            gas: loc('race_gnome_solar_gas'),
            gas_moon: loc('race_gnome_solar_gas_moon'),
            dwarf: loc('race_gnome_solar_dwarf'),
        },
        fanaticism: 'smart',
        basic(){ return true; }
    },
    ogre: {
        name: loc('race_ogre'),
        desc: loc('race_ogre_desc'),
        type: 'giant',
        home: loc('race_ogre_home'),
        entity: loc('race_ogre_entity'),
        traits: {
            dumb: 1,
            tough: 1
        },
        solar: {
            red: loc('race_ogre_solar_red'),
            hell: loc('race_ogre_solar_hell'),
            gas: loc('race_ogre_solar_gas'),
            gas_moon: loc('race_ogre_solar_gas_moon'),
            dwarf: loc('race_ogre_solar_dwarf'),
        },
        fanaticism: 'tough',
        basic(){ return true; }
    },
    cyclops: {
        name: loc('race_cyclops'),
        desc: loc('race_cyclops_desc'),
        type: 'giant',
        home: loc('race_cyclops_home'),
        entity: loc('race_cyclops_entity'),
        traits: {
            nearsighted: 1,
            intelligent: 1
        },
        solar: {
            red: loc('race_cyclops_solar_red'),
            hell: loc('race_cyclops_solar_hell'),
            gas: loc('race_cyclops_solar_gas'),
            gas_moon: loc('race_cyclops_solar_gas_moon'),
            dwarf: loc('race_cyclops_solar_dwarf'),
        },
        fanaticism: 'intelligent',
        basic(){ return true; }
    },
    troll: {
        name: loc('race_troll'),
        desc: loc('race_troll_desc'),
        type: 'giant',
        home: loc('race_troll_home'),
        entity: loc('race_troll_entity'),
        traits: {
            regenerative: 1,
            gluttony: 1
        },
        solar: {
            red: loc('race_troll_solar_red'),
            hell: loc('race_troll_solar_hell'),
            gas: loc('race_troll_solar_gas'),
            gas_moon: loc('race_troll_solar_gas_moon'),
            dwarf: loc('race_troll_solar_dwarf'),
        },
        fanaticism: 'regenerative',
        basic(){ return true; }
    },
    tortoisan: {
        name: loc(altRace('tortoisan') ? 'race_ninja_turtle' : 'race_tortoisan'),
        desc(){ return altRace('tortoisan') ? loc('race_ninja_turtle_desc',[shellColor()]) : loc('race_tortoisan_desc',[shellColor()]); },
        type: 'reptilian',
        home: loc(altRace('tortoisan') ? 'race_ninja_turtle_home' : 'race_tortoisan_home'),
        entity: loc(altRace('tortoisan') ? 'race_ninja_turtle_entity' : 'race_tortoisan_entity'),
        traits: {
            slow: 1,
            armored: 1
        },
        solar: {
            red: loc(altRace('tortoisan') ? 'race_ninja_turtle_solar_red' : 'race_tortoisan_solar_red'),
            hell: loc(altRace('tortoisan') ? 'race_ninja_turtle_solar_hell' : 'race_tortoisan_solar_hell'),
            gas: loc(altRace('tortoisan') ? 'race_ninja_turtle_solar_gas' : 'race_tortoisan_solar_gas'),
            gas_moon: loc(altRace('tortoisan') ? 'race_ninja_turtle_solar_gas_moon' : 'race_tortoisan_solar_gas_moon'),
            dwarf: loc(altRace('tortoisan') ? 'race_ninja_turtle_solar_dwarf' : 'race_tortoisan_solar_dwarf'),
        },
        fanaticism: 'armored',
        basic(){ return true; }
    },
    gecko: {
        name: loc('race_gecko'),
        desc: loc('race_gecko_desc'),
        type: 'reptilian',
        home: loc('race_gecko_home'),
        entity: loc('race_gecko_entity'),
        traits: {
            optimistic: 1,
            chameleon: 1
        },
        solar: {
            red: loc('race_gecko_solar_red'),
            hell: loc('race_gecko_solar_hell'),
            gas: loc('race_gecko_solar_gas'),
            gas_moon: loc('race_gecko_solar_gas_moon'),
            dwarf: loc('race_gecko_solar_dwarf'),
        },
        fanaticism: 'optimistic',
        basic(){ return true; }
    },
    slitheryn: {
        name: loc('race_slitheryn'),
        desc: loc('race_slitheryn_desc'),
        type: 'reptilian',
        home: loc('race_slitheryn_home'),
        entity: loc('race_slitheryn_entity'),
        traits: {
            astrologer: 1,
            hard_of_hearing: 1,
            slow_digestion: 1
        },
        solar: {
            red: loc('race_slitheryn_solar_red'),
            hell: loc('race_slitheryn_solar_hell'),
            gas: loc('race_slitheryn_solar_gas'),
            gas_moon: loc('race_slitheryn_solar_gas_moon'),
            dwarf: loc('race_slitheryn_solar_dwarf'),
        },
        fanaticism: 'astrologer',
        basic(){ return true; }
    },
    arraak: {
        name: loc(altRace('arraak') ? 'race_turkey' : 'race_arraak'),
        desc: loc(altRace('arraak') ? 'race_turkey_desc' : 'race_arraak_desc'),
        type: 'avian',
        home: loc(altRace('arraak') ? 'race_turkey_home' : 'race_arraak_home'),
        entity: altRace('arraak') ? loc('race_turkey_entity') : loc('race_arraak_entity'),
        traits: {
            resourceful: 1,
            selenophobia: 1
        },
        solar: {
            red: loc(altRace('arraak') ? 'race_turkey_solar_red' : 'race_arraak_solar_red'),
            hell: loc(altRace('arraak') ? 'race_turkey_solar_hell' : 'race_arraak_solar_hell'),
            gas: loc(altRace('arraak') ? 'race_turkey_solar_gas' : 'race_arraak_solar_gas'),
            gas_moon: loc(altRace('arraak') ? 'race_turkey_solar_gas_moon' : 'race_arraak_solar_gas_moon'),
            dwarf: loc(altRace('arraak') ? 'race_turkey_solar_dwarf' : 'race_arraak_solar_dwarf'),
        },
        fanaticism: 'resourceful',
        basic(){ return true; }
    },
    pterodacti: {
        name: loc('race_pterodacti'),
        desc: loc('race_pterodacti_desc'),
        type: 'avian',
        home: loc('race_pterodacti_home'),
        entity: loc('race_pterodacti_entity'),
        traits: {
            leathery: 1,
            pessimistic: 1
        },
        solar: {
            red: loc('race_pterodacti_solar_red'),
            hell: loc('race_pterodacti_solar_hell'),
            gas: loc('race_pterodacti_solar_gas'),
            gas_moon: loc('race_pterodacti_solar_gas_moon'),
            dwarf: loc('race_pterodacti_solar_dwarf'),
        },
        fanaticism: 'leathery',
        basic(){ return true; }
    },
    dracnid: {
        name: loc('race_dracnid'),
        desc: loc('race_dracnid_desc'),
        type: 'avian',
        home: loc('race_dracnid_home'),
        entity: loc('race_dracnid_entity'),
        traits: {
            hoarder: 1,
            solitary: 1
        },
        solar: {
            red: loc('race_dracnid_solar_red'),
            hell: loc('race_dracnid_solar_hell'),
            gas: loc('race_dracnid_solar_gas'),
            gas_moon: loc('race_dracnid_solar_gas_moon'),
            dwarf: loc('race_dracnid_solar_dwarf'),
        },
        fanaticism: 'hoarder',
        basic(){ return true; }
    },
};
