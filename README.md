HarbuPlayer

HarbuPlayer is a lightweight Android friendly web based audio player built for personal offline music libraries.

The app lets you add individual audio files or entire folders, stores your music locally in IndexedDB, reads basic ID3 metadata, shows album artwork when available, and supports playback directly from the browser or as an installable PWA.

Features

* Add music from files or folders
* Local library stored on device
* Offline friendly PWA setup
* Album, artist, favorites and search views
* Collapsible album and artist groups
* Embedded artwork support
* Automatic artwork lookup via iTunes Search API
* Mini player and full screen player
* Shuffle, repeat, seek and volume controls
* Android Media Session support for lock screen controls
* Dark mode support
* Mobile first UI with safe area handling

Tech

HarbuPlayer is built as a single HTML file using vanilla JavaScript, CSS and browser APIs:

* IndexedDB
* File System Access API
* HTML5 Audio
* Media Session API
* Progressive Web App manifest
* Service Worker support

Notes

This project is designed as a personal music player experiment, focused on keeping things simple, fast and device local. No accounts, no streaming service, no unnecessary backend. Just your music, stored and played from your own device.

HarbuZoo (spil)

zookeeper.html is a small pixel-art match-3 animal game in wacky Japan style (maneki-neko, tanuki, kitsune, panda, kappa, tako and hiyoko), written in the same single file style as the player. Open /zookeeper.html on a phone and play directly in the browser.

Map and progression

* A randomly generated mountain road with 30 level dots, drawn as pixel art
* A silly little car drives from dot to dot when you clear a level
* Up to 3 stars per level, progress and stars stored locally
* The road layout is generated from a seed stored with the save, so it stays yours

Levels

* Every level has a goal: collect X of one to three animals before the time runs out
* Swipe or tap two neighbouring animals to swap them, 3 in a row clears them
* 4 in a row creates a KATANA that clears a whole row or column
* L or T shapes create a BAKUDAN that blows up an area
* 5 in a row creates a NIJI (rainbow). Swap it with an animal to clear every animal of that kind
* Special pieces can be swapped with any neighbour and chain into each other
* Limited SHUFFLE button, you start with 2 per level and earn +1 for every 1000 points
* Auto shuffle when no moves are left, hint after a few seconds idle

Bonus levels

* Every 5th dot is a space invaders bonus level with the animals from the levels
* Drag to steer the car, it fires by itself, dodge the bombs, 3 lives and 45 seconds
* Endless waves that get faster, points are added to your total

Mobile first, safe area handling, chiptune sound and an offline friendly single file.

Primal Panic (spil)

primalpanic.html er en lille 8-bit arcade i mid-80'er stil: hulemanden Oog mod en T-Rex i junglen. Donkey Kong møder Bruce Lee på C64, med et strejf af Primal. Single file, ingen afhængigheder, åbn /primalpanic.html.

* 3 baner der gentager sig og bliver sværere for hver runde: hurtigere og flere kampesten, flere og hurtigere fjender, mindre bonustid
* Bane 1 Jungle Climb: klatr op ad ranker og spring over rullende kampesten, op til Mia
* Bane 2 Raptor Ruins: saml alle fakler for at åbne buret (Bruce Lee style), mens raptorer jagter dig
* Bane 3 Rex Nest: stjæl alle T-Rexens æg mens gnister vandrer rundt og kampesten vælter ned
* Slå med køllen mod kampesten og fjender, spring over kampesten for bonuspoint
* Liv, bonustimer, ekstra liv hver 20000 point og en Hall of Fame med 3 bogstaver (gemmes lokalt)
* Chiptune-lyd og musik, tastatur (piletaster, Space/Z = hop, X/C = kølle, P = pause, M = lyd) og touch-knapper på mobil
