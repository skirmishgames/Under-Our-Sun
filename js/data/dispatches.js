// Stories: new missions written for the site, labelled "Story" on the cards.
// status: 'untested' until a group has played it and sent feedback, then 'playtested'.
// testNotes: what playtesters should watch for, part by part. Mission files live in /stories/. Ids and file names carry no number, so renumbering never breaks links.
export const DISPATCHES = [
  { id: 'story-the-stray', file: 'stories/the-stray.json', number: '01', title: 'The Stray',
    status: 'untested', version: '1.0', diff: 1, parts: 4, players: '1-6', time: '45-90', mode: 'coop', genre: 'Introductory',
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
  { id: 'story-ghost-signal', file: 'stories/ghost-signal.json', number: '02', title: 'Ghost Signal',
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
  { id: 'story-the-deep-well', file: 'stories/the-deep-well.json', number: '03', title: 'The Deep Well',
    status: 'untested', version: '1.1', diff: 3, parts: 6, players: '1-6', time: '120-180', mode: 'coop',
    types: ['timed', 'rescue', 'defend'], needs: 'Base game', sequelOf: 'story-ghost-signal',
    premise: 'Ida\'s map leads east to an old enclave where the water still runs. The Sons of Liberty know the way too. Sequel to Story 02: Ghost Signal, and playable on its own.',
    testNotes: [
      'Part 1, start: which setup did you use (signal silenced, signal left running, or Story 02 not played)?',
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
  { id: 'story-the-informant', file: 'stories/the-informant.json', number: '04', title: 'The Informant',
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
    playtests: [] }
];

export const DISPATCH_STATUS = {
  untested: { label: 'Needs playtest', note: 'Not played yet. Rules may change after feedback.' },
  playtested: { label: 'Playtested', note: 'Played and adjusted after feedback.' }
};
