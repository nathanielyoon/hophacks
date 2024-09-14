const WORDS =
  "about|acid|acorn|acre|adapt|admit|afar|affix|again|aged|agree|ahead|aide|aisle|ajar|alarm|album|alert|alias|alley|aloe|also|alter|amend|amino|among|ample|amuse|angle|ankle|apart|apple|apron|aqua|arch|area|argue|arise|armor|aroma|array|arson|ashen|asset|atlas|atom|attic|audio|avoid|away|awful|axis|badge|bagel|baker|ball|banjo|barn|bask|bath|bean|begin|below|bench|best|bike|bird|blank|blend|blimp|blob|blurt|boat|body|boil|bolt|bony|book|boss|both|brass|bread|brim|broad|brush|buck|buggy|build|bulb|bunt|burst|busy|buyer|buzz|cabin|cache|cadet|cage|cake|call|camp|cane|cape|card|case|cause|cave|cedar|chat|chew|chip|chop|chute|cider|city|civil|clay|clerk|clip|clog|clump|coat|coil|cold|come|cone|cook|copy|cork|cost|couch|cover|cozy|cram|crew|crib|crop|crumb|cult|curl|cushy|cycle|daisy|damp|dance|darn|dash|data|dawn|deal|debt|deck|deer|defy|delay|dent|depth|derby|desk|dial|dice|dill|dime|diner|dirt|dish|ditch|dizzy|dock|dodge|doing|doll|dome|donor|door|dose|dove|down|doze|draw|dream|drip|drop|drum|duck|dude|duke|dune|dusk|duty|dwell|eager|earn|east|eats|ebony|echo|edge|edit|eject|elbow|elder|elite|elope|elude|email|emit|empty|enact|enemy|enjoy|enter|envoy|equal|erase|erode|error|erupt|essay|etch|evade|even|evil|evoke|exact|exit|extra|fable|fact|fade|faith|fall|fame|fang|farm|fault|feast|feel|femur|fend|ferry|fetch|fever|fiber|field|file|find|fire|fish|flap|flee|flip|flop|fluid|foam|focus|foil|fold|food|fork|found|foyer|fray|fresh|frill|from|fruit|fuel|fury|gain|gala|game|gate|gauge|gave|gear|gecko|geek|genre|ghost|gift|gills|give|glad|glide|glow|glue|goal|going|gold|gong|good|gown|grab|grew|grid|grow|grub|guard|guess|guide|gulp|gummy|gush|habit|halt|happy|harm|hash|hate|haven|hawk|hazy|head|hedge|hefty|help|hero|hill|hint|hobby|hold|home|honey|hope|horse|host|hotel|hour|hover|hula|hump|hung|hurt|hush|icing|icon|idea|idle|igloo|image|inch|index|inner|input|iron|issue|item|jaws|jazz|jeans|jelly|jewel|jiffy|join|joke|jolt|judge|juice|july|jump|junk|jury|just|keen|kept|kick|kilt|kind|kiss|kite|kiwi|knee|know|koala|ladle|lair|lake|lamp|land|lapel|last|late|laugh|lava|layer|lazy|leaf|left|legal|lemon|lens|lever|liar|lift|light|lily|limb|lint|lion|list|load|lock|logic|long|loop|loud|love|loyal|lucky|lung|lure|lying|lyric|magic|mail|major|make|malt|many|march|mask|math|maze|mean|media|melt|menu|merit|mesh|milk|mimic|mind|miss|mocha|model|mold|month|moon|moral|most|motor|mouth|move|mower|much|mule|mumbo|mural|muse|mute|myth|nacho|nail|name|nasty|neat|neck|need|neon|nerve|nest|never|news|next|nice|night|noble|noise|north|nose|note|novel|oasis|occur|ocean|odor|often|okay|olive|omen|omit|once|onion|only|ooze|opal|open|orbit|order|organ|other|otter|ouch|ounce|outer|oval|oven|ozone|pact|page|pair|palm|panda|paper|park|pass|path|pause|pave|payer|pear|pecan|perch|pest|petal|phone|piano|piece|pilot|pipe|pitch|pizza|play|plead|plow|plug|poach|poem|point|poker|pole|pond|pool|poppy|post|pout|power|press|prism|prune|pulp|puma|punk|puppy|purr|push|quack|query|quiz|quote|rabid|race|radio|raft|rage|rain|rake|rally|ramp|rant|rapid|rare|rash|rate|raven|real|rebel|rely|remix|renew|reply|rerun|reset|rhyme|rice|ride|rigor|ring|riot|ripen|risk|river|road|robe|rock|rogue|romp|roof|rope|rose|rover|royal|ruby|rude|ruin|rule|rural|rust|safe|sage|sail|salt|same|sand|satin|sauce|save|scan|scene|scoop|scrap|scuff|seat|sect|sedan|seek|self|send|sepia|serve|sham|shed|ship|shoe|shrug|shut|side|siege|sift|sign|silo|sing|siren|size|skate|skew|skit|slab|sled|slit|slot|slug|small|smell|smile|smog|snap|sneak|sniff|snow|snub|soap|sock|soda|soft|solar|song|soon|sort|soup|space|spew|spin|split|spot|spray|spur|squid|stay|stew|stir|stop|straw|stud|style|suds|sugar|suit|sulk|super|surf|swan|sweep|swim|swoop|syrup|table|tail|take|talk|tamer|tank|tape|tart|task|taunt|taxi|team|tell|tent|term|test|text|thaw|theme|think|thorn|throb|thud|tiara|tide|tiger|tile|time|tint|tired|title|toast|today|token|tone|tool|torch|toss|total|town|tray|tree|trim|trout|trunk|tube|tulip|tummy|tuna|turn|tusk|tutu|tweak|twin|type|uncut|undo|unit|untie|upon|upper|upset|urban|urge|usher|usual|utter|vague|valve|vapor|vast|vault|venue|verb|vest|veto|vice|video|view|viral|visor|vital|vivid|vocal|void|volt|voter|vowel|wafer|wagon|wait|wake|walk|wand|warm|wasp|watch|wave|wear|west|whale|wheel|whiff|whole|wick|width|wife|wilt|wimp|wink|wipe|wire|wish|wolf|wool|word|woven|wrap|wreck|wrist|yard|year|yelp|yield|youth|yoyo|yummy|zebra|zero|zesty|zone|zoom";
export const code = RegExp(
  `^(${WORDS})-(?!\\1)(${WORDS})-(?!\\1|\\2)(${WORDS})-(?!\\1|\\2|\\3)(${WORDS})-(?!\\1|\\2|\\3|\\4)(${WORDS})$`,
  "i",
);

export const LIST = WORDS.split("|");
const MAP: { [_: string]: number } = {};
for (let z = 0; z < LIST.length; ++z) MAP[LIST[z]] = z;
export const encode = (id: number) => {
  // process should be: if this is greater than or equal to the previous one, it's gotta shift up 1
  const a = id % 815;
  const b = Math.floor(id / 815) % 816;
  const c = Math.floor(id / 665040) % 817;
  const d = Math.floor(id / 543337680) % 818;
  const e = Math.floor(id / 444450222240) % 819;
  return `${LIST[a]}-${LIST[b]}-${LIST[c]}-${LIST[d]}-${LIST[e]}`;
};
export const decode = (words: string) => {
  words = words.toLowerCase();
  const [a, b, c, d, e] = words.split("-");
  return MAP[a] +
    MAP[b] * 815 +
    MAP[c] * 665040 +
    MAP[d] * 543337680 +
    MAP[e] * 444450222240;
};
console.log(
  [...Array.from(
    { length: 0x1000 },
    () => Math.floor(Math.random() * 0x1000000000000),
  )]
    .filter((Z) => decode(encode(Z)) !== Z),
);
