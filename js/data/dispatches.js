// Dispatches: new missions written for the site. status: 'untested' until a group
// has played it and sent feedback, then 'playtested'. Mission files live in /dispatches/.
export const DISPATCHES = [
  { id: 'dispatch-01-ghost-signal', file: 'dispatches/01-ghost-signal.json', number: '01', title: 'Ghost Signal',
    status: 'untested', version: '1.0', diff: 2, parts: 5, players: '1-6', time: '90-150', mode: 'both',
    types: ['rescue', 'escort', 'timed'], needs: 'Base game',
    premise: 'A forbidden radio picks up a woman\'s voice promising clean water to anyone who comes east. Three families are already packing.',
    testFocus: 'Ida\'s HP and the reinforcement rate at 1 and at 6 players. Is the day 5 deadline too tight or too loose?',
    playtests: [] },
  { id: 'dispatch-02-the-deep-well', file: 'dispatches/02-the-deep-well.json', number: '02', title: 'The Deep Well',
    status: 'untested', version: '1.0', diff: 3, parts: 6, players: '1-6', time: '120-180', mode: 'coop',
    types: ['timed', 'rescue', 'defend'], needs: 'Base game', sequelOf: 'dispatch-01-ghost-signal',
    premise: 'Ida\'s map leads east to an old enclave where the water still runs. The Sons of Liberty know the way too. Sequel to Ghost Signal, and playable on its own.',
    testFocus: 'The convoy clock: does it arrive too early or too late? Is Exodus (5 A) as hard as The last stand (5 B)? Check both at 1 and at 6 players.',
    playtests: [] }
];

export const DISPATCH_STATUS = {
  untested: { label: 'Needs playtest', note: 'Not played yet. Rules may change after feedback.' },
  playtested: { label: 'Playtested', note: 'Played and adjusted after feedback.' }
};
