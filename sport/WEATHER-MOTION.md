# Living coast update

The main index and sport/index use separate right-hand/rod and left-hand/knob sprites. The crank endpoint and hand share an elliptical orbit; the gearbox stays fixed and the rotor highlight moves only while reeling. Releasing input eases the crank to rest. Modal dialogs and hidden pages pause motion and gameplay. Fish have eased speed, continuous body/tail motion, soft shore avoidance, separation, and a slow feeding approach. Clouds, water glints and rain are lightweight Canvas layers. Reduced-motion mode disables decorative cloud/water travel and rain, retaining essential fishing feedback. The 1280×720 stage and fullscreen black letterboxing are unchanged.

## Actual observations versus game simulation

- Source: Hong Kong Observatory Open Data, https://www.hko.gov.hk/en/weatherAPI/doc/files/HKO_Open_Data_API_Documentation.pdf
- `https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=tc`: temperature, station name, observation timestamp, Hong Kong weather icon.
- `https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=fnd&lang=tc`: `seaTemp` is an observation bundled with the forecast response, not the forecast air temperature.
- Weather icon definitions: https://www.hko.gov.hk/textonly/v2/explain/wxicon_e.htm
- Default air reference stations: Cheung Chau → 長洲; Lantau → 赤鱲角; Ninepins → 西貢; Po Toi → 赤柱. These are reference stations, not measurements at the fishing spot. Unknown areas use 香港天文台. The station is always displayed.
- Sea water displays the API's actual station (currently 北角) and timestamp. It is **not** advertised as real-time water temperature for all four fishing sites.
- Air older than 2 hours and sea observations older than 48 hours are unavailable; future timestamps over 10 minutes ahead are rejected. No null-to-zero conversion or invented water temperature.
- Requests are deduplicated and refreshed at most every 10 minutes automatically, with a manual refresh. Requests time out after 7 seconds. Valid last observations can survive a brief outage within their freshness limits. Session cache is separate from player saves.
- Only public HKO requests are added. No GPS, API keys, player IDs, new Firebase collection, or authentication changes. Browser network failure does not block play.
- Rain/cloud/night overlays are artistic impressions of the Hong Kong-wide weather report, not live scenery. Simulated tides, fish difficulty, scoring and tournaments are unchanged. Not for navigation or safety decisions.

## Verification

Local and mobile viewport browser checks cover reeling/release, menu pause, smooth bounded swimming, feeding completion, weather mock success, expired/future observations, offline fallback, request deduplication, readable non-scrolling weather dialog, and preserved saves. Native fullscreen regression covers 16:9 on wide, portrait and landscape viewports. Live HKO fetches were also checked in Chrome for browser CORS support. Physical iOS/Android devices are not claimed as tested.

New bitmap assets and built-in ImageGen prompt history: `assets/motion/manifest.json`. PNG working masters are local; alpha-preserving WebP assets are published. Existing artwork is retained unchanged.
