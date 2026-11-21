// Stories: new missions written for the site. Cards show the genre in the header, with no number.
// status: 'untested' until a group has played it and sent feedback, then 'playtested'.
// testNotes: what playtesters should watch for, part by part. Mission files live in /stories/. Listed in suggested play order.
export const DISPATCHES = [
  { id: 'story-the-stray', file: 'stories/the-stray.json', title: 'The Stray',
    status: 'untested', version: '1.0', diff: 1, parts: 4, players: '1-6', time: '45-90', mode: 'coop', genre: 'Mystery',
    types: ['hunt'], needs: 'Base game',
    premise: 'Something is raiding New Haven\'s food stores at night. Track it to its den. A gentle first mission for new players, with little combat.',
    testNotes: [
      'New players: was this a good first game? Which rules did you have to look up?',
      'Part 1, the trail: with 3 + 3 tiles plus the target, on which day and phase did you find the den? Too quick or too slow?',
      'Tips: did the campfire and sneaking tips help, or did you already know them?',
      'Part 2, the lure: did your group work out to leave food at night without a fire, or did you attack? Was the hint ("hungry, not angry") too obvious or too vague?',
      'Night: did night cards make the wait at the den feel tense but fair?',
      'Part 3, the fight (if you attacked): is a Desert Dog with +2 HP right for an easy mission?',
      'Part 3, the dogs: is 1 food per night for carrying them home a fair cost? Did anyone take damage?',
      'Deadline: was the morning of day 3 too tight?',
      'Ending: which ending did you get, and did it land? Did anyone feel bad about the choice?',
      'Roguelike: is ignoring one ANIMAL night card per mission a fair reward, or too strong?'
    ],
    changes: [],
    playtests: [] },
  { id: 'story-ghost-signal', file: 'stories/ghost-signal.json', title: 'Ghost Signal', genre: 'Rescue',
    status: 'untested', version: '1.1', diff: 2, parts: 5, players: '1-6', time: '90-150', mode: 'both',
    types: ['rescue', 'escort', 'timed'], needs: 'Base game',
    premise: 'A forbidden radio picks up a woman\'s voice promising clean water to anyone who comes east. Three families are already packing.',
    testNotes: [
      'Part 1, Listen in: is spending 2 AP to look at and reorder the top 2 map tiles worth it, or does it make the target too easy to find?',
      'Part 1 to 2: how many days did it take to reveal the target map tile? Note the day and phase.',
      'Part 3, the ambush: 1 SoL Elite plus Soldiers equal to players minus 1. Is it too harsh for 1 or 2 players, or too light for 5 or 6?',
      'Part 3, sneaking in: did anyone sneak onto the tile, and did the +1 yellow die on the first attack make it feel worth the risk?',
      'Part 4, Ida: she has 4 HP and enemies can attack her. Did she survive the trip home, and how close was it?',
      'Part 4, reinforcements: 1 SoL Soldier per preparation phase, moving toward Ida. Did they catch up, and did that feel tense or unfair?',
      'Part 4, the choice: did your group silence the signal? Was it a real dilemma, or obviously right or wrong?',
      'Deadline: how much time was left before the morning of day 5?',
      'Semi-cooperative games: did the traitor have meaningful ways to sabotage the escort?',
      'Reading aloud: did any card feel too long, or any rule unclear when you reached it?'
    ],
    changes: ['1.1: enemies on Ida\'s tile can attack her like a character (the rule was missing).'],
    playtests: [] },
  { id: 'story-the-deep-well', file: 'stories/the-deep-well.json', title: 'The Deep Well', genre: 'Race',
    status: 'untested', version: '1.1', diff: 3, parts: 6, players: '1-6', time: '120-180', mode: 'coop',
    types: ['timed', 'rescue', 'defend'], needs: 'Base game', sequelOf: 'story-ghost-signal',
    premise: 'Ida\'s map leads east to an old enclave where the water still runs. The Sons of Liberty know the way too. Sequel to Ghost Signal, and playable on its own.',
    testNotes: [
      'Part 1, start: which setup did you use (signal silenced, signal left running, or Ghost Signal not played)?',
      'The convoy clock: it arrives at 3 markers. On which day did it arrive, and was that before or after you reached the enclave? Did the race feel real?',
      'Part 2, the outer ruins: does the +1 AP to enter a ruin tile slow you down too much?',
      'Part 3, the guards: 1 SoL Elite plus Drifters equal to the number of players. Too easy or too hard at your player count?',
      'Part 4, the choice: which ending did you pick and why? Did both feel possible with the water and AP you had?',
      'Part 5 A, Exodus: the workers have 6 HP and enemies attack them first. Did they make it, and how close was the day 5 deadline?',
      'Part 5 B, Last stand: waves of half the number of players, rounded up, each day phase for 4 phases. Too many or too few? Did you run out of enemy standees?',
      'Part 5 B, Shore up: is removing a worker marker for 1 AP and 1 wood or metal too cheap?',
      'Balance: if you can, play both endings. Is one clearly easier?',
      'Ida: did she survive, and did her map ability matter?'
    ],
    changes: ['1.1: enemies on Ida\'s tile can attack her; the convoy arrives at 3 markers instead of 4 (2 markers at the start if the signal was left running) so the race matters; last stand waves halved to fit the enemy standees in the box.'],
    playtests: [] },
  { id: 'story-the-informant', file: 'stories/the-informant.json', title: 'The Informant',
    status: 'untested', version: '1.0', diff: 2, parts: 6, players: '1-6', time: '120-180', mode: 'both', genre: 'Thriller',
    types: ['investigate', 'hunt', 'timed'], needs: 'Base game',
    premise: 'Someone in New Haven is selling patrol routes to the Sons of Liberty. A scout has run with a satchel of maps. Bring her back before more people die.',
    testNotes: [
      'Part 1, leads: did all three leads land on reachable tiles? How many did you find, and was 2 AP plus a Dexterity check a fair price?',
      'The reveal: when did your group suspect the truth? After a lead, at part 3, or not until the end? A thriller works best when someone guesses just before it is confirmed.',
      'Part 1 deadline: did you find Ren before day 4? How much time was left?',
      'Part 3, the ambush: 1 SoL Elite plus Soldiers equal to the number of players. Did Ren (3 HP) survive it?',
      'Part 4, the walk home: did the pursuing Soldiers catch up? Did "no night cards on Ren\'s tile" make travelling at night too safe?',
      'Branch: which part 5 did you reach, and why (clues, Ren dead, or night fell)? Did it feel earned?',
      'Part 5 A, the chase: can the veteran be caught within 3 day phases, or does he escape too easily?',
      'Part 5 B, the open gate: one night phase to clear New Haven. Possible at your player count?',
      'Semi-cooperative games: did the ending line about the traitor land? Did the traitor\'s goals fit this mission?',
      'Story: were the leads clear enough to follow, and was the ending a surprise?'
    ],
    changes: [],
    playtests: [] },
  { id: 'story-what-we-owe', file: 'stories/what-we-owe.json', title: 'What We Owe', genre: 'Drama',
    status: 'untested', version: '1.0', diff: 2, parts: 6, players: '1-6', time: '90-150', mode: 'both',
    types: ['fetch', 'timed'], needs: 'Base game',
    premise: 'A fever is spreading, and there is only one crate of medicine in the wasteland. Two places need it. You can only save one.',
    testNotes: [
      'The choice: how long did your group argue, and what decided it? Did anyone want to try for both?',
      'Was the choice hard? If one option felt obviously right, tell us which and why.',
      'Part 2, the camp: did meeting Sela and her children first make the camp feel like a real option?',
      'Distance: how far apart were New Haven and the camp? Did the day 5 deadline ever rule one of them out?',
      'Part 3, the wreck: 1 Scavenger plus Rats equal to players minus 1. Too easy or too hard?',
      'The crate: is "it cannot be split" clear enough? Did anyone try to argue around it?',
      'Endings: did the one you read land emotionally? Too heavy, or just right?',
      'Semi-cooperative games: did the traitor try to carry the crate to the "wrong" place, or keep it from both? Did that make for a good game?',
      'Rewards: is a Medkit for New Haven against a Sun cape for the camp a fair pair?',
      'Pacing: how long did the game take, and did the search before the choice drag?'
    ],
    changes: [],
    playtests: [] }
];

export const DISPATCH_STATUS = {
  untested: { label: 'Needs playtest', note: 'Not played yet. Rules may change after feedback.' },
  playtested: { label: 'Playtested', note: 'Played and adjusted after feedback.' }
};
