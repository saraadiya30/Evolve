import { set_alevel, set_ulevel } from '../core/vars.js';
import { flib } from '../functions/run_stats_helpers.js';
import { loc } from '../core/locale.js'
import { perkList } from '../core/registries.js';
import { perkListPart1 } from './perks/mastery_to_escape_velocity.js';
import { perkListPart2 } from './perks/endless_hunger_to_blood.js';
import { perkListPart3 } from './perks/spire_to_grandmaster.js';
import { universeLevel } from './universe_level.js';
import { achievements } from '../core/registries.js';

const achieve_list = {
    misc: [
        'apocalypse','ascended','dreaded','anarchist','second_evolution','blackhole','warmonger',
        'red_tactics','pacifist','neutralized','paradise','scrooge','madagascar_tree','godwin',
        'laser_shark','infested','mass_starvation','colonist','world_domination','illuminati',
        'syndicate','cult_of_personality','doomed','pandemonium','blood_war','landfill','seeder',
        'miners_dream','shaken','blacken_the_sun','trade','resonance','enlightenment','gladiator',
        'corrupted','red_dead','godslayer','traitor','doppelganger'
    ],
    species: [
        'mass_extinction','extinct_human','extinct_elven','extinct_orc','extinct_cath','extinct_wolven','extinct_vulpine','extinct_centaur',
        'extinct_rhinotaur','extinct_capybara','extinct_kobold','extinct_goblin',
        //'extinct_rhinotaur','extinct_capybara','extinct_bearkin','extinct_porkenari','extinct_hedgeoken','extinct_kobold','extinct_goblin',
        'extinct_gnome','extinct_ogre','extinct_cyclops','extinct_troll','extinct_tortoisan','extinct_gecko','extinct_slitheryn',
        'extinct_arraak','extinct_pterodacti','extinct_dracnid','extinct_entish','extinct_cacti','extinct_pinguicula','extinct_sporgar',
        'extinct_shroomi','extinct_moldling','extinct_mantis','extinct_scorpid','extinct_antid','extinct_sharkin','extinct_octigoran','extinct_dryad',
        'extinct_satyr','extinct_phoenix','extinct_salamander','extinct_yeti','extinct_wendigo','extinct_tuskin','extinct_kamel','extinct_balorg',
        'extinct_imp','extinct_seraph','extinct_unicorn','extinct_synth','extinct_nano','extinct_ghast','extinct_shoggoth','extinct_dwarf',
        'extinct_raccoon','extinct_lichen','extinct_wyvern','extinct_beholder','extinct_djinn','extinct_narwhal','extinct_bombardier','extinct_nephilim',
        'extinct_junker','extinct_sludge','extinct_ultra_sludge','extinct_custom','extinct_hybrid'
    ],
    genus: [
        'creator','genus_humanoid','genus_carnivore','genus_herbivore','genus_small','genus_giant','genus_reptilian','genus_avian',
        //'creator','genus_humanoid','genus_carnivore','genus_omnivore','genus_herbivore','genus_small','genus_giant','genus_reptilian','genus_avian',
        'genus_insectoid','genus_plant','genus_fungi','genus_aquatic','genus_fey','genus_heat','genus_polar','genus_sand','genus_demonic','genus_angelic',
        'genus_synthetic','genus_eldritch'
    ],
    planet: [
        'explorer','biome_grassland','biome_oceanic','biome_forest','biome_desert','biome_volcanic','biome_tundra',
        'biome_savanna','biome_swamp','biome_ashland','biome_taiga','biome_hellscape','biome_eden',
        'atmo_toxic','atmo_mellow','atmo_rage','atmo_stormy','atmo_ozone','atmo_magnetic','atmo_trashed','atmo_elliptical','atmo_flare','atmo_dense',
        'atmo_unstable','atmo_permafrost','atmo_retrograde','atmo_kamikaze'
    ],
    universe: [
        'vigilante','squished','double_density','cross','macro','marble','heavyweight','whitehole','heavy','canceled',
        'eviltwin','microbang','pw_apocalypse','fullmetal','pass','soul_sponge','nightmare','escape_velocity','what_is_best'
    ],
    challenge: [
        'joyless','steelen','dissipated','technophobe','wheelbarrow','iron_will','failed_history','banana','pathfinder',
        'ashanddust','exodus','obsolete','bluepill','retired','gross','lamentis','overlord',`adam_eve`,'endless_hunger'
    ],
};

const descData = {
    trade: [750,50]
};

export { perkList };

// Registrasi eksplisit: dipanggil dari core/register_all.js.
export function registerAchievements(){
    // flib('name') butuh races yang sudah terdaftar, jadi dihitung di sini, bukan saat modul dimuat.
    const flairData = {
        colonist: [flib('name')]
    };

    Object.keys(achieve_list).forEach(function(type){
        achieve_list[type].forEach(achieve => achievements[achieve] = {
            name: loc(`achieve_${achieve}_name`),
            desc: descData[achieve] ? loc(`achieve_${achieve}_desc`,descData[achieve]) : loc(`achieve_${achieve}_desc`),
            flair: flairData[achieve] ? loc(`achieve_${achieve}_flair`,flairData[achieve]) : loc(`achieve_${achieve}_flair`),
            type: type
        });
    });
    {
        let al = universeLevel();
        set_alevel(al.aLvl);
        set_ulevel(al.uLvl);
    }
    Object.assign(perkList,
        perkListPart1,
        perkListPart2,
        perkListPart3
    );
}
