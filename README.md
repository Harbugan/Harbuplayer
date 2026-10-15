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

* An endless, randomly generated mountain road drawn as pixel art, with new zones (forest, cliffs, snow, clouds) and torii gates as you climb
* Every now and then the road forks in two. Pick a branch, the other one closes, and the branches meet again a few levels later
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

Combos

* Chains: every cascade raises the multiplier. Chains show as big kanji stamps (RENSA, DAI-RENSA, CHOU-RENSA, KAMI-RENSA) and give bonus time and fireworks from 3 chains
* Mega combos: swap two special pieces. KATANA + KATANA is a cross (JUUJI KATANA), KATANA + BAKUDAN clears 3 rows and 3 columns (BAKUDAN KATANA), BAKUDAN + BAKUDAN is a huge blast (DAI-BAKUDAN). NIJI combos work as before
* RENKA: make moves in quick succession to build a streak multiplier up to x2.5
* MATSURI: clears fill the festival meter. When it is full the board lights up for 9 seconds with x2 points and the timer frozen

Look and feel

* Seigaiha wave pattern board with a gold lacquer frame, paper lantern garland, drifting clouds, cherry blossom trees and pagodas on the map, stone lanterns along the road
* Pixel particles, fireworks (hanabi) and kanji stamps on combos and level wins

Obstacles and difficulty

* The game never ends: every level is a bit harder with more animal kinds, bigger goals and faster time
* From level 4 some animals are locked in glass. Locked animals cannot be swapped or matched, break the glass by clearing animals right next to it or with an explosion
* From level 10 some glass is thick and takes two hits
* From level 16 stone blocks appear that are broken the same way
* Some levels have a goal to break a number of glass and stone pieces

Music

* A small Game Boy style melody (pulse wave, triangle bass and hi-hat) loops in the background
* The music button turns it on and off, SFX turns the sound effects on and off, both are remembered

Mobile first UI with safe area handling

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

* An endless, randomly generated mountain road drawn as pixel art, with new zones (forest, cliffs, snow, clouds) and torii gates as you climb
* Every now and then the road forks in two. Pick a branch, the other one closes, and the branches meet again a few levels later
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

Mobile first, safe area handling, chiptune sound and music and an offline friendly single file.
