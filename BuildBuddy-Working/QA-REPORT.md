# BuildBuddy QA report (expanded catalog, OS estimates and preview)

Re-run the checks after changing catalog data, compatibility rules or 3D assembly code.

## How to re-run the checks

From `BuildBuddy-Working`:

```powershell
node tools/check-catalog.mjs
Get-ChildItem js -Filter '*.js' | ForEach-Object { node --check $_.FullName }
Get-ChildItem tools -Filter '*.mjs' | ForEach-Object { node --check $_.FullName }
node --check script.js
```

## Current automated results

`node tools/check-catalog.mjs` verifies:

- 11 categories and 443 total options: 48 CPUs, 36 coolers, 41 motherboards, 36 memory kits, 52 graphics options (51 dedicated), 36 storage devices, 36 PSUs, 56 cases, 34 fan options, 36 lighting options and 32 operating systems.
- The Radeon RX 9060 XT is present; OS options cover Windows 7, 8, 8.1, 10 and 11 plus 27 Linux distributions, including Bazzite and CachyOS.
- Forty-one presets (14 featured builds plus 27 Linux-distribution presets) each reference a real selection in every category and pass the compatibility rules.
- Case specifications include chassis, approximate dimensions, airflow, filters, drive mounts, fan/radiator mounts, cable space and front I/O; every case style maps to a 3D case.
- Each storage device declares a form factor used to place the device on the board or a case mount.
- IDs, prices, descriptions and generated spec rows are valid; all 443 single-part swaps are evaluated.
- Game estimates are finite for supported GPU builds, and builds without a GPU return no frame rates.
- OS selection does not alter FPS estimates; comparable measured results by OS are not available.

JavaScript syntax checks pass for `script.js`, modules under `js/` and scripts under `tools/`.

## Browser and 3D verification

Browser smoke checks confirmed:

- The page loads with a real WebGL canvas; at a 1440 px viewport the centered preview stage measures about 1242 × 699 px.
- Selecting the AM4 integrated desktop preset shows its 2 TB PCIe 3.0 NVMe selection; the M.2 drive is modeled and labeled on the motherboard.
- Selecting the classic office preset shows the 240 GB 2.5-inch SATA SSD on its interior case mount.
- All 41 presets render. At mobile widths, the page has no horizontal overflow and the 3D canvas adapts to its container.
- Switching the theme updates the control and persists the setting in local storage.
- The preview uses a lightly tinted reflective physical glass material and neutral interior fill lighting to keep components visible.

The 3D modules load on demand; the page remains usable if Three.js cannot load.

## Estimates and compatibility caveats

- Game frame rates are heuristic planning estimates, not measured benchmarks. Component prices are illustrative references, not live store offers.
- Added component details are comparison references; manufacturer-specific dimensions, power requirements, USB layouts and compatibility can vary. Check the exact manual and seller listing.
- Legacy Windows versions and older hardware may have limited security updates, drivers or software support.
