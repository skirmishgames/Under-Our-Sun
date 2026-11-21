// Mission data model. Field order follows the community mission template.

export const SCHEMA_VERSION = 1;

export const DIFFICULTY = [
  { value: 1, label: 'Easy', marks: '!', colour: '#5f8f3a' },
  { value: 2, label: 'Challenging', marks: '!!', colour: '#d9822b' },
  { value: 3, label: 'Hard', marks: '!!!', colour: '#b8322a' }
];

export const MODES = [
  { value: 'coop', label: 'Cooperative' },
  { value: 'semi', label: 'Semi-cooperative' },
  { value: 'both', label: 'Cooperative or semi-cooperative' },
  { value: 'comp', label: 'Competitive' }
];

// Block kinds a mission part can hold. "pill" kinds print a coloured label.
export const BLOCK_KINDS = {
  section:    { label: 'Section with heading', pill: false, align: 'left' },
  story:      { label: 'Story text', pill: false, align: 'left' },
  goal:       { label: 'Mission goal', pill: true, align: 'center', colour: '#d99a2b', text: 'MISSION GOAL' },
  objectives: { label: 'Objectives', pill: true, align: 'center', colour: '#4f7f9e', text: 'OBJECTIVES' },
  bonus:      { label: 'Bonus objective', pill: true, align: 'center', colour: '#7a5aa0', text: 'BONUS OBJECTIVE' },
  success:    { label: 'Success', pill: true, align: 'center', colour: '#4c8a3a', text: 'SUCCESS' },
  failure:    { label: 'Failure', pill: true, align: 'center', colour: '#b0352b', text: 'FAILURE' },
  roguelike:  { label: 'Roguelike reward', pill: true, align: 'center', colour: '#6b5636', text: 'ROGUELIKE MODE' },
  tip:        { label: 'Tip', pill: false, align: 'center' },
  image:      { label: 'Picture (map setup)', pill: false, align: 'center' }
};

export const HEADING_SUGGESTIONS = ['BRIEFING', 'INTRODUCTION', 'SETUP', 'SPECIAL RULES', 'MISSION RULES', 'SPECIAL ABILITY', 'DEBRIEFING'];

export const ART_PRESETS = [
  { value: 'dunes', label: 'Dunes at dusk' },
  { value: 'wasteland', label: 'Wasteland by day' },
  { value: 'highway', label: 'Broken highway' },
  { value: 'ruins', label: 'Ruined city on the horizon' },
  { value: 'canyon', label: 'Canyon' },
  { value: 'storm', label: 'Solar storm' },
  { value: 'night', label: 'Desert night' }
];

// Inline icon tokens usable in any text field.
export const ICON_TOKENS = {
  green:     { kind: 'die', colour: '#3f9e4d', label: 'Green die' },
  yellow:    { kind: 'die', colour: '#e3b928', label: 'Yellow die' },
  blue:      { kind: 'die', colour: '#3b7fc0', label: 'Blue die' },
  red:       { kind: 'die', colour: '#c0392b', label: 'Red die' },
  karma:     { kind: 'karma', colour: '#6b4fa0', label: 'Karma die' },
  success:   { kind: 'success', colour: '#33302c', label: 'Success' },
  double:    { kind: 'double', colour: '#33302c', label: 'Double success' },
  fail:      { kind: 'fail', colour: '#c0392b', label: 'Failure (red die X)' },
  d8:        { kind: 'd8', colour: '#6f7378', label: 'Numbered d8' },
  enemy:     { kind: 'enemy', colour: '#c8323a', label: 'Enemy symbol' },
  water:     { kind: 'drop', colour: '#3b7fc0', label: 'Water' },
  food:      { kind: 'cube', colour: '#c0392b', label: 'Food' },
  fabric:    { kind: 'cube', colour: '#e3b928', label: 'Fabric' },
  metal:     { kind: 'cube', colour: '#2e2e2e', label: 'Metal' },
  connector: { kind: 'cube', colour: '#e9e9e4', label: 'Connector' },
  wood:      { kind: 'cube', colour: '#d9822b', label: 'Wood' },
  alcohol:   { kind: 'cube', colour: '#3f9e4d', label: 'Alcohol' },
  plastic:   { kind: 'cube', colour: '#e07ab0', label: 'Plastic' },
  injury:    { kind: 'injury', colour: '#c0392b', label: 'Injury' },
  infection: { kind: 'infection', colour: '#c0392b', label: 'Infection' },
  star:      { kind: 'star', colour: '#6b5636', label: 'Point (roguelike star)' },
  hp:        { kind: 'tag', colour: '#b0352b', label: 'Health point', text: 'HP' },
  ap:        { kind: 'tag', colour: '#3d3d3d', label: 'Action point', text: 'AP' }
};

export function uid(prefix = 'm') {
  return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

export function newBlock(kind = 'story', heading = '', text = '') {
  return { id: uid('b'), kind, heading, text, image: null, caption: '' };
}

export function newPart(blocks = []) {
  return { id: uid('p'), blocks, art: null };
}

// A fresh mission laid out like the community template.
export function newMission() {
  const now = new Date().toISOString();
  return {
    schema: SCHEMA_VERSION,
    id: uid('m'),
    title: 'New mission',
    label: 'Mission',
    number: '',
    author: '',
    community: true,
    difficulty: 2,
    mode: 'coop',
    players: '1-6',
    playtime: '90-120',
    summary: '',
    notes: '',
    types: [],
    art: { preset: 'dunes', front: null, back: null, frontPos: { x: 50, y: 40, zoom: 1 }, backPos: { x: 50, y: 50, zoom: 1 } },
    parts: [
      newPart([
        newBlock('section', 'BRIEFING', ''),
        newBlock('section', 'SETUP', ''),
        newBlock('section', 'SPECIAL RULES', ''),
        newBlock('goal', '', ''),
        newBlock('objectives', '', '')
      ]),
      newPart([newBlock('story', '', ''), newBlock('objectives', '', '')]),
      newPart([newBlock('success', '', ''), newBlock('failure', '', '')])
    ],
    created: now,
    updated: now
  };
}

// Bring older or imported missions up to the current shape.
export function normaliseMission(m) {
  const base = newMission();
  const out = Object.assign({}, base, m || {});
  out.schema = SCHEMA_VERSION;
  out.art = Object.assign({}, base.art, (m && m.art) || {});
  out.art.frontPos = Object.assign({ x: 50, y: 40, zoom: 1 }, out.art.frontPos || {});
  out.art.backPos = Object.assign({ x: 50, y: 50, zoom: 1 }, out.art.backPos || {});
  out.difficulty = [1, 2, 3].includes(+out.difficulty) ? +out.difficulty : 2;
  out.parts = Array.isArray(out.parts) && out.parts.length ? out.parts : base.parts;
  out.types = Array.isArray(out.types) ? out.types : [];
  out.parts = out.parts.map(p => ({
    id: p.id || uid('p'),
    label: p.label || '',
    art: p.art || null,
    blocks: (p.blocks || []).map(b => Object.assign(newBlock(), b, { kind: BLOCK_KINDS[b.kind] ? b.kind : 'story' }))
  }));
  return out;
}

// "Mission 14" style label used in headers and the {mission} token.
// Part label shown in the header: a custom label such as "6 A", or the next number.
// Unlabelled parts continue from the previous part's number, so after 5 A and 5 B comes 6.
export function partLabel(m, i) {
  let n = 0;
  for (let k = 0; k <= i; k++) {
    const p = m.parts[k];
    const own = p && String(p.label || '').trim();
    if (own) {
      const lead = parseInt(own, 10);
      if (k === i) return own;
      if (!isNaN(lead)) n = lead;
    } else {
      n += 1;
      if (k === i) return String(n);
    }
  }
  return String(i + 1);
}

// Total parts: the highest leading number among part labels, so 6 A and 6 B count once.
export function partTotal(m) {
  let max = 0;
  m.parts.forEach((p, i) => { const n = parseInt(partLabel(m, i), 10); if (n > max) max = n; });
  return max || m.parts.length;
}

export const MISSION_TAGS = {
  rescue: 'Rescue', hunt: 'Hunt', investigate: 'Investigation', fetch: 'Fetch and return', escort: 'Escort',
  defend: 'Defence', infiltrate: 'Infiltration', survive: 'Survival', boss: 'Boss fight', timed: 'Race against time',
  story: 'Story campaign', competitive: 'Competitive'
};

// Header label on the card: "Mission 14", or a genre such as "Thriller" when there is no number.
export function headerLabel(m) {
  return [m.label || 'Mission', m.number].filter(Boolean).join(' ').trim();
}

// Name used by the {mission} token in part links: "Mission 14" when numbered,
// otherwise the mission's title, so links read "Read The Informant - Part 3".
export function missionName(m) {
  if (String(m.number || '').trim()) return headerLabel(m);
  return String(m.title || '').trim() || headerLabel(m);
}
