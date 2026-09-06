# 潮境 · 香港海釣

Standalone 16:9 fishing edition at `/sport/`. Uses the existing photographic rod and fish art. Original and `/pro/` editions are preserved.

## Play

- Click/tap water to aim left or right. Hold the casting button to charge distance, release to cast; a quick tap uses medium power.
- Watch the magnified float: tentative dips precede a full bite. Strike within the 4.5-second bite window.
- Hold to reel and release to reduce line tension. Fish surge periodically. Sustained red tension breaks the line.
- Menus and hidden tabs pause simulation and tournament timers.
- Catch album and medals use pagination; fish pictures open a large detail view.

## Configuration and storage

Reads the existing `/pro/config.json` fallback and `miniGames/hongKongFishingPro` Firestore settings. Fish, areas, image URLs and tournament definitions can be managed in `../pro/admin.html` with the existing Google login. No Firebase rule changes needed. Weather and tide are simulated game conditions, not live observations or tide forecasts.

Progress is local to this browser under `coastline-sport-save-v1`; first launch imports existing pro catches as a copy. Tournament rewards are granted once per tournament in this save. This is a single-player game, not a server-verified competitive leaderboard. Cloud player saves are not implemented.

Embedding sends `island-stats` with `fishingSportBag` and `fishingSportMedals` on confirmed exit. It does not replace the host's balance. Host support for these new fields and competition score settlement must be implemented before integrating this edition into the story.
