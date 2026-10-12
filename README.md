# Las Vegas Events

Event feed and calendar for Las Vegas: Sphere, T-Mobile Arena, Allegiant
Stadium, the MGM Grand Garden Arena, Michelob ULTRA Arena, the resorts'
showrooms from Dolby Live and the Colosseum to Voltaire, and beyond the Strip
the Thomas & Mack Center, Las Vegas Ballpark, Lee's Family Forum, Cashman
Field, the Orleans Arena, the Motor Speedway, the Smith Center, House of Blues
and Brooklyn Bowl — with the home teams' seasons (Golden Knights, Raiders,
Aces, Aviators, Silver Knights, UNLV football and basketball, Lights FC) in a
Teams view.

Live at **https://lasvegas.here.events/** once the domain is wired (GitHub
Pages, built by the Actions workflow once a day at noon Pacific).

A city on the lqa-events codebase, after Everett, Chicago and the 2026-10-11
batch: everything that makes this Las Vegas's is `site/city.js` (every team,
venue, type, default, share-code registry and string), `site/index.html`,
`scripts/fetch-events.mjs` (the sources), `site/embed.js`, `outlook.json`,
`scripts/data/postseason.json`, `channels.json`, the manifest and icons (a
neon-lit Sphere, rendered from `favicon.svg`). Everything else is lqa-events'
own, byte for byte — copy from there, never edit here.

## Embed

```html
<div id="lasvegas-events"></div>
<script src="https://lasvegas.here.events/embed.js" data-max="8" defer></script>
```

## Sources

- **Ticketmaster Discovery API** — every room by its venue id (every page,
  one call a second): 25 rooms, from Allegiant Stadium to the 1,000-seat
  Voltaire. There is no city sweep — the Strip's nightly production shows
  would exhaust the API's thousand-event cap in days; the daily shows
  (Sphere's film and its Wizard of Oz run), the hotel bundles, parking and
  tours are dropped per room (`tm.exclude`). Church events are left out
  (`isChurch`).
- **Seasons** — the NHL's own api-web feed for the Golden Knights; ESPN for
  the Raiders, the Aces, both UNLV programs and Lights FC (USL Championship);
  MLB's stats API for the Aviators (Triple-A, sportId 11); the AHL's
  HockeyTech feed for the Silver Knights (`scripts/schedules.mjs`, shared with
  lqa). The Aviators, Rebels football and Lights FC have no ticket feed here,
  so their home dates are injected from the league schedules (city.js
  `inject`).

Next to add: the rooms whose shows Ticketmaster never lists (the Wynn and
Bellagio showrooms, the downtown and Fremont Street stages, the Westgate), the
fight cards' own promoters, the National Finals Rodeo and the conventions.

## Local run

```sh
cp .env.example .env   # TICKETMASTER_API_KEY=…
ALLOW_NO_ARCHIVE=1 node scripts/fetch-events.mjs   # ALLOW_NO_ARCHIVE only until the site has published once
node --test scripts/*.test.mjs
```
