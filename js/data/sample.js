// Sample mission shipped with the tool. Original text written for the tool.
import { newBlock, newPart, SCHEMA_VERSION } from './schema.js?v=b57b33be';

export function sampleMission() {
  const now = new Date().toISOString();
  return {
    schema: SCHEMA_VERSION,
    id: 'sample-dry-wells',
    title: 'The dry wells',
    label: 'Mission',
    number: 'S1',
    author: 'Mission tool sample',
    community: true,
    difficulty: 1,
    mode: 'both',
    players: '1-4',
    playtime: '60-90',
    summary: 'A short scouting run to learn the mission tool. Find out why the eastern wells ran dry.',
    notes: 'Delete or edit this mission freely. Duplicate it to start your own.',
    art: { preset: 'dunes', front: null, back: null, frontPos: { x: 50, y: 40, zoom: 1 }, backPos: { x: 50, y: 50, zoom: 1 } },
    parts: [
      newPart([
        newBlock('section', 'BRIEFING', 'The water carriers came back empty again. Three wells east of New Haven have gone dry in a week, and the last carrier swears she saw fresh tracks around the pumps.\n\nThe council needs someone to find out what is happening out there before the cisterns run low.'),
        newBlock('section', 'SETUP', 'Form 2 stacks of map tiles:\n- **Stack 1:** 4 random map tiles\n- **Stack 2:** 4 random map tiles + 1 target map tile, shuffled\nPlace stack 1 on top of stack 2.'),
        newBlock('goal', '', 'Find the cause of the dry wells and return to New Haven.'),
        newBlock('objectives', '', 'Explore until the target map tile is revealed, then read **{mission} - Part 2**.')
      ]),
      newPart([
        newBlock('story', '', 'A rusted pump house sits in a shallow hollow. Someone has bent the pipes aside and run a hose toward a cart hidden in the rocks. Two figures are filling barrels.'),
        newBlock('section', 'SETUP', 'Spawn **1 SoL Soldier** on the target map tile. Place 3 {water} on the tile.'),
        newBlock('objectives', '', 'Defeat the enemy or sneak past with a Stealth check ({yellow} {yellow}).\nCarry at least 2 {water} back to New Haven, then read **{mission} - Part 3**.')
      ]),
      newPart([
        newBlock('success', '', 'The barrels roll through the gates to cheers. With the pump house repaired, the eastern wells will run again by the next morning.'),
        newBlock('failure', '', 'The cart is gone by the time anyone else reaches the hollow. New Haven rations water for the rest of the season.')
      ])
    ],
    created: now,
    updated: now
  };
}
