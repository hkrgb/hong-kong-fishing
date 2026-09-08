# Fish discovery and size labels

The player catalogue shows a generic fish silhouette and no species name, scientific name, family, photograph, or source until a catch with the same stable ID exists in `save.bag`. Search applies only to unlocked species, preventing name-guess queries from revealing locked entries. The administrator catalogue is deliberately not locked. This is presentation/game progression, not encryption of the public species configuration.

Old local, cloud and embedded-story catches unlock by ID without migrating or overwriting any save. Actual image enlargement remains available after unlock. Size badges also appear in the catch book and catch details.

Size thresholds are a game convention: small <30 cm, medium 30–<80 cm, large ≥80 cm. Large silhouettes are red and larger; this does not mean rare or endangered. Difficulty, scoring, catch weight and appearance probabilities are unchanged.

Evidence-backed defaults currently cover **5 of 150 species**; the remaining 145 show `體型待核實`. See `discovery.js` for per-species source links and measurement conventions. Common length is not automatically an adult average. In particular, the contradictory common-length/maturity entries for Lateolabrax japonicus were not classified. A maximum below 30 cm establishes the small category but is not presented as a typical length. SL/FL/TL conventions are preserved in notes; these references are not Hong Kong adult population statistics.

The admin adds `adultLengthCm` and `sizeSource` fields. These override the reference category once a positive length and source are supplied. Missing values are not inferred from configured kilograms or family. Filling and reviewing the remaining adult-length data is still outstanding; no fabricated values have been added.

Cloud drift and opacity, and the water ripple displacement/contrast, are strengthened. Decorative animations still pause in menus and respect the system reduced-motion preference. No new bitmap assets or Firebase writes were required.
