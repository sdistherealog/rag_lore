module.exports={
    //WIKI_SOURCES define the most possible urls where we get all the information for the rag to answers questions on lore of the video game
    WIKI_SOURCES: {
    "Elden Ring": [
      "https://eldenring.fandom.com/wiki/Marika_the_Eternal",
      "https://eldenring.fandom.com/wiki/Radagon_of_the_Golden_Order",
      "https://eldenring.fandom.com/wiki/Malenia,_Blade_of_Miquella",
      "https://eldenring.fandom.com/wiki/Miquella",
      "https://eldenring.fandom.com/wiki/Godfrey",
      "https://eldenring.fandom.com/wiki/Rennala,_Queen_of_the_Full_Moon",
      "https://eldenring.fandom.com/wiki/Ranni_the_Witch",
      "https://eldenring.fandom.com/wiki/Maliketh,_the_Black_Blade",
      "https://eldenring.fandom.com/wiki/Mohg,_Lord_of_Blood",
      "https://eldenring.fandom.com/wiki/Starscourge_Radahn",
      "https://eldenring.fandom.com/wiki/The_Greater_Will",
      "https://eldenring.fandom.com/wiki/Erdtree",
      "https://eldenring.fandom.com/wiki/Golden_Order",
      "https://eldenring.fandom.com/wiki/Shattering",
      "https://eldenring.fandom.com/wiki/Roundtable_Hold"
    ],

    "The Legend of Zelda": [
      "https://zelda.fandom.com/wiki/Link",
      "https://zelda.fandom.com/wiki/Princess_Zelda",
      "https://zelda.fandom.com/wiki/Ganon",
      "https://zelda.fandom.com/wiki/Ganondorf",
      "https://zelda.fandom.com/wiki/Master_Sword",
      "https://zelda.fandom.com/wiki/Triforce",
      "https://zelda.fandom.com/wiki/Hyrule",
      "https://zelda.fandom.com/wiki/Hylia",
      "https://zelda.fandom.com/wiki/Sheikah",
      "https://zelda.fandom.com/wiki/Calamity_Ganon",
      "https://zelda.fandom.com/wiki/Tears_of_the_Kingdom",
      "https://zelda.fandom.com/wiki/Breath_of_the_Wild"
    ],

    "God of War": [
      "https://godofwar.fandom.com/wiki/Kratos",
      "https://godofwar.fandom.com/wiki/Atreus",
      "https://godofwar.fandom.com/wiki/Odin",
      "https://godofwar.fandom.com/wiki/Thor",
      "https://godofwar.fandom.com/wiki/Freya",
      "https://godofwar.fandom.com/wiki/Tyr",
      "https://godofwar.fandom.com/wiki/Brok",
      "https://godofwar.fandom.com/wiki/Sindri",
      "https://godofwar.fandom.com/wiki/Ragnar%C3%B6k",
      "https://godofwar.fandom.com/wiki/Yggdrasil"
    ],

    "Dark Souls": [
      "https://darksouls.fandom.com/wiki/Gwyn,_Lord_of_Cinder",
      "https://darksouls.fandom.com/wiki/Artorias_the_Abysswalker",
      "https://darksouls.fandom.com/wiki/Solaire_of_Astora",
      "https://darksouls.fandom.com/wiki/Chosen_Undead",
      "https://darksouls.fandom.com/wiki/Abyss",
      "https://darksouls.fandom.com/wiki/Age_of_Fire",
      "https://darksouls.fandom.com/wiki/First_Flame",
      "https://darksouls.fandom.com/wiki/Anor_Londo"
    ],

    "Bloodborne": [
      "https://bloodborne.fandom.com/wiki/Hunter",
      "https://bloodborne.fandom.com/wiki/Gehrman",
      "https://bloodborne.fandom.com/wiki/Lady_Maria",
      "https://bloodborne.fandom.com/wiki/Moon_Presence",
      "https://bloodborne.fandom.com/wiki/The_Hunt",
      "https://bloodborne.fandom.com/wiki/Great_Ones",
      "https://bloodborne.fandom.com/wiki/Yharnam"
    ],

    "The Witcher": [
      "https://witcher.fandom.com/wiki/Geralt_of_Rivia",
      "https://witcher.fandom.com/wiki/Ciri",
      "https://witcher.fandom.com/wiki/Yennefer_of_Vengerberg",
      "https://witcher.fandom.com/wiki/Triss_Merigold",
      "https://witcher.fandom.com/wiki/Wild_Hunt",
      "https://witcher.fandom.com/wiki/Kaer_Morhen"
    ],

    "Cyberpunk 2077": [
      "https://cyberpunk.fandom.com/wiki/V_(2077)",
      "https://cyberpunk.fandom.com/wiki/Johnny_Silverhand",
      "https://cyberpunk.fandom.com/wiki/Arasaka",
      "https://cyberpunk.fandom.com/wiki/Night_City",
      "https://cyberpunk.fandom.com/wiki/Relic",
      "https://cyberpunk.fandom.com/wiki/Adam_Smasher"
    ],

    "Mass Effect": [
      "https://masseffect.fandom.com/wiki/Commander_Shepard",
      "https://masseffect.fandom.com/wiki/Reapers",
      "https://masseffect.fandom.com/wiki/Citadel",
      "https://masseffect.fandom.com/wiki/Liara_T%27Soni",
      "https://masseffect.fandom.com/wiki/Garrus_Vakarian",
      "https://masseffect.fandom.com/wiki/Illusive_Man"
    ],

    "Halo": [
      "https://halo.fandom.com/wiki/Master_Chief_Petty_Officer_John-117",
      "https://halo.fandom.com/wiki/Cortana",
      "https://halo.fandom.com/wiki/Forerunner",
      "https://halo.fandom.com/wiki/Halo_Array",
      "https://halo.fandom.com/wiki/Covenant",
      "https://halo.fandom.com/wiki/Flood"
    ],

    "Skyrim": [
      "https://elderscrolls.fandom.com/wiki/Dragonborn",
      "https://elderscrolls.fandom.com/wiki/Alduin",
      "https://elderscrolls.fandom.com/wiki/Daedric_Princes",
      "https://elderscrolls.fandom.com/wiki/Talos",
      "https://elderscrolls.fandom.com/wiki/College_of_Winterhold",
      "https://elderscrolls.fandom.com/wiki/Thieves_Guild"
    ]
  },
    //This is the directory for storing raw data
    RAW_DATA_DIR:"data/raw",
    //This is where vector index and metadata is stored
    INDEX_DIR:"data/index",
    INDEX_FILE:"data/index/lore_index.json",
   //describing the chunk size and its overlap for rag
    CHUNK_SIZE:800,
    CHUNK_OVERLAP:150,
    //embedding model that runs locally via xenova/transformers
    EMBEDDING_MODEL:"Xenova/all-MiniLM-L6-v2",
    //number of chunks to retrieve per query
    TOP_K:10,
    //claude model declaration
    CLAUDE_MODEL:"calude-sonnet-4-6",
    //delay time for scraping wiki pages
    REQUEST_DELAY_MS:15000,
};