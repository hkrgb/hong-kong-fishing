# Coastline promotion — 2026-09-07

The root index is now the sport edition, using a base URL so scripts, fish assets and Firebase configuration resolve identically at / and /sport/. Root admin uses the same pro Firebase document. Existing custom background URLs take precedence over the six generated assets in sport/assets; generation prompts are in sport/assets/PROMPTS.md.

Legacy entrypoints remain at legacy.html and legacy-admin.html. Original scripts/configuration and Firebase legacy document were not deleted or overwritten.

Standalone storage imports the legacy fishing bag once without deleting it. Embedded play uses the existing island-stats fishingBag/fishingProgress/certificates bridge. Coastline honours live inside fishingProgress.coastline; existing completion and certificate fields remain unchanged. Tournament rewards are first-win only, added to the host score once per session; repeated host pings do not reset the session.

The coastal artwork is fictionalized scenery; tide/weather are simulated and competitions are local challenges, not live multiplayer.
