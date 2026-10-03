import { set_alevel, set_ulevel } from '../core/vars.js';
import { flib } from '../functions/functions.js';
import { loc } from '../core/locale.js'
import { perkList } from './perks/registry.js';
import { perkListPart1 } from './perks/mastery_to_escape_velocity.js';
import { perkListPart2 } from './perks/endless_hunger_to_blood.js';
import { perkListPart3 } from './perks/spire_to_grandmaster.js';
import { universeLevel } from './achievement_unlock_check_and_draw.js';
export { universeLevel, universeAffix, unlockAchieve, unlockFeat, setupStats, drawAchieve, challengeIcon, alevel, checkAchievements, checkAdept, checkBigAchievement, checkBigAchievementUniverse, drawPerks } from './achievement_unlock_check_and_draw.js';
export { drawStats } from './stats_panel_draw.js';

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

const flairData = {
    colonist: [flib('name')]
};

const descData = {
    trade: [750,50]
};

export const achievements = {};
Object.keys(achieve_list).forEach(function(type){
    achieve_list[type].forEach(achieve => achievements[achieve] = {
        name: loc(`achieve_${achieve}_name`),
        desc: descData[achieve] ? loc(`achieve_${achieve}_desc`,descData[achieve]) : loc(`achieve_${achieve}_desc`),
        flair: flairData[achieve] ? loc(`achieve_${achieve}_flair`,flairData[achieve]) : loc(`achieve_${achieve}_flair`),
        type: type
    });
});

export const feats = {
    utopia: {
        name: loc("feat_utopia_name"),
        desc: loc("feat_utopia_desc"),
        flair: loc("feat_utopia_flair")
    },
    take_no_advice: {
        name: loc("feat_take_no_advice_name"),
        desc: loc("feat_take_no_advice_desc"),
        flair: loc("feat_take_no_advice_flair")
    },
    ill_advised: {
        name: loc("feat_ill_advised_name"),
        desc: loc("feat_ill_advised_desc"),
        flair: loc("feat_ill_advised_flair")
    },
    organ_harvester: {
        name: loc("feat_organ_harvester_name"),
        desc: loc("feat_organ_harvester_desc"),
        flair: loc("feat_organ_harvester_flair")
    },
    the_misery: {
        name: loc("feat_the_misery_name"),
        desc: loc("feat_the_misery_desc"),
        flair: loc("feat_the_misery_flair")
    },
    energetic: {
        name: loc("feat_energetic_name"),
        desc: loc("feat_energetic_desc"),
        flair: loc("feat_energetic_flair")
    },
    garbage_pie: {
        name: loc("feat_garbage_pie_name"),
        desc: loc("feat_garbage_pie_desc"),
        flair: loc("feat_garbage_pie_flair")
    },
    finish_line: {
        name: loc("feat_finish_line_name"),
        desc: loc("feat_finish_line_desc"),
        flair: loc("feat_finish_line_flair")
    },
    blank_slate: {
        name: loc("feat_blank_slate_name"),
        desc: loc("feat_blank_slate_desc"),
        flair: loc("feat_blank_slate_flair")
    },
    supermassive: {
        name: loc("feat_supermassive_name"),
        desc: loc("feat_supermassive_desc"),
        flair: loc("feat_supermassive_flair")
    },
    steelem: {
        name: loc("feat_steelem_name"),
        desc: loc("feat_steelem_desc"),
        flair: loc("feat_steelem_flair")
    },
    banana: {
        name: loc("feat_banana_name"),
        desc: loc("feat_banana_desc",[500,500]),
        flair: loc("feat_banana_flair")
    },
    rocky_road: {
        name: loc("feat_rocky_road_name"),
        desc: loc("feat_rocky_road_desc"),
        flair: loc("feat_rocky_road_flair")
    },
    demon_slayer: {
        name: loc("feat_demon_slayer_name"),
        desc: loc("feat_demon_slayer_desc"),
        flair: loc("feat_demon_slayer_flair")
    },
    equilibrium: {
        name: loc("feat_equilibrium_name"),
        desc: loc("feat_equilibrium_desc"),
        flair: loc("feat_equilibrium_flair")
    },
    planned_obsolescence: {
        name: loc("feat_planned_obsolescence_name"),
        desc: loc("feat_planned_obsolescence_desc"),
        flair: loc("feat_planned_obsolescence_flair")
    },
    digital_ascension: {
        name: loc("feat_digital_ascension_name"),
        desc: loc("feat_digital_ascension_desc"),
        flair: loc("feat_digital_ascension_flair")
    },
    grand_death_tour: {
        name: loc("feat_grand_death_tour_name"),
        desc: loc("feat_grand_death_tour_desc",[6]),
        flair: loc("feat_grand_death_tour_flair")
    },
    novice: {
        name: loc("feat_novice_name"),
        desc: loc("feat_achievement_hunter_desc",[10]),
        flair: loc("feat_novice_flair")
    },
    journeyman: {
        name: loc("feat_journeyman_name"),
        desc: loc("feat_achievement_hunter_desc",[25]),
        flair: loc("feat_journeyman_flair")
    },
    adept: {
        name: loc("feat_adept_name"),
        desc: loc("feat_achievement_hunter_desc",[50]),
        flair: loc("feat_adept_flair")
    },
    master: {
        name: loc("feat_master_name"),
        desc: loc("feat_achievement_hunter_desc",[75]),
        flair: loc("feat_master_flair")
    },
    grandmaster: {
        name: loc("feat_grandmaster_name"),
        desc: loc("feat_achievement_hunter_desc",[100]),
        flair: loc("feat_grandmaster_flair")
    },
    god: {
        name: loc("feat_god_name"),
        desc: loc("feat_achievement_hunter_desc",[150]),
        flair: loc("feat_god_flair")
    },
    nephilim: {
        name: loc("feat_nephilim_name"),
        desc: loc("feat_nephilim_desc"),
        flair: loc("feat_nephilim_flair")
    },
    twisted: {
        name: loc("feat_twisted_name"),
        desc: loc("feat_twisted_desc"),
        flair: loc("feat_twisted_flair")
    },
    slime_lord: {
        name: loc("feat_slime_lord_name"),
        desc: loc("feat_slime_lord_desc"),
        flair: loc("feat_slime_lord_flair")
    },
    annihilation: {
        name: loc("feat_annihilation_name"),
        desc: loc("feat_annihilation_desc"),
        flair: loc("feat_annihilation_flair")
    },
    immortal:{
        name: loc("feat_immortal_name"),
        desc: loc("feat_immortal_desc"),
        flair: loc("feat_immortal_flair")
    },
    wish: {
        name: loc("feat_wish_name"),
        desc: loc("feat_wish_desc"),
        flair: loc("feat_wish_flair")
    },
    friday: {
        name: loc("feat_friday_name"),
        desc: loc("feat_friday_desc"),
        flair: loc("feat_friday_flair")
    },
    valentine: {
        name: loc("feat_love_name"),
        desc: loc("feat_love_desc"),
        flair: loc("feat_love_flair")
    },
    leprechaun: {
        name: loc("feat_leprechaun_name"),
        desc: loc("feat_leprechaun_desc"),
        flair: loc("feat_leprechaun_flair")
    },
    easter: {
        name: loc("feat_easter_name"),
        desc: loc("feat_easter_desc"),
        flair: loc("feat_easter_flair")
    },
    egghunt: {
        name: loc("feat_egghunt_name"),
        desc: loc("feat_egghunt_desc"),
        flair: loc("feat_egghunt_flair")
    },
    launch_day: {
        name: loc("feat_launch_day_name"),
        desc: loc("feat_launch_day_desc"),
        flair: loc("feat_launch_day_flair")
    },
    solstice: {
        name: loc("feat_solstice_name"),
        desc: loc("feat_solstice_desc"),
        flair: loc("feat_solstice_flair")
    },
    firework: {
        name: loc("feat_firework_name"),
        desc: loc("feat_firework_desc"),
        flair: loc("feat_firework_flair")
    },
    halloween: {
        name: loc("feat_boo_name"),
        desc: loc("feat_boo_desc"),
        flair: loc("feat_boo_flair")
    },
    trickortreat: {
        name: loc("feat_trickortreat_name"),
        desc: loc("feat_trickortreat_desc"),
        flair: loc("feat_trickortreat_flair")
    },
    thanksgiving: {
        name: loc("feat_gobble_gobble_name"),
        desc: loc("feat_gobble_gobble_desc"),
        flair: loc("feat_gobble_gobble_flair")
    },
    xmas: {
        name: loc("feat_xmas_name"),
        desc: loc("feat_xmas_desc"),
        flair: loc("feat_xmas_flair")
    },
    fool: {
        name: loc("feat_fool_name"),
        desc: loc("feat_fool_desc"),
        flair: loc("feat_fool_flair")
    }
}

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
export { perkList };
