// FAQ, errata and designer answers, reworded and grouped by topic.
// Sources: the BGG wiki FAQ for the first edition, and answers from
// Maximilian Lichtner in the BGG forums. src: 'faq' | 'designer' | 'errata' | 'house'.

export const FAQ_SOURCES = {
  faq: { label: 'BGG FAQ', title: 'From the FAQ on the BoardGameGeek wiki (first edition)' },
  designer: { label: 'Designer', title: 'Answered by Maximilian Lichtner on the BoardGameGeek forums' },
  errata: { label: 'Errata', title: 'Official correction' },
  house: { label: 'House rule', title: 'Optional rule suggested by the designers, not part of the rules' }
};

export const FAQ_LINKS = {
  wiki: 'https://boardgamegeek.com/boardgame/406977/under-our-sun/wiki',
  downloads: 'https://tabletopper.games/downloads/',
  combatVideo: 'https://www.youtube.com/watch?v=X60KFsNKy2g'
};

export const FAQ_TOPICS = [
  { id: 'actions', label: 'Actions and abilities' },
  { id: 'combat', label: 'Combat' },
  { id: 'stealth', label: 'Stealth' },
  { id: 'enemies', label: 'Enemies' },
  { id: 'day', label: 'Day phases' },
  { id: 'items', label: 'Items and resources' },
  { id: 'merchant', label: 'Merchants' },
  { id: 'traitor', label: 'Traitor mode' },
  { id: 'missions', label: 'Missions' },
  { id: 'house', label: 'House rules' },
  { id: 'errata', label: 'Errata' }
];

export const FAQ = [
  // actions
  { id: 'karma', topic: 'actions', src: 'faq', q: 'How do karma dice work?',
    a: 'After any roll on your turn, spend one karma die for each die you want to reroll. Example: you roll 4 dice and get 1 success, so you spend 3 karma dice to reroll the other 3.\n- A rerolled die cannot be rerolled again.\n- You can also spend karma on enemy rolls and event rolls.\n- Karma only works on your own turn, once per roll.' },
  { id: 'act-enemy', topic: 'actions', src: 'faq', q: 'Can I take other actions while an enemy is on my map tile?',
    a: 'Yes, but every action you take there makes every enemy on the tile attack you. The one exception is **Wait**, which does not trigger a counterattack.' },
  { id: 'infiltrator', topic: 'actions', src: 'faq', q: 'When does the Infiltrator announce her ability?',
    a: 'She can name the enemy type at any point in the game, even after an enemy has already been revealed.' },
  { id: 'scout', topic: 'actions', src: 'faq', q: 'Does the Scout\'s extra green die apply to every Stealth check?',
    a: 'No. It only applies to the **Sneak** action, which is moving while in stealth mode.' },
  { id: 'heal-range', topic: 'actions', src: 'faq', q: 'Can a character heal or revive someone from another tile?',
    a: 'No. The A.E.D. revive and the Medic\'s Heal ability only work on characters on the same map tile.' },

  // combat
  { id: 'initial-round', topic: 'combat', src: 'faq', q: 'When does an initial combat round happen?',
    a: 'Attacks in an initial combat round cost no AP. One starts:\n- when a character enters a map tile that has an enemy standee and no other character outside stealth mode, unless the character sneaked onto the tile\n- whenever an enemy spawns on a map tile with at least one character outside stealth mode' },
  { id: 'ranged-initial', topic: 'combat', src: 'faq', q: 'Does a ranged attack start an initial combat round?',
    a: 'No.' },
  { id: 'prep-move-combat', topic: 'combat', src: 'faq', q: 'If an enemy moves onto my tile in the preparation phase, is there an initial combat round?',
    a: 'No. Enemy movement in the preparation phase never starts an initial combat round. See the Enemies section for what happens next.' },
  { id: 'two-weapons', topic: 'combat', src: 'faq', q: 'Can I attack with more than one weapon?',
    a: 'No. If you carry several weapons, pick one for each attack action.' },
  { id: 'weapon-dice', topic: 'combat', src: 'faq', q: 'Which dice do I roll when attacking with a weapon?',
    a: 'Take your character\'s base attack dice and add the weapon\'s dice for that combat distance, melee or ranged. Roll them together as one pool.\n\nThere is a tutorial video for combat: {link:combatVideo|combat video on YouTube}.' },
  { id: 'armour', topic: 'combat', src: 'faq', q: 'Does armour reduce damage from hunger, thirst or events?',
    a: 'No. Light and heavy armour only count in combat.' },

  // stealth
  { id: 'enter-stealth', topic: 'stealth', src: 'faq', q: 'How does a character go into stealth mode?',
    a: '- By sneaking onto a tile with an enemy symbol, or onto a tile with an active enemy (an enemy standee on the tile).\n- When an enemy moves onto the character\'s tile in the preparation phase.' },
  { id: 'leave-stealth', topic: 'stealth', src: 'faq', q: 'If I am in stealth mode and move away from an enemy, does it attack me?',
    a: 'Not if you sneak and pass the Stealth check. If you move without sneaking, or fail the check, it attacks.' },
  { id: 'aware', topic: 'stealth', src: 'faq', q: 'Can I go into stealth once an enemy on my tile already knows I am there?',
    a: 'No.' },
  { id: 'track-stealth', topic: 'stealth', src: 'faq', q: 'How do I keep track of who is in stealth mode?',
    a: 'Use one of the paper karma tokens as a stealth token next to the character. The karma tokens are still in the box because karma dice were added later as a stretch goal.' },
  { id: 'stealth-night', topic: 'stealth', src: 'designer', q: 'Does stealth protect me from enemies at night?',
    a: 'No. But if you are hidden when the night starts and a night card spawns an enemy on your tile, it does not attack straight away. As soon as you take an action and fail a Stealth check, every enemy on the tile knows you are there and attacks.' },

  // enemies
  { id: 'target-move', topic: 'enemies', src: 'faq', q: 'Do enemies on target tiles move, like the kidnappers in Mission 1?',
    a: 'Not in the preparation phase. They can still move off the tile in response to a ranged attack (see ranged combat in the rulebook).' },
  { id: 'recon-move', topic: 'enemies', src: 'faq', q: 'Do enemies revealed with binoculars move in the preparation phase?',
    a: 'Yes. A recon draws an enemy card and puts its standee on the tile. In the preparation phase every enemy standing alone moves: roll the yellow d8 for direction.' },
  { id: 'enemy-onto-char', topic: 'enemies', src: 'faq', q: 'What happens when an enemy moves onto a character\'s tile in the preparation phase?',
    a: 'Nothing at first, and no initial combat round. The character goes into stealth mode. Any later action on that tile triggers a counterattack, unless the character is still in stealth mode.' },
  { id: 'sniper-move', topic: 'enemies', src: 'faq', q: 'Do enemies still move toward me when I shoot with the sniper rifle from 2 tiles away?',
    a: 'Yes. As after any ranged attack, the enemy rolls a blue die. On a success it moves 1 tile toward the shooter.' },

  // day phases
  { id: 'lowest-fitness', topic: 'day', src: 'faq', q: 'In the preparation phase, do I take damage if my fitness is already at the lowest step?',
    a: 'No. Losing 2 AP is penalty enough.' },
  { id: 'day-six', topic: 'day', src: 'faq', q: 'What if the day tracker needs to go past day 5?',
    a: 'Timed missions never go past day 5. In an open game, move the marker back to day 1 and count it as day 6.' },
  { id: 'shared-food', topic: 'day', src: 'designer', q: 'In preparation step h, several characters want to eat the same food on the tile. Who gets it?',
    a: 'Decide in turn order, starting with the starting player. In semi-cooperative games this can get mean.' },

  // items
  { id: 'rearrange', topic: 'items', src: 'faq', q: 'Can I rearrange the resources and items on my character board?',
    a: 'Yes, freely and at any time.' },
  { id: 'hero-item', topic: 'items', src: 'designer', q: 'I drew a hero item from the loot deck for a character who is not in the game. What now?',
    a: 'Officially you keep the card. You can trade it to a merchant like any other item.\n\nDrawing a replacement card instead, or letting any character use any hero item, are house rules. The BGG FAQ suggests the replacement draw, or shuffling only the active characters\' hero items into the loot deck at setup.' },
  { id: 'dead-gear', topic: 'items', src: 'faq', q: 'What happens to a dead character\'s equipment and resources?',
    a: 'Everything stays with the body, and anyone can use the **Loot** action on it. If the character is not revived with an A.E.D. within 1 day, remove the standee and leave all its resources and items on the tile as dropped items.' },
  { id: 'crafting-sheet', topic: 'items', src: 'designer', q: 'Where can I find the crafting sheet with the Content Pack 01 items?',
    a: 'An updated crafting overview is on the {link:downloads|tabletopper games downloads page}.' },

  // merchant
  { id: 'sell-source', topic: 'merchant', src: 'faq', q: 'When I sell to a merchant, where does the payment come from?',
    a: 'From the merchant\'s own stock. If the merchant only has wood, wood is all you can get for your item.' },
  { id: 'disassemble-source', topic: 'merchant', src: 'faq', q: 'When a merchant takes an item apart, where do the resources come from?',
    a: 'From the general supply.' },
  { id: 'sell-for-items', topic: 'merchant', src: 'designer', q: 'Can I sell an item for another item, not just water or resources?',
    a: 'Yes. Rulebook V2.0 (English and German) covers buying items, trading resources and selling items, and you can sell for water, resources or items.' },
  { id: 'new-haven-camp', topic: 'merchant', src: 'faq', q: 'Is New Haven a camp?',
    a: 'Yes, but it has no campfire.' },

  // traitor
  { id: 'traitor-new-haven', topic: 'traitor', src: 'faq', q: 'Can the traitor still enter New Haven?',
    a: 'Yes. Only the characters know he is the traitor. The people of New Haven do not know, or are not yet convinced.' },
  { id: 'traitor-rules', topic: 'traitor', src: 'faq', q: 'Do any rules change for the traitor once he is revealed?',
    a: 'Only two things: he has a different objective, and SoL enemies stop attacking him. Every other rule is the same as for the characters.' },
  { id: 'traitor-win', topic: 'traitor', src: 'faq', q: 'When does the traitor win?',
    a: '- He completes his objectives.\n- All the other players are dead.\n- The other players give up.' },
  { id: 'traitor-announce', topic: 'traitor', src: 'faq', q: 'Does the traitor have to reveal his objectives?',
    a: 'No. He does not even have to admit he is the traitor.' },
  { id: 'traitor-spawn', topic: 'traitor', src: 'faq', q: 'What happens when the traitor spawns SoL enemies on a tile with a character?',
    a: 'The same as any spawn on a character\'s tile: an initial combat round starts. With several characters on the tile, the traitor picks the target.' },
  { id: 'traitor-send', topic: 'traitor', src: 'faq', q: 'The traitor spends 2 AP to move an active SoL enemy onto another character\'s tile. How is that handled?',
    a: 'As if the enemy spawned there. Unlike random movement in the preparation phase, the character does not go into stealth mode, because the traitor sent the enemy on purpose.' },
  { id: 'traitor-random', topic: 'traitor', src: 'faq', q: 'Do SoL enemies still move randomly after the traitor is revealed?',
    a: 'Yes. The traitor only controls them on his own turn, by spending 2 AP.' },
  { id: 'traitor-no-ap', topic: 'traitor', src: 'faq', q: 'Can characters defend themselves when they have no AP left and the traitor attacks?',
    a: 'No. If the traitor times it well, he attacks without a counterattack. The same works the other way round.' },

  // missions
  { id: 'lootrun', topic: 'missions', src: 'designer', q: 'Mission 3 (Lootrun): how do I deliver the goods to Lawrence?',
    a: 'Delivery is automatic when you reach New Haven, even with no AP left.' },
  { id: 'm6-deck', topic: 'missions', src: 'designer', q: 'Mission 6 with a traitor: how does drawing from the enemy deck work when searching for the SoL scavenger?',
    a: 'At setup you build a special enemy deck so that the scavenger is the fourth enemy you meet at the earliest.' },
  { id: 'm-errata', topic: 'missions', src: 'errata', q: 'Are there corrections to the first edition mission cards?',
    a: '- **Mission 1, part 1, setup:** form 3 stacks, not 4. The card should say "Stack 2/3", not "Stack 2/3/4".\n- **Mission 2, part 2:** add the special rule "At night, enemies are drawn from the night deck."\n- **Mission 4, part 4:** add "Enemies do not move in response to ranged attacks (no blue die roll)."\n- **Mission 6, part 1, setup:** stack 1 is 3 random enemy cards, with no scavenger.' },

  // house rules
  { id: 'hr-medic', topic: 'house', src: 'house', q: 'Can the Medic be stronger in combat?',
    a: 'Optional: once per day phase, if the Medic\'s attack causes damage, she can also give the target an injury.' },
  { id: 'hr-harder', topic: 'house', src: 'house', q: 'How can I make the game harder?',
    a: '- Play without starting items.\n- Build the map tile stack with more enemy symbols.\n- Raise enemy HP.' },
  { id: 'hr-selling', topic: 'house', src: 'house', q: 'Selling to merchants only pays half. Is there a better way?',
    a: 'Optional: give the merchant the item plus 1 water and receive the full price.' },
  { id: 'hr-crafting', topic: 'house', src: 'house', q: 'Can I craft with resources lying on the tile?',
    a: 'Optional: allow crafting from dropped resources on your tile as well as what you carry. Resources not yet gathered still do not count.' },
  { id: 'hr-suspects', topic: 'house', src: 'house', q: 'Is there a fun extra for traitor mode?',
    a: 'Optional: after every second day phase, each player secretly writes down who they suspect. Reveal the notes at the end to see how suspicions changed.' },
  { id: 'hr-sleep', topic: 'house', src: 'house', q: 'Can sleeping always restore fitness?',
    a: 'Optional: sleeping at night always sets fitness to FIT. In the rules this only happens when you sleep in a camp.' },

  // errata
  { id: 'e-conflict', topic: 'errata', src: 'designer', q: 'A card and the rulebook disagree. Which one wins?',
    a: 'The rulebook. It says so itself: when the rulebook and game material conflict, the rulebook applies.' },
  { id: 'e-v2-german', topic: 'errata', src: 'errata', q: 'Are there known errors in V2.0?',
    a: 'Reported for the German V2.0 and fixed for rulebook 2.1:\n- **Small animal trap card:** the 1 AP cost on the card is wrong. Follow the rulebook.\n- **Rulebook p. 11, Eat (Essen):** costs 1 AP only. "1 HP" is a mistake.\n- **Use item (rulebook and player aid):** costs 0 or more AP, not "0-1 AP". The cooking pit, for example, takes 2 AP.' },
  { id: 'e-1e-rulebook', topic: 'errata', src: 'errata', q: 'First edition rulebook corrections',
    a: 'These page numbers refer to the first edition rulebook. V2.0 may already include them.\n- **p. 2:** 34 map tiles (not 32), 35 tokens (not 36), 10 d8 (not 9).\n- **p. 10, Open container:** uses Dexterity, not "skill".\n- **p. 10, Eat:** move 1 food from your resources **or the current map tile** to your health meter.\n- **p. 18, h. Eating:** each character discards 1 food from their resources **or the map tile**, or takes 1 damage. The day tracker has the same correction.\n- **p. 19, Symbols:** Dexterity, not "skill".' },
  { id: 'e-1e-cards', topic: 'errata', src: 'errata', q: 'First edition mini card and player aid corrections',
    a: '- **Veteran\'s sniper rifle:** 2 uses, not 3.\n- **Player aid, Dodge:** if successful, one attack is completely evaded. It does not subtract successes from the damage.' }
];

// First edition box contents, for reference.
export const CONTENTS_1E = [
  ['Rulebook', '20 pages, 18 x 25 cm'],
  ['Rule sheet', 'crafting, glossary, quick reference, random resources, house rules; 23.5 x 17 cm'],
  ['Insert map', '15 x 10.5 cm'],
  ['Character boards', '4, double-layered'],
  ['Day tracker boards', '2, 83 x 258 mm'],
  ['Standees', '6 characters, 25 enemies, 15 bases'],
  ['Tent miniature', '1'],
  ['Map tiles', '34 hexagons, 87 to 100 mm'],
  ['Dice', 'custom d8: 2 blue, 3 yellow, 3 green, 1 red; 1 white d8; 12 karma d6'],
  ['Large cards, 59 x 91 mm', '35 event, 25 enemy, 22 night, 13 team, 10 sun'],
  ['Small cards, 44 x 67 mm', '53 item, 48 loot, 19 gear'],
  ['Mission and other cards', '32, tarot size 70 x 120 mm'],
  ['Resource cubes, 7 mm', '38 water, 45 food, 20 fabric, 19 metal, 17 connector, 15 wood, 13 alcohol, 11 plastic'],
  ['Tokens', '35 cardboard, 30 markers, 9 acrylic'],
  ['Storage', 'custom vacuum tray, cloth bag']
];
