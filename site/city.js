// The city — every fact that makes this calendar Las Vegas's rather than
// another town's, in one place (2026-10-11: the fifteenth city on lqa-events,
// after Everett, Chicago and the day's batch). The browser (filter.js,
// app.js) and the build (scripts/*.mjs) both read it; nothing else names a
// venue or a team. The shared files (app.js, filter.js, styles.css bar its
// --v-* hues, scripts/*.mjs bar fetch-events.mjs and sources.mjs) are
// lqa-events' own, byte for byte — see README "Sister sites".
//
// Loaded before filter.js (a plain script, so the tests can share it): it
// sets globalThis.LQACity (the name is the shared code's, not the city's).
(function (global) {
  'use strict';

  // The home teams, matched on the event title whatever the venue. Order =
  // the Teams strip, left to right; the first match wins (app.js teamFor),
  // so the Rebels' football pattern steps aside for a basketball title.
  // Per team:
  //   re        the title match
  //   venue     the home building; schedule = the club's own schedule page
  //   sport     keys the strip icon (app.js SPORT_ICONS), the game clock,
  //             the leader categories
  //   colors    [primary, accent] — the season calendar's home cells and
  //             card frames
  //   espn      ESPN's sport/league/team id — the Raiders, the Aces, both
  //             UNLV programs and Lights FC are on ESPN (season, form, news);
  //             the Golden Knights' season comes from the NHL's own api-web
  //             feed (season kind 'nhl', as Chicago's Blackhawks), the
  //             Aviators' from MLB's stats API (Triple-A is on it, sportId
  //             11) and the Silver Knights' from the AHL's HockeyTech feed
  //             (the adapter is Everett's WHL one)
  //   inject    a club whose home dates no ticket feed lists: the league's
  //             schedule puts them on the calendar under this ticket link
  //   club      the club's name on Ticketmaster; news the outlets' feeds;
  //             wiki the article (teamPage: college seasons are titled
  //             "2026 UNLV Rebels football team"); opens when the season
  //             usually starts
  var AHL = { league: 'ahl', key: '50c2cd9b5e18e390' }; // the AHL's HockeyTech feed (client code and the key theahl.com's own pages carry; San Diego's Gulls read with it)
  var TEAMS = [
    // Vegas Golden Knights, NHL, T-Mobile Arena — Ticketmaster lists the home games
    { slug: 'goldenknights', label: 'Golden Knights', re: /golden knights/i, sport: 'hockey', venue: 'T-Mobile Arena', colors: ['#b4975a', '#333f42'],
      espn: { sport: 'hockey', league: 'nhl', id: '37' }, season: { kind: 'nhl', abbrev: 'VGK' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/vgk.png', schedule: 'https://www.nhl.com/goldenknights/schedule',
      club: 'Vegas Golden Knights', opens: 'early October', wiki: { title: 'Vegas Golden Knights' } },
    // Las Vegas Raiders, NFL, Allegiant Stadium — Ticketmaster lists the home games
    { slug: 'raiders', label: 'Raiders', re: /\braiders\b/i, sport: 'football', venue: 'Allegiant Stadium', colors: ['#000000', '#a5acaf'],
      espn: { sport: 'football', league: 'nfl', id: '13' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/lv.png', schedule: 'https://www.raiders.com/schedule/',
      club: 'Las Vegas Raiders', opens: 'September', wiki: { title: 'Las Vegas Raiders', startYear: true },
      news: [['https://www.raiders.com/rss/news', 'Raiders.com']] },
    // Las Vegas Aces, WNBA, Michelob ULTRA Arena at Mandalay Bay
    { slug: 'aces', label: 'Aces', re: /\baces\b/i, sport: 'basketball', venue: 'Michelob ULTRA Arena', colors: ['#000000', '#c8102e'],
      espn: { sport: 'basketball', league: 'wnba', id: '17' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/wnba/500/lv.png', schedule: 'https://aces.wnba.com/schedule/',
      club: 'Las Vegas Aces', opens: 'May', wiki: { title: 'Las Vegas Aces' } },
    // Las Vegas Aviators, Triple-A Pacific Coast League (Athletics affiliate), Las Vegas Ballpark in Summerlin
    { slug: 'aviators', label: 'Aviators', name: 'Las Vegas Aviators', abbr: 'LV', re: /\baviators\b/i, sport: 'baseball', venue: 'Las Vegas Ballpark', colors: ['#1b365d', '#f26f21'],
      season: { kind: 'mlb', id: 400, sportId: 11 }, form: { kind: 'milb', id: 400, league: 112, leagueName: 'Pacific Coast League' },
      inject: { url: 'https://www.milb.com/las-vegas/tickets' }, // Ticketmaster carries only a handful of ballpark dates; the league's schedule supplies the home stands
      logo: 'https://www.mlbstatic.com/team-logos/400.svg', schedule: 'https://www.milb.com/las-vegas/schedule',
      club: 'Las Vegas Aviators', opens: 'late March', wiki: { title: 'Las Vegas Aviators', club: true },
      news: [['https://www.milb.com/las-vegas/feeds/news/rss.xml', 'MiLB.com']] },
    // Henderson Silver Knights, AHL (Golden Knights affiliate), Lee's Family Forum — Ticketmaster lists the home games
    { slug: 'silverknights', label: 'Silver Knights', name: 'Henderson Silver Knights', abbr: 'HSK', re: /silver knights/i, sport: 'hockey', venue: "Lee's Family Forum", colors: ['#8a8d8f', '#b4975a'],
      season: { kind: 'hockeytech', league: AHL.league, key: AHL.key, id: 437, leagueName: 'AHL' }, form: { kind: 'hockeytech', league: AHL.league, key: AHL.key, id: 437 },
      logo: 'https://assets.leaguestat.com/ahl/logos/437.png', schedule: 'https://hendersonsilverknights.com/schedule',
      club: 'Henderson Silver Knights', opens: 'October', wiki: { title: 'Henderson Silver Knights', club: true } },
    // UNLV Rebels football, Mountain West, Allegiant Stadium. Ticketmaster's
    // stadium listing carries no college Saturdays, so the schedule is
    // injected (the Husky Stadium pattern in lqa)
    { slug: 'rebels', label: 'Rebels', name: 'UNLV Rebels', abbr: 'UNLV', re: /unlv(?!.*basketball)|rebels football/i, sport: 'football', venue: 'Allegiant Stadium', colors: ['#cf0a2c', '#666666'],
      espn: { sport: 'football', league: 'college-football', id: '2439' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      inject: { url: 'https://unlvrebels.com/sports/football/tickets' },
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2439.png', schedule: 'https://unlvrebels.com/sports/football/schedule',
      club: 'UNLV Rebels Football', opens: 'late August', wiki: { title: 'UNLV Rebels football', teamPage: true } },
    // UNLV Runnin' Rebels, men's basketball, Thomas & Mack Center — Ticketmaster lists the home games
    { slug: 'runninrebels', label: "Runnin' Rebels", name: "UNLV Runnin' Rebels", abbr: 'UNLV', re: /unlv.*basketball|runnin'? rebels/i, sport: 'basketball', venue: 'Thomas & Mack Center', colors: ['#cf0a2c', '#000000'],
      espn: { sport: 'basketball', league: 'mens-college-basketball', id: '2439' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2439.png', schedule: 'https://unlvrebels.com/sports/mens-basketball/schedule',
      club: "UNLV Runnin' Rebels Men's Basketball", opens: 'early November', wiki: { title: "UNLV Runnin' Rebels basketball", teamPage: true } },
    // Las Vegas Lights FC, USL Championship, Cashman Field — no ticket feed lists the matches, so the schedule is injected
    { slug: 'lights', label: 'Lights FC', name: 'Las Vegas Lights FC', abbr: 'LV', re: /lights fc/i, sport: 'soccer', venue: 'Cashman Field', colors: ['#1e4a9c', '#ff5a9e'],
      espn: { sport: 'soccer', league: 'usa.usl.1', id: '18987' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      inject: { url: 'https://www.lasvegaslightsfc.com/tickets' },
      logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/18987.png', schedule: 'https://www.lasvegaslightsfc.com/schedule',
      club: 'Las Vegas Lights FC', opens: 'March', wiki: { title: 'Las Vegas Lights FC' } },
  ];

  // The venues, one record each — the Strip's arenas, stadium and
  // showrooms first by size, then the rooms beyond it. Per venue:
  //   capacity how many people the place holds
  //   area     'town' for the places off the Strip — the campus, Summerlin,
  //            Henderson, downtown, the Speedway (the panel's second
  //            group); absent = on the Strip
  //   type     the event type when the title decides nothing
  //   cssVar   the hue styles.css sets for it (dark block --v-*); color
  //            the same hue as a value, for the series graph
  //   url      the venue's own events listing — not a ticket vendor
  //   icon     a mark for listings without a team crest
  //   tm       its Ticketmaster Discovery listing (fetch-events.mjs reads
  //            the venue by id — every page). There is NO city sweep here:
  //            the API stops a query at its thousandth event, and the
  //            Strip's nightly production shows would fill that in days.
  //            exclude drops the daily shows and the hotel bundles the
  //            rooms list beside their concerts (Sphere's film and its
  //            Wizard of Oz run, "Hotel Packages", parking, tours)
  //   alias    the other spellings the feeds use for it, folded to this name
  // No festivals yet, so the panel's Festivals group folds away (app.js).
  var VENUES = {
    // --- The Strip: Sphere, T-Mobile Arena, Allegiant Stadium, the Grand Garden, Mandalay Bay's arena, the resorts' showrooms ---
    'Sphere': {
      capacity: 18600,
      type: 'concert',
      cssVar: '--v-sphere',
      color: '#ea8686',
      url: 'https://www.thesphere.com/shows',
      icon: 'https://www.google.com/s2/favicons?domain=www.thesphere.com&sz=128',
      tm: { id: 'KovZ917Atbr', match: 'sphere', fallbackUrl: 'https://www.thesphere.com/shows', exclude: /wizard of oz|postcard from earth|sphere experience|suite|parking|\d-day ticket|cannot split/i },
      alias: /^sphere\b|t-mobile zone at sphere/i,
    },
    'T-Mobile Arena': {
      capacity: 20000,
      type: 'sports',
      cssVar: '--v-tmobilearena',
      color: '#86eaa3',
      url: 'https://www.t-mobilearena.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.t-mobilearena.com&sz=128',
      tm: { id: 'KovZpZAIIIdA', match: 't-mobile arena', fallbackUrl: 'https://www.t-mobilearena.com/events', exclude: /parking|suite|hotel packages|\btours?\b/i },
      alias: /t-?mobile arena/i,
    },
    'Allegiant Stadium': {
      capacity: 65000,
      type: 'sports',
      cssVar: '--v-allegiant',
      color: '#c086ea',
      url: 'https://www.allegiantstadium.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.allegiantstadium.com&sz=128',
      tm: { id: 'KovZ917Ax7n', match: 'allegiant', fallbackUrl: 'https://www.allegiantstadium.com/events', exclude: /\btours?\b|hotel packages|parking|tailgate|suite/i },
      alias: /allegiant stadium/i,
    },
    'MGM Grand Garden Arena': {
      capacity: 16800,
      type: 'concert',
      cssVar: '--v-grandgarden',
      color: '#eadd86',
      url: 'https://mgmgrand.mgmresorts.com/en/entertainment.html',
      icon: 'https://www.google.com/s2/favicons?domain=mgmgrand.mgmresorts.com&sz=128',
      tm: { id: 'KovZpZAJFJaA', match: 'garden arena', fallbackUrl: 'https://mgmgrand.mgmresorts.com/en/entertainment.html', exclude: /hotel packages|parking/i },
      alias: /grand garden/i,
    },
    'Michelob ULTRA Arena': {
      capacity: 12000,
      type: 'sports',
      cssVar: '--v-michelob',
      color: '#86d9ea',
      url: 'https://mandalaybay.mgmresorts.com/en/entertainment.html',
      icon: 'https://www.google.com/s2/favicons?domain=mandalaybay.mgmresorts.com&sz=128',
      tm: { id: 'KovZpZAJadaA', match: 'michelob', fallbackUrl: 'https://mandalaybay.mgmresorts.com/en/entertainment.html', exclude: /hotel packages|parking/i },
      alias: /michelob ultra arena|mandalay bay events center/i,
    },
    'Dolby Live': {
      capacity: 5200,
      type: 'concert',
      cssVar: '--v-dolby',
      color: '#ea86bc',
      url: 'https://parkmgm.mgmresorts.com/en/entertainment.html',
      icon: 'https://www.google.com/s2/favicons?domain=parkmgm.mgmresorts.com&sz=128',
      tm: { id: 'KovZ917A5L7', match: 'dolby live', fallbackUrl: 'https://parkmgm.mgmresorts.com/en/entertainment.html', exclude: /hotel packages/i },
      alias: /dolby live|park theater/i,
    },
    'The Colosseum': {
      capacity: 4300,
      type: 'concert',
      cssVar: '--v-colosseum',
      color: '#9fea86',
      url: 'https://www.caesars.com/caesars-palace/shows',
      icon: 'https://www.google.com/s2/favicons?domain=www.caesars.com&sz=128',
      tm: { id: 'KovZ917A2m7', match: 'colosseum', fallbackUrl: 'https://www.caesars.com/caesars-palace/shows', exclude: /hotel packages/i },
      alias: /colosseum/i,
    },
    'PH Live': {
      capacity: 7000,
      type: 'concert',
      cssVar: '--v-phlive',
      color: '#8a86ea',
      url: 'https://www.caesars.com/planet-hollywood/shows',
      icon: 'https://www.google.com/s2/favicons?domain=www.caesars.com&sz=128',
      tm: { id: 'KovZpZAJalEA', match: 'ph live', fallbackUrl: 'https://www.caesars.com/planet-hollywood/shows', exclude: /hotel packages/i },
      alias: /ph live|bakkt theater|zappos theater/i,
    },
    'Resorts World Theatre': {
      capacity: 5000,
      type: 'concert',
      cssVar: '--v-resortsworld',
      color: '#eaa786',
      url: 'https://www.rwlasvegas.com/entertainment/',
      icon: 'https://www.google.com/s2/favicons?domain=www.rwlasvegas.com&sz=128',
      tm: { id: 'Z7r9jZa7bj', match: 'resorts world', fallbackUrl: 'https://www.rwlasvegas.com/entertainment/', exclude: /hotel packages/i },
      alias: /resorts world/i,
    },
    'Fontainebleau': {
      capacity: 3800,
      type: 'concert',
      cssVar: '--v-fontainebleau',
      color: '#86eac4',
      url: 'https://www.fontainebleaulasvegas.com/entertainment',
      icon: 'https://www.google.com/s2/favicons?domain=www.fontainebleaulasvegas.com&sz=128',
      tm: { id: 'KovZ917AcIV', match: 'fontainebleau', fallbackUrl: 'https://www.fontainebleaulasvegas.com/entertainment', exclude: /mind2mind|hotel packages|dinner|brunch/i },
      alias: /fontainebleau|bleaulive/i,
    },
    'The Chelsea': {
      capacity: 3200,
      type: 'concert',
      cssVar: '--v-chelsea',
      color: '#e186ea',
      url: 'https://www.cosmopolitanlasvegas.com/entertainment',
      icon: 'https://www.google.com/s2/favicons?domain=www.cosmopolitanlasvegas.com&sz=128',
      tm: { id: 'KovZpZAJAJeA', match: 'cosmopolitan', fallbackUrl: 'https://www.cosmopolitanlasvegas.com/entertainment', exclude: /hotel packages/i },
      alias: /the chelsea|cosmopolitan of las vegas/i,
    },
    'Virgin Theater': {
      capacity: 4500,
      type: 'concert',
      cssVar: '--v-virgin',
      color: '#d5ea86',
      url: 'https://virginhotelslv.com/entertainment/',
      icon: 'https://www.google.com/s2/favicons?domain=virginhotelslv.com&sz=128',
      tm: { id: 'KovZ917AJEB', match: 'virgin', fallbackUrl: 'https://virginhotelslv.com/entertainment/', exclude: /hotel packages/i },
      alias: /theater at virgin|the joint/i,
    },
    'Encore Theater': {
      capacity: 1480,
      type: 'concert',
      cssVar: '--v-encore',
      color: '#86b7ea',
      url: 'https://www.wynnlasvegas.com/entertainment',
      icon: 'https://www.google.com/s2/favicons?domain=www.wynnlasvegas.com&sz=128',
      tm: { id: 'KovZpa30pe', match: 'encore theater', fallbackUrl: 'https://www.wynnlasvegas.com/entertainment', exclude: /hotel packages/i },
      alias: /encore theater/i,
    },
    'The Venetian Theatre': {
      capacity: 1800,
      type: 'concert',
      cssVar: '--v-venetian',
      color: '#ea869a',
      url: 'https://www.venetianlasvegas.com/entertainment.html',
      icon: 'https://www.google.com/s2/favicons?domain=www.venetianlasvegas.com&sz=128',
      tm: { id: 'KovZpZAF6vnA', match: 'venetian theatre', fallbackUrl: 'https://www.venetianlasvegas.com/entertainment.html', exclude: /hotel packages/i },
      alias: /venetian theatre/i,
    },
    'Pearl Concert Theater': {
      capacity: 2500,
      type: 'concert',
      cssVar: '--v-pearl',
      color: '#86ea8e',
      url: 'https://www.palms.com/entertainment',
      icon: 'https://www.google.com/s2/favicons?domain=www.palms.com&sz=128',
      tm: { id: 'KovZpaKAZe', match: 'pearl', fallbackUrl: 'https://www.palms.com/entertainment', exclude: /hotel packages/i },
      alias: /pearl concert theater/i,
    },
    'Voltaire': {
      capacity: 1000,
      type: 'concert',
      cssVar: '--v-voltaire',
      color: '#ab86ea',
      url: 'https://www.voltairelv.com/',
      icon: 'https://www.google.com/s2/favicons?domain=www.voltairelv.com&sz=128',
      tm: { id: 'KovZ917AcQF', match: 'voltaire', fallbackUrl: 'https://www.voltairelv.com/', exclude: /hotel packages/i },
      alias: /voltaire/i,
    },
    // --- Beyond the Strip (`area: 'town'`): the UNLV campus, Summerlin's ballpark, Henderson's arena, downtown, the Orleans, the Speedway, the Smith Center, the Mandalay Bay and Linq music rooms ---
    'Thomas & Mack Center': {
      area: 'town',
      capacity: 18000,
      type: 'sports',
      cssVar: '--v-thomasmack',
      color: '#eac886',
      url: 'https://www.thomasandmack.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.thomasandmack.com&sz=128',
      tm: { id: 'KovZpZA1e1JA', match: 'thomas', fallbackUrl: 'https://www.thomasandmack.com/events', exclude: /parking/i },
      alias: /thomas (&|and) mack/i,
    },
    'Las Vegas Ballpark': {
      area: 'town',
      capacity: 10000,
      type: 'sports',
      cssVar: '--v-ballpark',
      color: '#86eae6',
      url: 'https://www.milb.com/las-vegas/schedule',
      icon: 'https://www.google.com/s2/favicons?domain=www.milb.com&sz=128',
      tm: { id: 'KovZ917ALsI', match: 'ballpark', fallbackUrl: 'https://www.milb.com/las-vegas/schedule', exclude: /parking/i },
      alias: /las vegas ballpark/i,
    },
    "Lee's Family Forum": {
      area: 'town',
      capacity: 6000,
      type: 'sports',
      cssVar: '--v-leesforum',
      color: '#ea86d0',
      url: 'https://www.leesfamilyforum.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.leesfamilyforum.com&sz=128',
      tm: { id: 'KovZ917AIKQ', match: "lee's family forum", fallbackUrl: 'https://www.leesfamilyforum.com/events', exclude: /parking/i },
      alias: /lee'?s family forum|dollar loan center/i,
    },
    'Cashman Field': {
      area: 'town',
      capacity: 9334,
      type: 'sports',
      cssVar: '--v-cashman',
      color: '#b3ea86',
      url: 'https://www.lasvegaslightsfc.com/schedule',
      icon: 'https://www.google.com/s2/favicons?domain=www.lasvegaslightsfc.com&sz=128',
      tm: { id: 'KovZpZAEk7nA', match: 'cashman', fallbackUrl: 'https://www.lasvegaslightsfc.com/schedule', exclude: /parking/i },
      alias: /cashman field/i,
    },
    'Orleans Arena': {
      area: 'town',
      capacity: 9500,
      type: 'sports',
      cssVar: '--v-orleans',
      color: '#8696ea',
      url: 'https://www.orleansarena.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.orleansarena.com&sz=128',
      tm: { id: 'KovZpZA1e7IA', match: 'orleans arena', fallbackUrl: 'https://www.orleansarena.com/events', exclude: /parking|suite/i },
      alias: /orleans arena/i,
    },
    'Las Vegas Motor Speedway': {
      area: 'town',
      capacity: 80000,
      type: 'sports',
      cssVar: '--v-speedway',
      color: '#ea9286',
      url: 'https://www.lvms.com/events/',
      icon: 'https://www.google.com/s2/favicons?domain=www.lvms.com&sz=128',
      tm: { id: 'KovZpaKuYe', match: 'motor speedway', fallbackUrl: 'https://www.lvms.com/events/', exclude: /parking|camping|shuttle|rv\b/i },
      alias: /las vegas motor speedway/i,
    },
    'Reynolds Hall': {
      area: 'town',
      capacity: 2050,
      type: 'arts',
      cssVar: '--v-reynolds',
      color: '#86eab0',
      url: 'https://www.thesmithcenter.com/events/',
      icon: 'https://www.google.com/s2/favicons?domain=www.thesmithcenter.com&sz=128',
      tm: { id: 'Z7r9jZadyb', match: 'reynolds hall', fallbackUrl: 'https://www.thesmithcenter.com/events/' },
      alias: /reynolds hall|smith center/i,
    },
    'House of Blues': {
      area: 'town',
      capacity: 1800,
      type: 'concert',
      cssVar: '--v-hob',
      color: '#cd86ea',
      url: 'https://www.houseofblues.com/lasvegas',
      icon: 'https://www.google.com/s2/favicons?domain=www.houseofblues.com&sz=128',
      tm: { id: 'KovZpZA7klAA', match: 'house of blues las vegas', fallbackUrl: 'https://www.houseofblues.com/lasvegas' },
      alias: /^house of blues( las vegas)?\s*$/i,
    },
    'Brooklyn Bowl': {
      area: 'town',
      capacity: 2000,
      type: 'concert',
      cssVar: '--v-brooklynbowl',
      color: '#e9ea86',
      url: 'https://www.brooklynbowl.com/las-vegas/',
      icon: 'https://www.google.com/s2/favicons?domain=www.brooklynbowl.com&sz=128',
      tm: { id: 'KovZpZAIeldA', match: 'brooklyn bowl', fallbackUrl: 'https://www.brooklynbowl.com/las-vegas/' },
      alias: /brooklyn bowl/i,
    },
  };

  // The usual view: every room on — nothing here lists nightly bar programs
  var DEFAULT_ON = ['Sphere', 'T-Mobile Arena', 'Allegiant Stadium', 'MGM Grand Garden Arena', 'Michelob ULTRA Arena', 'Dolby Live', 'The Colosseum', 'PH Live', 'Resorts World Theatre', 'Fontainebleau', 'The Chelsea', 'Virgin Theater', 'Encore Theater', 'The Venetian Theatre', 'Pearl Concert Theater', 'Voltaire', 'Thomas & Mack Center', 'Las Vegas Ballpark', "Lee's Family Forum", 'Cashman Field', 'Orleans Arena', 'Las Vegas Motor Speedway', 'Reynolds Hall', 'House of Blues', 'Brooklyn Bowl'];
  var DEFAULT_OFF = [];
  var PREFS_KNOWN_FROM = null; // no default-off venue yet, so nothing for saved prefs to be told about

  // Event types: every event lands in exactly one, from its flags, title,
  // then venue. The rows the panel shows, in order.
  var TYPES = [
    { key: 'concert', label: 'Concerts', title: 'Live music — the residencies, the arena tours, the showrooms and the clubs' },
    { key: 'sports', label: 'Sports', title: 'Golden Knights, Raiders, Aces, Aviators, Silver Knights, Rebels and Lights home games, fights, rodeo and race weekends' },
    { key: 'arts', label: 'Arts & Theater', title: 'The Smith Center, comedy, magic, dance' },
    { key: 'community', label: 'Community', title: 'Festivals, conventions, family days' },
  ];
  var MOVIE_VENUE = null; // no cinema here

  // Share codes (?f=CODE): REGISTRY is every filterable key in a fixed
  // order and a code is a bitmask over it, so the list is APPEND-ONLY —
  // adding an entry adds a bit and every existing code keeps meaning what
  // it meant; removing or reordering one changes every link out there.
  // 41 slots from the first build: 8 base-36 digits.
  var CODE_LENGTH = 8;
  var REGISTRY = [
    ['venue', 'Sphere'], ['venue', 'T-Mobile Arena'], ['venue', 'Allegiant Stadium'], ['venue', 'MGM Grand Garden Arena'], ['venue', 'Michelob ULTRA Arena'], ['venue', 'Dolby Live'], ['venue', 'The Colosseum'], ['venue', 'PH Live'], ['venue', 'Resorts World Theatre'], ['venue', 'Fontainebleau'], ['venue', 'The Chelsea'], ['venue', 'Virgin Theater'], ['venue', 'Encore Theater'], ['venue', 'The Venetian Theatre'], ['venue', 'Pearl Concert Theater'], ['venue', 'Voltaire'], ['venue', 'Thomas & Mack Center'], ['venue', 'Las Vegas Ballpark'], ['venue', "Lee's Family Forum"], ['venue', 'Cashman Field'], ['venue', 'Orleans Arena'], ['venue', 'Las Vegas Motor Speedway'], ['venue', 'Reynolds Hall'], ['venue', 'House of Blues'], ['venue', 'Brooklyn Bowl'],
    ['badge', 'concert'], ['badge', 'sports'], ['badge', 'arts'], ['badge', 'community'],
    ['team', 'goldenknights'], ['team', 'raiders'], ['team', 'aces'], ['team', 'aviators'], ['team', 'silverknights'], ['team', 'rebels'], ['team', 'runninrebels'], ['team', 'lights'],
    ['cap', 'stadium'], ['cap', 'arena'], ['cap', 'hall'], ['cap', 'room'],
  ];

  // The words the page uses for the place
  var WORDS = {
    teamCity: 'Las Vegas', // the board drops it from the clubs' names ("Las Vegas Raiders" → Raiders; the Golden Knights and the Silver Knights keep theirs)
    presetDefault: 'Every room — Sphere, the arenas, the stadium, the showrooms on the Strip and the places beyond it — every team and type',
    presetNeighborhood: 'The Strip only',
    presetBig: 'Only the places that hold 2,000 or more — Sphere, the arenas, the stadium, the Speedway and the big showrooms',
    phrases: { all: 'Showing everything.', none: 'Showing nothing yet — open Filter and pick some venues.', neighborhood: 'Showing the Strip only.', big: 'Showing the big rooms only — Sphere, the arenas, the stadium, the Speedway and the big showrooms.' },
  };

  global.LQACity = {
    key: 'lasvegas',
    name: 'Las Vegas',
    site: 'https://lasvegas.here.events/',
    userAgent: 'Mozilla/5.0 (compatible; lasvegas-events/1.0; +https://lasvegas.here.events/)',
    tz: 'America/Los_Angeles', tzName: 'Pacific', // the city's time zone: the ICS feed's TZID, the game clocks, the poster's footer
    // the calendar feed's header; the UID domain never changes (changing it
    // re-creates every event in subscribers' calendars)
    ics: { name: 'Las Vegas Events', short: 'Las Vegas Events', teams: 'Las Vegas home teams — every season', prodid: '-//here.events//lasvegas-events//EN', uidDomain: 'fosdal.net', // the UID domain the whole family issues (the shared ics test pins it)
      desc: 'Upcoming events around Las Vegas\\, NV — Sphere\\, T-Mobile Arena\\, Allegiant Stadium\\, the showrooms on the Strip and the rooms beyond it' },
    teams: TEAMS,
    venues: VENUES,
    defaultOn: DEFAULT_ON,
    defaultOff: DEFAULT_OFF,
    prefsKnownFrom: PREFS_KNOWN_FROM,
    types: TYPES,
    movieVenue: MOVIE_VENUE,
    groundsVenue: null, // every listing is read by room, so nothing arrives under a name city.js lacks
    codeLength: CODE_LENGTH,
    registry: REGISTRY,
    words: WORDS,
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
