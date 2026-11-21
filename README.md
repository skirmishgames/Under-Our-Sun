# Under Our Sun mission maker

A fan-made web tool for writing and printing missions for the Under Our Sun board game.

Live at [underoursun.skirmishgames.app](https://underoursun.skirmishgames.app).

## What it does

- Starts each mission from the community mission template: briefing, setup, special rules, mission goal, objectives and the two debriefings.
- Splits a mission into numbered parts, one card each, the way the game's mission decks work.
- Shows a live preview of each card. Fronts are 70 x 120 mm portrait, backs are 120 x 70 mm landscape, and the back of part 1 carries the brief info.
- Shrinks text a little when a part runs long and flags any part that still does not fit.
- Inline icons for dice and resources, such as `{green}` or `{water}`, and a `{mission}` token so part links follow the mission number.
- Your own art for fronts and backs, or one of five drawn desert scenes.
- Picture blocks for map setup diagrams.
- Prints PDF sheets at 100% scale on Letter or A4, with crop marks and mirrored backs for long-edge duplex printing.
- Prints a survivor log for roguelike play in English or German: one 135 x 100 mm card per character, four to a page.
- A mission index of all 14 official missions with premise, type and how each is built, plus community missions.
- Dispatches: new missions written for the site, marked Needs playtest or Playtested, ready to print or add to your own missions.
- A mission design guide with a spark generator for hooks, goals, complications and twists.
- A searchable rules FAQ, sorted by topic, built from the BoardGameGeek FAQ and the designer's forum answers.
- Keeps a library of missions in the browser, with JSON export and import for sharing and backups. Pictures travel inside the file.

Nothing is sent to a server. There are no accounts.

## Use it

Open the site on a phone, tablet or computer. Missions save as you type. Use "Back up all" on the Missions page now and then, because clearing browser data deletes saved missions.

To share a mission, export it from the editor and send the `.json` file. The other player imports it on the Missions page.

## Credits

Under Our Sun is designed by Maximilian Lichtner and David Poluda and published by tabletopper games ([official game page](https://tabletopper.games/under-our-sun/)). This tool is unofficial and is not endorsed by the publisher. It holds no rulebook text and no official card art. You need the game to play any mission made with it.

- Barlow and Barlow Condensed fonts, SIL Open Font License (`assets/fonts/OFL.txt`)
- jsPDF, MIT License (`vendor/jspdf-LICENSE.txt`)

Contact: games@staroversky.com

## Development

Static site with no build step.

```
python3 -m http.server 8000     # then open http://localhost:8000
node tools/stamp.js             # cache-busting version on CSS and JS links
node test/smoke.js              # Playwright smoke test (serves the site itself)
node test/smoke.js https://underoursun.skirmishgames.app/   # test the live site
```

Layout:

```
index.html          app shell
css/styles.css      site styles
js/data/schema.js   mission model, block types, icons
js/data/sample.js   sample mission
js/art.js           drawn scenes and picture handling
js/render.js        canvas card renderer, positions in millimetres
js/print.js         PDF sheets (jsPDF)
js/sheet.js         survivor log card and PDF
js/store.js         IndexedDB storage, JSON export and import
js/app.js           views and editor
assets/             fonts and icons
tools/stamp.js      cache busting
test/smoke.js       Playwright smoke test
```
