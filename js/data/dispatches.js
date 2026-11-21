// Stories: new missions written for the site, labelled "Story" on the cards.
// status: 'untested' until a group has played it and sent feedback, then 'playtested'.
// testNotes: what playtesters should watch for, part by part. Mission files live in /dispatches/.
export const DISPATCHES = [
  { id: 'dispatch-01-ghost-signal', file: 'dispatches/01-ghost-signal.json', number: '01', title: 'Ghost Signal',
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
  { id: 'dispatch-02-the-deep-well', file: 'dispatches/02-the-deep-well.json', number: '02', title: 'The Deep Well',
    status: 'untested', version: '1.1', diff: 3, parts: 6, players: '1-6', time: '120-180', mode: 'coop',
    types: ['timed', 'rescue', 'defend'], needs: 'Base game', sequelOf: 'dispatch-01-ghost-signal',
    premise: 'Ida\'s map leads east to an old enclave where the water still runs. The Sons of Liberty know the way too. Sequel to Ghost Signal, and playable on its own.',
    testNotes: [
      'Part 1, start: which setup did you use (signal silenced, signal left running, or Story 01 not played)?',
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
    playtests: [] }
];

export const DISPATCH_STATUS = {
  untested: { label: 'Needs playtest', note: 'Not played yet. Rules may change after feedback.' },
  playtested: { label: 'Playtested', note: 'Played and adjusted after feedback.' }
};
