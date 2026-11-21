// Index of the official missions, summarised in our own words.
// Box: 'base' = base game, 'cp01' = Content Pack 01 (CP01 on the card footer).
// premise: spoiler-free, covers the start of the mission only.

export const MISSION_TYPES = {
  rescue: 'Rescue',
  hunt: 'Hunt',
  investigate: 'Investigation',
  fetch: 'Fetch and return',
  escort: 'Escort',
  defend: 'Defence',
  infiltrate: 'Infiltration',
  survive: 'Survival',
  boss: 'Boss fight',
  timed: 'Race against time',
  story: 'Story campaign',
  competitive: 'Competitive'
};

export const OFFICIAL_MISSIONS = [
  { n: 1, title: 'Search and Rescue', diff: 2, parts: 4, players: '1-6', time: '90-180', mode: 'coop', box: 'base',
    types: ['rescue', 'timed'],
    premise: 'Sons of Liberty raiders snatched community members from the edge of New Haven before dawn. Track them across the wasteland and bring them home.' },
  { n: 2, title: 'The Crawler Den', diff: 3, parts: 5, players: '1-6', time: '60-160', mode: 'coop', box: 'base',
    types: ['hunt', 'boss'],
    premise: 'Crawler attacks on the night patrols are rising. Find where they nest and wipe out the threat.' },
  { n: 3, title: 'Loot Run', diff: 1, parts: 1, players: '2-4', time: '60-120', mode: 'comp', box: 'base',
    types: ['competitive', 'fetch', 'timed'],
    premise: 'A scavenging contest: whoever brings Lawrence the most valuable haul before the deadline wins.' },
  { n: 4, title: 'The Outpost', diff: 3, parts: 5, players: '1-6', time: '90-180', mode: 'coop', box: 'base',
    types: ['defend', 'timed'],
    premise: 'The northeastern outpost has gone silent for three days. Get there fast and find out why.' },
  { n: 5, title: 'Last One Standing', diff: 2, parts: 1, players: '2-4', time: '40-120', mode: 'comp', box: 'base',
    types: ['competitive'],
    premise: 'A deathmatch tournament in the wastes. Be the last survivor, alone or as a team.' },
  { n: 6, title: 'The Infection', diff: 2, parts: 2, players: '1-6', time: '40-120', mode: 'coop', box: 'base',
    types: ['timed', 'hunt', 'fetch'],
    premise: 'A sickness is spreading through New Haven. Find the cure before it takes everyone.' },
  { n: 7, title: 'New Beginnings', diff: 2, parts: 6, players: '2-4', time: '120-240', mode: 'coop', box: 'base',
    types: ['story', 'infiltrate'],
    premise: 'Capture a Son of Liberty alive and find out what his people are planning.' },
  { n: 8, title: 'The Dealer', diff: 2, parts: 6, players: '2-4', time: '120-180', mode: 'coop', box: 'cp01',
    types: ['investigate', 'boss'],
    premise: 'A new drug is spreading through New Haven. Find out who is selling it.' },
  { n: 9, title: 'King of the Hill', diff: 1, parts: 2, players: '2-4', time: '30-90', mode: 'comp', box: 'cp01',
    types: ['competitive'],
    premise: 'Survivors against Sons of Liberty in a fight over high ground. Hold two of the three hills to win.' },
  { n: 10, title: 'Power of the Sun', diff: 2, parts: 5, players: '1-6', time: '80-120', mode: 'coop', box: 'cp01',
    types: ['fetch', 'timed'],
    premise: 'A storm wrecked New Haven\'s solar panels. Fetch spare parts before the fuel runs out.' },
  { n: 11, title: 'Complicated Logistics', diff: 3, parts: 6, players: '1-6', time: '70-140', mode: 'coop', box: 'cp01',
    types: ['escort'],
    premise: 'Escort a military truck with vital cargo back to New Haven, with an unlikely ally along for the ride.' },
  { n: 12, title: 'Hidden Stash', diff: 1, parts: 2, players: '2-6', time: '30-90', mode: 'comp', box: 'cp01',
    types: ['competitive', 'fetch'],
    premise: 'A race for buried supply crates. The first to bring the right one to Lawrence wins.' },
  { n: 13, title: 'Promising Future', diff: 2, parts: 4, players: '1-6', time: '60-140', mode: 'coop', box: 'cp01', author: 'Lars van de Water', community: true,
    types: ['infiltrate', 'fetch'],
    premise: 'Rumours of an artifact that leads to lost water reserves. The SoL are looking for it too.' },
  { n: 14, title: 'Gray Hawk Down', diff: 3, parts: 3, players: '1-6', time: '60-110', mode: 'coop', box: 'cp01', author: 'Wifried Trüper', community: true,
    types: ['survive'],
    premise: 'A reconnaissance flight over the wasteland goes badly wrong.' }
];

// Fan-made missions shared in the community (not official).
export const COMMUNITY_MISSIONS = [
  { title: 'Rebel', author: '', diff: 'medium to hard', players: '2-6', time: '120-150', types: ['boss', 'investigate'],
    premise: 'Something is attacking everyone in the wasteland without allegiance. Find it and stop it in a boss battle.' },
  { title: 'The Abduction', author: '', diff: 'hard', players: '2-4', time: '120-180', types: ['survive'],
    premise: 'Captured by SoL raiders on patrol, the characters wake in a cage far from home with no gear.' },
  { title: 'Mission 565', author: 'chari n', diff: 'hard', players: '', time: '', types: ['investigate', 'boss'],
    premise: 'Contact with the eastern outposts is lost after an earthquake. Five short parts lead to something escaped from an old zoo.' },
  { title: 'Too much of a good thing?', author: 'stephen lamb', diff: 'at least medium', players: '', time: 'about 45', types: ['fetch', 'escort'],
    premise: 'New Haven is overcrowded. Find a new community, earn its trust, build a road and escort the first caravan.' },
  { title: 'Macadam Warriors', author: 'Dhan Torkin', diff: 'campaign', players: '2 characters', time: '', types: ['story'],
    premise: 'A cooperative campaign of seven missions and side quests, with vehicles, a travelling merchant and new cards.' }
];
