# Google player saves

Uses the named Firebase Auth app coastline-player, separate from administrator sign-in. All verified Google players can save to fishingPlayers/{uid}/saves/coastline. Security rules allow only the owner to get/create/update their document, not list other users or modify CMS settings. Rules must be compared with the live ruleset before deployment to this shared Firebase project.

Guest storage remains coastline-sport-save-v1. Account-local fallback is coastline-account-v1:{uid}; logging out restores the guest save. Guest import is explicit and non-destructive. A transaction unions fish by stable catch identity, honours and cup wins; cup reward totals are merged without duplicate award. A pending/offline indicator is not a successful sync. Transactions require an online connection. Account saves larger than 850 KB are refused with a backup warning, never silently truncated.

The data is client-authored single-player progress, not a cheat-proof competition leaderboard. No real-time multiplayer is implied. Browser cache removal only preserves data that was successfully synchronized; users can also download a JSON backup from the home screen.

Embedded play continues using the story host's island-stats bridge; it does not use independent Google storage, to prevent two save owners from overwriting each other.

New presentation settings: presentation.coverImage/title/subtitle. Region intro settings: introImage (JPG/PNG), introTitle, introText. Empty introImage uses the region artwork. Long intro copy is paginated.

Firebase references: https://firebase.google.com/docs/auth/web/google-signin and https://firebase.google.com/docs/firestore/manage-data/transactions
