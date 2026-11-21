// Prompt lists for the mission spark generator on the Design page.

export const SPARKS = {
  hook: [
    'A water carrier comes back with a hand-drawn map she found on a dead SoL soldier.',
    'Lawrence needs a rare part for the trading post and will pay well in water.',
    'Scouts saw smoke from a crashed Prime Elite vehicle to the east.',
    'Fresh crawler tracks circle the cisterns every night.',
    'A child from New Haven followed a dog into the wasteland and did not come back.',
    'A merchant caravan that was due three days ago never arrived.',
    'An SoL envoy offers New Haven a trade that sounds too good.',
    'A mutated animal is fouling the water sources near the settlement.',
    'Rumours say an old Sapphire facility still has working water pumps.',
    'A solar storm brought down part of the New Haven wall overnight.',
    'A deserter from the Prime Elite asks for shelter and says he can help.',
    'The old veteran at the morning briefing has a job he will not explain.',
    'Someone has been stealing food from the stores, and the tracks lead out of town.',
    'A sandstorm uncovered something metal and huge half a day\'s walk away.'
  ],
  goal: [
    'Find it: reveal a target map tile hidden in the stack.',
    'Rescue: free captives and get them home alive.',
    'Hunt: track a moving target before it escapes.',
    'Fetch and return: bring an object or resources back to New Haven.',
    'Infiltrate: get into an SoL camp unseen and out again.',
    'Survive: start far from home with little gear and make it back.',
    'Build or repair: gather resources and spend them at a location.',
    'Escort: protect someone or something across the map.',
    'Boss fight: face one strong enemy with special rules.',
    'Hold out: defend a tile until a day or phase on the tracker.'
  ],
  complication: [
    'The mission starts in the afternoon, so night comes fast.',
    'Water sources on map tiles do not refill in this mission.',
    'One character starts injured.',
    'No starting items: the group leaves with nothing.',
    'A pursuer moves one map tile toward the nearest character every preparation phase.',
    'The target moves one tile away from the characters each phase.',
    'The object is fragile: a failed Dexterity check while carrying it breaks it.',
    'A solar storm hits every afternoon.',
    'A merchant appears only once, and only if someone finds him.',
    'Night cards are drawn on every tile, camp or not.',
    'The SoL know you are coming: their camp tiles start with enemies already placed.',
    'Only one character can carry the objective token, and it fills an item slot.'
  ],
  twist: [
    'The target is not what the briefing said.',
    'The enemy you hunt is fleeing from something worse.',
    'At the target tile the group must choose between two rewards, and each leads to a different next part.',
    'A second target tile changes the mission goal halfway through.',
    'Getting there is easy. Getting back is the real mission.',
    'The person you rescue does not want to be rescued.',
    'A rival group of survivors is after the same prize.',
    'The final part reveals the SoL wanted you to succeed.',
    'Something you picked up earlier turns out to be the key to the finale.',
    'An ally from part 1 returns as an enemy in the last part.'
  ],
  finale: [
    'A fight against a strong enemy whose HP grows with the number of characters.',
    'A race back to New Haven before day 5 ends.',
    'A stealth escape where combat means failure.',
    'A choice in the debriefing that changes the success text.',
    'Holding a tile through one night.',
    'Spending gathered resources at the target to finish the job.'
  ]
};

export function rollSpark(rand = Math.random) {
  const pick = list => list[Math.floor(rand() * list.length)];
  return {
    hook: pick(SPARKS.hook),
    goal: pick(SPARKS.goal),
    complication: pick(SPARKS.complication),
    twist: pick(SPARKS.twist),
    finale: pick(SPARKS.finale)
  };
}
