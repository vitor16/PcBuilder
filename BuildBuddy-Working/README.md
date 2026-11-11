# BuildBuddy

BuildBuddy is a PC builder for beginners. Pick one part at a time, see whether the pieces fit together, check the total in reais (R$), and see roughly what games the build can run. A 3D preview updates as you go.

Open `index.html` in a browser. The 3D preview loads Three.js from a CDN, so it needs an internet connection and WebGL. The parts list, checks and estimates work without it.

## What is in the catalog

| Category | Options | Notes |
| --- | --- | --- |
| Processors | 48 | AMD AM4 and AM5, Intel LGA1151/LGA1200/LGA1700; integrated graphics, core counts and cooler-in-box details. |
| CPU coolers | 36 | Boxed, low-profile and tower air coolers, dual towers, and 240/360 mm liquid coolers. |
| Motherboards | 41 | AM3+/AM4/AM5 and Intel sockets; DDR4/DDR5, Wi-Fi, M.2, networking and rear/front USB details. |
| Memory | 36 | DDR3/DDR4/DDR5 kits with capacity, speed, latency, voltage and profile details. |
| Graphics cards | 52 | 51 dedicated cards plus "no graphics card", including the Radeon RX 9060 XT 16 GB. |
| Storage | 36 | SATA and NVMe SSDs plus hard drives, with capacity, interface, form factor and speed details. M.2 drives are shown on the board in 3D; SATA drives have a visible case mount. |
| Power supplies | 36 | 450 W to 1300 W, with efficiency, modularity, ATX standard and graphics-card cable details. |
| PC cases | 56 | Compact, airflow, quiet, glass, workstation, storage and full-tower layouts; detailed dimensions, clearances, radiator/fan mounts, drive bays, filters and front USB. |
| Case fans | 34 | Individual fans and packs in 120/140 mm sizes, with placement, PWM and ARGB safety notes. |
| Lighting | 36 | Off, steady colors and animated effects, with coverage and hardware compatibility notes. |
| Operating systems | 32 | Windows 7, 8, 8.1, 10 and 11 plus 27 Linux distributions, including Bazzite and CachyOS. OS entries are informational and add no price. |

That is 443 options across 11 categories, 14 featured builds and one additional preset for each of the 27 Linux distributions. Prices are illustrative reference estimates, not live offers. Each part has a short description, a "good for" line, practical caveats and a fuller spec list behind "More details". USB counts and speeds are shown for expanded motherboard and case options; check the exact manufacturer's manual before buying because I/O can vary by board or case revision. Legacy parts may have limited driver, security or software support; check platform compatibility before purchasing.

Ten additional case choices include studio acoustic, panoramic intake, dual-chamber, storage-focused, LAN, cube and XL airflow designs, with dimensions, fan/radiator positions, filters, drive bays, cable space and front-panel USB details.

The 3D preview is now a wide, centered viewing stage above the parts picker. OS selection does not alter FPS values because comparable per-distribution benchmark data is not available in the project.

Use the **Dark theme** / **Light theme** control in the header to switch the interface. The choice is saved in this browser; on a first visit the page follows the operating-system theme.

The builder includes 41 presets: 14 featured builds plus one Linux preset for every listed distribution.

## How the checks work

Each check is listed with a pass, check or fix badge:

- Processor and motherboard socket match
- Memory type and slot count match the board
- Memory is at least 16 GB
- Something can show the picture (a graphics card, or built-in graphics)
- The board size fits the case
- The graphics card and the cooler fit the case
- The cooler supports the socket and can handle the processor's heat
- The processor includes a cooler, or you chose one
- The power supply has room for the estimated peak draw and meets the card's minimum
- Top fans do not clash with a radiator in a small case

The "Only show parts that fit" filter hides any part that would add a new error to the current build.

## How the game estimates work

Under "What it can run", each game shows a planning estimate at 1080p, 1440p or 4K. The current model uses a graphics-card score, a game weight, resolution and a processor adjustment; it is capped by what the processor allows in that game. Results are rounded to 5 fps and labeled as Very smooth, Smooth, Playable, Rough or Struggles.

These are not measured game benchmarks. No verifiable benchmark dataset spanning the catalog's GPUs, games, resolutions and operating systems is currently included, so the model must not be used to compare exact FPS or operating-system performance. Real benchmark values should be added with their source, test system, settings and coverage before this estimate is described as benchmark-based.

## Prices

Prices are reference estimates typed in by hand. They are in BRL and are not live store prices. To use verified prices, click "Import price file" and choose a JSON file that matches the format in `js/price-feed.js`. "Download template" gives you a starting file. "Use reference prices" removes the imported file.

## Project layout

```
index.html        page structure and copy
style.css         styles (light interface, dark 3D stage)
script.js         UI, builder state and 3D controller
js/data.js        catalog entry point, presets, game weights and step copy
js/catalog-expansion.js  additional component options and detailed specifications
js/logic.js       price totals, compatibility checks, spec rows and game estimates
js/price-feed.js  verified price import and validation
js/case.js        case geometry
js/board.js       motherboard, memory, storage and cooler models
js/gpu.js         graphics card model and cables
js/kit.js         shared materials, fans and lighting
js/textures.js    procedural label textures
tools/check-catalog.mjs  catalog and compatibility checks (Node 18+)
```

## Adding a part

1. Add an object to the right array in `catalog` in `js/data.js` or add a category-specific option builder in `js/catalog-expansion.js`. Give it a unique `id`, a `name`, a reference `price` in BRL, a detailed description, a "good for" line and the fields the checks need.
2. For a new case style, add a matching entry to `CASE_DIMS` in `js/case.js`.
3. Run `node tools/check-catalog.mjs`. It must finish with no problems.

## Requirements

Any modern browser. WebGL and an internet connection are needed for the 3D preview only.
