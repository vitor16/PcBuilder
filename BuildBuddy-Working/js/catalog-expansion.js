const SOCKETS = ['AM3+', 'AM4', 'AM5', 'LGA1151', 'LGA1200', 'LGA1700'];

const cpuOptions = [
  ['r5600x', 'AMD Ryzen 5 5600X', 799, 'AM4', 6, 12, 3.7, 4.6, 32, 65, false, true, 1.03],
  ['r5600gt', 'AMD Ryzen 5 5600GT', 749, 'AM4', 6, 12, 3.6, 4.6, 16, 65, true, true, 0.96, 1.25],
  ['r5700g', 'AMD Ryzen 7 5700G', 999, 'AM4', 8, 16, 3.8, 4.6, 16, 65, true, true, 1.04, 1.55],
  ['r5900x', 'AMD Ryzen 9 5900X', 1699, 'AM4', 12, 24, 3.7, 4.8, 64, 105, false, false, 1.22],
  ['r5950x', 'AMD Ryzen 9 5950X', 2299, 'AM4', 16, 32, 3.4, 4.9, 64, 105, false, false, 1.3],
  ['r7600x', 'AMD Ryzen 5 7600X', 1499, 'AM5', 6, 12, 4.7, 5.3, 32, 105, true, false, 1.16, 0.72],
  ['r7700', 'AMD Ryzen 7 7700', 1699, 'AM5', 8, 16, 3.8, 5.3, 32, 65, true, true, 1.2, 0.72],
  ['r7900', 'AMD Ryzen 9 7900', 2399, 'AM5', 12, 24, 3.7, 5.4, 64, 65, true, true, 1.3, 0.72],
  ['r7900x', 'AMD Ryzen 9 7900X', 2699, 'AM5', 12, 24, 4.7, 5.6, 64, 170, true, false, 1.36, 0.72],
  ['r7950x', 'AMD Ryzen 9 7950X', 3699, 'AM5', 16, 32, 4.5, 5.7, 64, 170, true, false, 1.48, 0.72],
  ['r8600g', 'AMD Ryzen 5 8600G', 1299, 'AM5', 6, 12, 4.3, 5.0, 22, 65, true, true, 1.08, 2.0],
  ['r8700g', 'AMD Ryzen 7 8700G', 1799, 'AM5', 8, 16, 4.2, 5.1, 24, 65, true, true, 1.15, 2.7],
  ['r79800x3d', 'AMD Ryzen 7 9800X3D', 3299, 'AM5', 8, 16, 4.7, 5.2, 96, 120, true, false, 1.48, 0.72],
  ['r99900x', 'AMD Ryzen 9 9900X', 2999, 'AM5', 12, 24, 4.4, 5.6, 76, 120, true, false, 1.42, 0.72],
  ['r99950x', 'AMD Ryzen 9 9950X', 4299, 'AM5', 16, 32, 4.3, 5.7, 80, 170, true, false, 1.55, 0.72],
  ['i313100f', 'Intel Core i3-13100F', 599, 'LGA1700', 4, 8, 3.4, 4.5, 12, 58, false, true, 0.76],
  ['i512600k', 'Intel Core i5-12600K', 1199, 'LGA1700', 10, 16, 3.7, 4.9, 20, 125, true, false, 1.14, 0.78],
  ['i513600k', 'Intel Core i5-13600K', 1699, 'LGA1700', 14, 20, 3.5, 5.1, 24, 125, true, false, 1.3, 0.8],
  ['i514600k', 'Intel Core i5-14600K', 1899, 'LGA1700', 14, 20, 3.5, 5.3, 24, 125, true, false, 1.34, 0.8],
  ['i914900k', 'Intel Core i9-14900K', 3999, 'LGA1700', 24, 32, 3.2, 6.0, 36, 125, true, false, 1.58, 0.82]
].map(([id, name, price, socket, cores, threads, base, boost, cache, tdp, igpu, boxCooler, cpuScore, igpuScore = 0]) => ({
  id, name, price, tag: `${socket} · ${cores} cores`, short: `${cores} cores · ${threads} threads · ${socket}`,
  socket, memory: socket === 'AM4' ? 'DDR4' : socket === 'AM5' ? 'DDR5' : 'DDR4 or DDR5, depending on board',
  igpu, igpuScore, cpuScore, tdp, cores, threads, base, boost, cache, boxCooler,
  desc: `${name} combines ${cores} cores and ${threads} threads with boost speeds up to ${boost} GHz. ${igpu ? 'Its built-in graphics can provide display output without a separate graphics card.' : 'It requires a separate graphics card for display output.'}`,
  fit: `${socket} builds for gaming, multitasking and ${cores >= 12 ? 'heavier creator workloads' : 'everyday work'}.`,
  watch: `${boxCooler ? 'A boxed cooler is included; check its noise and cooling capacity for sustained heavy workloads.' : 'No boxed cooler is included; choose a cooler rated for its heat output.'}${!igpu ? ' There is no integrated graphics.' : ''}`
}));

const coolerOptions = [
  ['tower-4pipe', 'Four-heatpipe 120 mm tower', 229, 'tower', 154, 165, 1, 120, 'No RGB'],
  ['tower-5pipe', 'Five-heatpipe 120 mm tower', 279, 'tower', 158, 190, 1, 120, 'ARGB option'],
  ['tower-6pipe', 'Six-heatpipe 120 mm tower', 349, 'dual', 160, 220, 2, 120, 'No RGB'],
  ['lowprofile-92', '92 mm low-profile cooler', 189, 'tower', 69, 100, 1, 92, 'No RGB'],
  ['lowprofile-135', '135 mm low-profile cooler', 249, 'tower', 78, 130, 1, 120, 'No RGB'],
  ['dual-120-black', 'Black dual-tower 120 mm cooler', 399, 'dual', 160, 230, 2, 120, 'No RGB'],
  ['dual-140', 'Dual-tower 140 mm cooler', 499, 'dual', 168, 260, 2, 140, 'No RGB'],
  ['dual-140-rgb', 'Dual-tower 140 mm ARGB cooler', 569, 'dual', 168, 260, 2, 140, 'ARGB'],
  ['aio240-basic', '240 mm liquid cooler · standard fans', 449, 'aio', 0, 240, 2, 120, 'No RGB'],
  ['aio240-rgb', '240 mm liquid cooler · ARGB fans', 549, 'aio', 0, 250, 2, 120, 'ARGB'],
  ['aio240-slim', 'Slim 240 mm liquid cooler', 479, 'aio', 0, 220, 2, 120, 'No RGB'],
  ['aio360-basic', '360 mm liquid cooler · standard fans', 649, 'aio', 0, 290, 3, 120, 'No RGB'],
  ['aio360-rgb', '360 mm liquid cooler · ARGB fans', 799, 'aio', 0, 310, 3, 120, 'ARGB'],
  ['aio360-lcd', '360 mm liquid cooler · display pump', 1099, 'aio', 0, 320, 3, 120, 'Pump display'],
  ['aio240-white', 'White 240 mm liquid cooler', 529, 'aio', 0, 245, 2, 120, 'ARGB'],
  ['aio360-white', 'White 360 mm liquid cooler', 749, 'aio', 0, 300, 3, 120, 'ARGB'],
  ['dual-compact', 'Compact dual-fan tower cooler', 319, 'dual', 145, 190, 2, 120, 'No RGB'],
  ['tower-quiet', 'Quiet 120 mm tower cooler', 299, 'tower', 155, 175, 1, 120, 'Low-noise fan'],
  ['tower-white', 'White 120 mm tower cooler', 269, 'tower', 155, 165, 1, 120, 'ARGB'],
  ['aio240-premium', 'Premium 240 mm liquid cooler', 699, 'aio', 0, 270, 2, 120, 'Pump display']
].map(([id, name, price, kind, height, capacity, fanCount, fanSize, lighting]) => ({
  id, name, price, tag: `${kind === 'aio' ? 'Liquid' : 'Air'} · ${capacity} W class`,
  short: kind === 'aio' ? `${height || (name.includes('360') ? 360 : 240)} mm radiator · ${fanCount} fans` : `${height} mm tall · ${fanCount} fan${fanCount > 1 ? 's' : ''}`,
  kind, height, radiator: kind === 'aio' ? (name.includes('360') ? 360 : 240) : undefined,
  sockets: SOCKETS, capacity, fanCount, fanSize, lighting,
  desc: `${name} uses ${kind === 'aio' ? 'a sealed pump-and-radiator loop' : 'a fin-stack heatsink with heat pipes'} and ${fanCount} ${fanSize} mm fan${fanCount > 1 ? 's' : ''}. Its approximate ${capacity} W thermal class helps compare it with processor heat output.`,
  fit: `${kind === 'aio' ? 'Cases that list support for its radiator size' : `${height} mm cooler clearance`} and processors up to roughly ${capacity} W.`,
  watch: `${lighting} finish; confirm memory clearance and included mounting hardware with the seller.`
}));

const boardOptions = [
  ['b550m-wifi', 'B550 micro-ATX Wi-Fi board', 799, 'AM4', 'DDR4', 'mATX', 4, 2, true, 'Wi-Fi 6', '4 × USB-A 5 Gb/s, 2 × USB-A 2.0, 1 × USB-C 10 Gb/s'],
  ['b550m-2m2', 'B550 micro-ATX dual-M.2 board', 649, 'AM4', 'DDR4', 'mATX', 4, 2, false, 'None', '4 × USB-A 5 Gb/s, 4 × USB-A 2.0'],
  ['b550-atx-3m2', 'B550 ATX triple-M.2 board', 949, 'AM4', 'DDR4', 'ATX', 4, 3, false, 'None', '6 × USB-A 5 Gb/s, 2 × USB-A 2.0, 1 × USB-C 10 Gb/s'],
  ['b550-atx-wifi', 'B550 ATX Wi-Fi board', 1099, 'AM4', 'DDR4', 'ATX', 4, 2, true, 'Wi-Fi 6', '6 × USB-A 5 Gb/s, 2 × USB-A 2.0, 1 × USB-C 10 Gb/s'],
  ['x570-atx-wifi', 'X570 ATX Wi-Fi board', 1399, 'AM4', 'DDR4', 'ATX', 4, 3, true, 'Wi-Fi 6', '6 × USB-A 5 Gb/s, 2 × USB-A 2.0, 1 × USB-C 10 Gb/s'],
  ['a620m-2slot', 'A620 micro-ATX compact board', 649, 'AM5', 'DDR5', 'mATX', 2, 1, false, 'None', '4 × USB-A 5 Gb/s, 2 × USB-A 2.0'],
  ['a620m-wifi', 'A620 micro-ATX Wi-Fi board', 849, 'AM5', 'DDR5', 'mATX', 4, 2, true, 'Wi-Fi 6', '4 × USB-A 5 Gb/s, 2 × USB-A 2.0, 1 × USB-C 10 Gb/s'],
  ['b650m-wifi', 'B650 micro-ATX Wi-Fi board', 1099, 'AM5', 'DDR5', 'mATX', 4, 2, true, 'Wi-Fi 6E', '4 × USB-A 10 Gb/s, 2 × USB-A 5 Gb/s, 1 × USB-C 20 Gb/s'],
  ['b650m-3m2', 'B650 micro-ATX triple-M.2 board', 1199, 'AM5', 'DDR5', 'mATX', 4, 3, false, 'None', '4 × USB-A 10 Gb/s, 2 × USB-A 5 Gb/s, 1 × USB-C 10 Gb/s'],
  ['b650-atx-4m2', 'B650 ATX four-M.2 board', 1499, 'AM5', 'DDR5', 'ATX', 4, 4, false, 'None', '6 × USB-A 10 Gb/s, 2 × USB-A 5 Gb/s, 1 × USB-C 20 Gb/s'],
  ['b650-atx-wifi', 'B650 ATX Wi-Fi 6E board', 1599, 'AM5', 'DDR5', 'ATX', 4, 3, true, 'Wi-Fi 6E', '6 × USB-A 10 Gb/s, 2 × USB-A 5 Gb/s, 1 × USB-C 20 Gb/s'],
  ['b650e-atx', 'B650E ATX PCIe 5.0 board', 1899, 'AM5', 'DDR5', 'ATX', 4, 3, true, 'Wi-Fi 6E', '6 × USB-A 10 Gb/s, 2 × USB-A 5 Gb/s, 1 × USB-C 20 Gb/s'],
  ['x670e-matx', 'X670E micro-ATX enthusiast board', 1799, 'AM5', 'DDR5', 'mATX', 4, 3, true, 'Wi-Fi 6E', '4 × USB-A 10 Gb/s, 2 × USB-A 5 Gb/s, 1 × USB-C 20 Gb/s'],
  ['x670e-atx-wifi', 'X670E ATX Wi-Fi board', 2199, 'AM5', 'DDR5', 'ATX', 4, 4, true, 'Wi-Fi 6E', '8 × USB-A 10 Gb/s, 2 × USB-C 20 Gb/s'],
  ['b850-atx', 'B850 ATX Wi-Fi 7 board', 1799, 'AM5', 'DDR5', 'ATX', 4, 4, true, 'Wi-Fi 7', '6 × USB-A 10 Gb/s, 2 × USB-A 5 Gb/s, 1 × USB-C 20 Gb/s'],
  ['x870-atx', 'X870 ATX USB4 board', 2499, 'AM5', 'DDR5', 'ATX', 4, 4, true, 'Wi-Fi 7', '6 × USB-A 10 Gb/s, 2 × USB-C 40 Gb/s'],
  ['b760m-ddr4-wifi', 'B760 micro-ATX DDR4 Wi-Fi board', 899, 'LGA1700', 'DDR4', 'mATX', 4, 2, true, 'Wi-Fi 6', '4 × USB-A 5 Gb/s, 2 × USB-A 2.0, 1 × USB-C 10 Gb/s'],
  ['b760m-ddr5', 'B760 micro-ATX DDR5 board', 949, 'LGA1700', 'DDR5', 'mATX', 4, 2, false, 'None', '4 × USB-A 10 Gb/s, 2 × USB-A 2.0, 1 × USB-C 10 Gb/s'],
  ['b760-atx-wifi', 'B760 ATX DDR5 Wi-Fi board', 1399, 'LGA1700', 'DDR5', 'ATX', 4, 3, true, 'Wi-Fi 6E', '6 × USB-A 10 Gb/s, 2 × USB-A 5 Gb/s, 1 × USB-C 20 Gb/s'],
  ['z790-atx-ddr5', 'Z790 ATX DDR5 Wi-Fi board', 1999, 'LGA1700', 'DDR5', 'ATX', 4, 4, true, 'Wi-Fi 6E', '8 × USB-A 10 Gb/s, 2 × USB-C 20 Gb/s']
].map(([id, name, price, socket, ram, form, slots, m2, wifi, wifiType, usbRear]) => ({
  id, name, price, tag: `${socket} · ${ram} · ${form}`,
  short: `${form === 'mATX' ? 'micro-ATX' : form} · ${slots} RAM slots · ${m2} M.2 · ${wifi ? wifiType : 'no Wi-Fi'}`,
  socket, ram, form, slots, m2, wifi, wifiType, usbRear,
  usbFront: 'Headers for 2 × USB-A 5 Gb/s; Type-C front header varies by model',
  pcie: socket === 'AM5' ? 'PCIe 4.0; selected slots support PCIe 5.0' : 'PCIe 4.0 graphics and M.2 support varies by slot',
  lan: '2.5 Gb Ethernet (reference configuration)',
  desc: `${name} is a reference configuration with ${slots} memory slots, ${m2} M.2 sockets and ${wifi ? wifiType : 'wired networking only'}. USB counts and speeds describe this option; confirm the exact rear-I/O layout on the board maker’s product page.`,
  fit: `${socket} processors and ${ram} memory in a ${form === 'mATX' ? 'micro-ATX' : 'ATX'} case.`
}));

const ramOptions = [
  ['8ddr4', '8 GB DDR4 (1 × 8 GB)', 149, 'DDR4', 8, 1, 3200, 16],
  ['16ddr4-3200-cl18', '16 GB DDR4 (2 × 8 GB) · CL18', 239, 'DDR4', 16, 2, 3200, 18],
  ['32ddr4-3200', '32 GB DDR4 (2 × 16 GB) · 3200', 399, 'DDR4', 32, 2, 3200, 16],
  ['32ddr4-3600-cl16', '32 GB DDR4 (2 × 16 GB) · 3600 CL16', 499, 'DDR4', 32, 2, 3600, 16],
  ['32ddr4-3600-cl18', '32 GB DDR4 (4 × 8 GB) · 3600', 469, 'DDR4', 32, 4, 3600, 18],
  ['64ddr4-3200-2x32', '64 GB DDR4 (2 × 32 GB)', 749, 'DDR4', 64, 2, 3200, 16],
  ['64ddr4-3600', '64 GB DDR4 (4 × 16 GB) · 3600', 999, 'DDR4', 64, 4, 3600, 18],
  ['128ddr4', '128 GB DDR4 (4 × 32 GB)', 1699, 'DDR4', 128, 4, 3200, 22],
  ['16ddr5-5200', '16 GB DDR5 (2 × 8 GB) · 5200', 329, 'DDR5', 16, 2, 5200, 40],
  ['32ddr5-5600', '32 GB DDR5 (2 × 16 GB) · 5600', 499, 'DDR5', 32, 2, 5600, 36],
  ['32ddr5-6000-cl36', '32 GB DDR5 (2 × 16 GB) · 6000 CL36', 549, 'DDR5', 32, 2, 6000, 36],
  ['32ddr5-6400', '32 GB DDR5 (2 × 16 GB) · 6400', 699, 'DDR5', 32, 2, 6400, 32],
  ['48ddr5-6000', '48 GB DDR5 (2 × 24 GB) · 6000', 749, 'DDR5', 48, 2, 6000, 36],
  ['64ddr5-5600', '64 GB DDR5 (2 × 32 GB) · 5600', 899, 'DDR5', 64, 2, 5600, 40],
  ['64ddr5-6000-cl32', '64 GB DDR5 (2 × 32 GB) · 6000 CL32', 1199, 'DDR5', 64, 2, 6000, 32],
  ['64ddr5-6400', '64 GB DDR5 (2 × 32 GB) · 6400', 1399, 'DDR5', 64, 2, 6400, 32],
  ['96ddr5-5600', '96 GB DDR5 (2 × 48 GB) · 5600', 1399, 'DDR5', 96, 2, 5600, 40],
  ['96ddr5-6000', '96 GB DDR5 (2 × 48 GB) · 6000', 1599, 'DDR5', 96, 2, 6000, 36],
  ['128ddr5-5600', '128 GB DDR5 (4 × 32 GB) · 5600', 1899, 'DDR5', 128, 4, 5600, 40],
  ['128ddr5-6000', '128 GB DDR5 (4 × 32 GB) · 6000', 2299, 'DDR5', 128, 4, 6000, 36]
].map(([id, name, price, type, capacity, sticks, speed, cl]) => ({
  id, name, price, tag: `${capacity} GB · ${type}`, short: `${speed} MT/s · CL${cl} · ${sticks} stick${sticks > 1 ? 's' : ''}`,
  type, capacity, sticks, speed, cl, voltage: type === 'DDR4' ? '1.35 V (typical)' : '1.25–1.4 V (profile-dependent)',
  profile: type === 'DDR4' ? 'XMP or JEDEC profile' : 'EXPO/XMP profile; board support varies',
  desc: `${name} provides ${capacity} GB across ${sticks} matched stick${sticks > 1 ? 's' : ''}, rated at ${speed} MT/s and CL${cl}. Enabling the memory profile in firmware may be needed to reach the listed speed.`,
  fit: `${type} motherboards with at least ${sticks} open memory slot${sticks > 1 ? 's' : ''}.`
}));

const gpuOptions = [
  ['rx6500xt', 'AMD Radeon RX 6500 XT 4 GB', 999, 2.3, 107, 400, 190, 4, 'GDDR6', 'dual'],
  ['rtx3060', 'NVIDIA GeForce RTX 3060 12 GB', 1899, 4.2, 170, 550, 242, 12, 'GDDR6', 'dual'],
  ['rtx3060ti', 'NVIDIA GeForce RTX 3060 Ti 8 GB', 2299, 5.0, 200, 600, 242, 8, 'GDDR6', 'dual'],
  ['rtx3070', 'NVIDIA GeForce RTX 3070 8 GB', 2599, 5.8, 220, 650, 290, 8, 'GDDR6', 'triple'],
  ['rtx3070ti', 'NVIDIA GeForce RTX 3070 Ti 8 GB', 2899, 6.2, 290, 750, 300, 8, 'GDDR6X', 'triple'],
  ['rtx3080', 'NVIDIA GeForce RTX 3080 10 GB', 3499, 7.7, 320, 750, 300, 10, 'GDDR6X', 'triple'],
  ['rtx3080ti', 'NVIDIA GeForce RTX 3080 Ti 12 GB', 4299, 8.6, 350, 850, 320, 12, 'GDDR6X', 'triple'],
  ['rtx3090', 'NVIDIA GeForce RTX 3090 24 GB', 4999, 9.0, 350, 850, 313, 24, 'GDDR6X', 'triple'],
  ['rtx4060ti16', 'NVIDIA GeForce RTX 4060 Ti 16 GB', 3499, 6.0, 165, 600, 250, 16, 'GDDR6', 'dual'],
  ['rtx4070', 'NVIDIA GeForce RTX 4070 12 GB', 3999, 7.2, 200, 650, 267, 12, 'GDDR6X', 'dual'],
  ['rtx4070ti', 'NVIDIA GeForce RTX 4070 Ti 12 GB', 4799, 8.5, 285, 750, 285, 12, 'GDDR6X', 'triple'],
  ['rtx4070tis', 'NVIDIA GeForce RTX 4070 Ti SUPER 16 GB', 5499, 9.0, 285, 750, 305, 16, 'GDDR6X', 'triple'],
  ['rtx4080', 'NVIDIA GeForce RTX 4080 16 GB', 6999, 11.0, 320, 850, 310, 16, 'GDDR6X', 'triple'],
  ['rtx4080s', 'NVIDIA GeForce RTX 4080 SUPER 16 GB', 7499, 11.5, 320, 850, 310, 16, 'GDDR6X', 'triple'],
  ['rx6700xt', 'AMD Radeon RX 6700 XT 12 GB', 2199, 5.0, 230, 650, 267, 12, 'GDDR6', 'triple'],
  ['rx6750xt', 'AMD Radeon RX 6750 XT 12 GB', 2499, 5.5, 250, 650, 270, 12, 'GDDR6', 'triple'],
  ['rx6800', 'AMD Radeon RX 6800 16 GB', 2999, 6.8, 250, 650, 300, 16, 'GDDR6', 'triple'],
  ['rx6800xt', 'AMD Radeon RX 6800 XT 16 GB', 3499, 7.8, 300, 750, 320, 16, 'GDDR6', 'triple'],
  ['rx6900xt', 'AMD Radeon RX 6900 XT 16 GB', 3999, 8.3, 300, 750, 320, 16, 'GDDR6', 'triple'],
  ['rx7600xt', 'AMD Radeon RX 7600 XT 16 GB', 2499, 5.0, 190, 600, 275, 16, 'GDDR6', 'dual']
].map(([id, name, price, score, watts, minPsu, length, vram, mem, kind]) => ({
  id, name, price, tag: `${vram} GB · ${length <= 275 ? 'compact card' : 'check case clearance'}`,
  short: `${vram} GB ${mem} · about ${watts} W · ${length} mm`,
  score, watts, minPsu, length, kind, vram, mem, color: name.includes('Radeon') ? 0xd24a3a : 0x76b900,
  bus: vram >= 16 ? '256-bit (typical for this family)' : '128–192-bit (model-dependent)',
  powerConnector: watts >= 300 ? '2–3 × 8-pin or newer high-power connector; verify board model' : '1–2 × 8-pin; verify board model',
  desc: `${name} is a ${kind === 'triple' ? 'larger triple-fan' : 'compact dual-fan'} graphics card with ${vram} GB of ${mem} memory. Its planning power draw is about ${watts} W; actual clock speed, cooler and connector layout vary by card maker.`,
  fit: `${vram >= 12 ? 'Detailed 1440p gaming and GPU-accelerated work' : '1080p gaming and everyday graphics workloads'}; check the exact card dimensions before ordering.`,
  watch: `${length} mm long and calls for a ${minPsu} W or larger power supply. These are reference estimates, not a benchmark or a specific board-partner card.`
}));

const storageOptions = [
  ['256sata', '256 GB 2.5-inch SATA SSD', 129, 256, 'SATA III SSD', 550, false, '2.5-inch'],
  ['512sata', '512 GB 2.5-inch SATA SSD', 229, 512, 'SATA III SSD', 560, false, '2.5-inch'],
  ['1tbsata', '1 TB 2.5-inch SATA SSD', 399, 1000, 'SATA III SSD', 560, false, '2.5-inch'],
  ['2tbsata', '2 TB 2.5-inch SATA SSD', 699, 2000, 'SATA III SSD', 560, false, '2.5-inch'],
  ['4tbsata', '4 TB 2.5-inch SATA SSD', 1499, 4000, 'SATA III SSD', 560, false, '2.5-inch'],
  ['1tbgen3-value', '1 TB PCIe 3.0 NVMe SSD', 299, 1000, 'PCIe 3.0 NVMe', 3500, false, 'M.2 2280'],
  ['2tbgen3', '2 TB PCIe 3.0 NVMe SSD', 549, 2000, 'PCIe 3.0 NVMe', 3500, false, 'M.2 2280'],
  ['500gen4', '500 GB PCIe 4.0 NVMe SSD', 279, 500, 'PCIe 4.0 NVMe', 5000, true, 'M.2 2280'],
  ['5000gen4', '1 TB PCIe 4.0 NVMe SSD · 5000 MB/s', 379, 1000, 'PCIe 4.0 NVMe', 5000, true, 'M.2 2280'],
  ['7400gen4', '2 TB PCIe 4.0 NVMe SSD · 7400 MB/s', 999, 2000, 'PCIe 4.0 NVMe', 7400, true, 'M.2 2280'],
  ['4tbgen4', '4 TB PCIe 4.0 NVMe SSD', 1699, 4000, 'PCIe 4.0 NVMe', 7000, true, 'M.2 2280'],
  ['8tbgen4', '8 TB PCIe 4.0 NVMe SSD', 3999, 8000, 'PCIe 4.0 NVMe', 7000, true, 'M.2 2280'],
  ['1tbgen5', '1 TB PCIe 5.0 NVMe SSD', 799, 1000, 'PCIe 5.0 NVMe', 10000, false, 'M.2 2280'],
  ['2tbgen5', '2 TB PCIe 5.0 NVMe SSD', 1399, 2000, 'PCIe 5.0 NVMe', 12000, false, 'M.2 2280'],
  ['4tbgen5', '4 TB PCIe 5.0 NVMe SSD', 2499, 4000, 'PCIe 5.0 NVMe', 12000, false, 'M.2 2280'],
  ['1tbhdd5400', '1 TB 2.5-inch 5400 RPM hard drive', 299, 1000, 'SATA HDD · 5400 RPM', 140, false, '2.5-inch'],
  ['2tbhdd7200', '2 TB 3.5-inch 7200 RPM hard drive', 399, 2000, 'SATA HDD · 7200 RPM', 220, false, '3.5-inch'],
  ['4tbhdd5400', '4 TB 3.5-inch 5400 RPM hard drive', 549, 4000, 'SATA HDD · 5400 RPM', 190, false, '3.5-inch'],
  ['6tbhdd7200', '6 TB 3.5-inch 7200 RPM hard drive', 899, 6000, 'SATA HDD · 7200 RPM', 250, false, '3.5-inch'],
  ['8tbhdd7200', '8 TB 3.5-inch 7200 RPM hard drive', 1299, 8000, 'SATA HDD · 7200 RPM', 260, false, '3.5-inch']
].map(([id, name, price, capacity, interfaceType, read, gen4, formFactor]) => ({
  id, name, price, tag: `${capacity >= 1000 ? `${capacity / 1000} TB` : `${capacity} GB`} · ${interfaceType}`,
  short: `${formFactor} · up to ${read} MB/s`,
  capacity, interface: interfaceType, read, gen4, formFactor,
  write: interfaceType.includes('HDD') ? `${Math.round(read * 0.85)} MB/s (approximate)` : interfaceType.includes('SATA') ? 'Up to 530 MB/s (model-dependent)' : 'Model-dependent; check the drive specification',
  endurance: interfaceType.includes('HDD') ? 'Mechanical drive; protect from shock' : 'Check model-specific TBW warranty rating',
  desc: `${name} stores games and files in ${formFactor} format. Sequential read performance is an approximate maximum; sustained speed, cache behavior and endurance depend on the exact drive model.`,
  fit: `${formFactor === 'M.2 2280' ? 'A free M.2 slot that supports this PCIe generation and drive size' : 'A free SATA data port, power connector and matching case mount'}.`
}));

const psuOptions = [
  ['450w-bronze', '450 W 80+ Bronze non-modular PSU', 279, 450, 'Bronze', false, 'ATX 2.52', '1 × 8-pin PCIe'],
  ['550w-gold', '550 W 80+ Gold semi-modular PSU', 499, 550, 'Gold', true, 'ATX 2.52', '2 × 8-pin PCIe'],
  ['600w-bronze', '600 W 80+ Bronze PSU', 379, 600, 'Bronze', false, 'ATX 2.52', '2 × 8-pin PCIe'],
  ['650w-gold', '650 W 80+ Gold fully modular PSU', 599, 650, 'Gold', true, 'ATX 3.0', '12VHPWR plus 2 × 8-pin PCIe'],
  ['700w-bronze', '700 W 80+ Bronze PSU', 469, 700, 'Bronze', false, 'ATX 2.52', '2 × 8-pin PCIe'],
  ['750w-bronze', '750 W 80+ Bronze PSU', 499, 750, 'Bronze', false, 'ATX 2.52', '4 × 8-pin PCIe'],
  ['750w-gold-white', '750 W 80+ Gold white modular PSU', 699, 750, 'Gold', true, 'ATX 3.0', '12VHPWR plus 3 × 8-pin PCIe'],
  ['800w-gold', '800 W 80+ Gold modular PSU', 749, 800, 'Gold', true, 'ATX 3.0', '12VHPWR plus 4 × 8-pin PCIe'],
  ['850w-bronze', '850 W 80+ Bronze PSU', 649, 850, 'Bronze', false, 'ATX 2.52', '4 × 8-pin PCIe'],
  ['850w-gold-atx31', '850 W 80+ Gold ATX 3.1 PSU', 899, 850, 'Gold', true, 'ATX 3.1', '12V-2x6 plus 4 × 8-pin PCIe'],
  ['850w-platinum', '850 W 80+ Platinum modular PSU', 1099, 850, 'Platinum', true, 'ATX 3.0', '12VHPWR plus 4 × 8-pin PCIe'],
  ['900w-gold', '900 W 80+ Gold modular PSU', 999, 900, 'Gold', true, 'ATX 3.1', '12V-2x6 plus 4 × 8-pin PCIe'],
  ['950w-gold', '950 W 80+ Gold modular PSU', 1099, 950, 'Gold', true, 'ATX 3.1', '12V-2x6 plus 4 × 8-pin PCIe'],
  ['1000w-gold', '1000 W 80+ Gold modular PSU', 1199, 1000, 'Gold', true, 'ATX 3.1', '12V-2x6 plus 4 × 8-pin PCIe'],
  ['1000w-platinum', '1000 W 80+ Platinum modular PSU', 1599, 1000, 'Platinum', true, 'ATX 3.1', '12V-2x6 plus 4 × 8-pin PCIe'],
  ['1050w-gold', '1050 W 80+ Gold modular PSU', 1399, 1050, 'Gold', true, 'ATX 3.1', '12V-2x6 plus 4 × 8-pin PCIe'],
  ['1100w-platinum', '1100 W 80+ Platinum modular PSU', 1799, 1100, 'Platinum', true, 'ATX 3.1', '12V-2x6 plus 5 × 8-pin PCIe'],
  ['1200w-gold', '1200 W 80+ Gold modular PSU', 1699, 1200, 'Gold', true, 'ATX 3.1', '12V-2x6 plus 5 × 8-pin PCIe'],
  ['1200w-platinum', '1200 W 80+ Platinum modular PSU', 2199, 1200, 'Platinum', true, 'ATX 3.1', '12V-2x6 plus 5 × 8-pin PCIe'],
  ['1300w-gold', '1300 W 80+ Gold modular PSU', 2399, 1300, 'Gold', true, 'ATX 3.1', '12V-2x6 plus 6 × 8-pin PCIe']
].map(([id, name, price, watts, efficiency, modular, standard, gpuCables]) => ({
  id, name, price, tag: `${watts} W · ${efficiency} · ${standard}`,
  short: `${watts} W · 80+ ${efficiency} · ${modular ? 'modular' : 'fixed cables'}`,
  watts, efficiency, modular, standard, gpuCables, warranty: 'Check the exact model; warranty varies by manufacturer',
  desc: `${name} supplies up to ${watts} W and lists ${gpuCables} for graphics-card power. The 80 PLUS tier is an efficiency certification, not a guarantee of build quality.`,
  fit: `Builds whose estimated peak draw and graphics-card recommendation fit within ${watts} W.`,
  watch: 'Use only the cables supplied with this exact power supply; modular cables are not interchangeable between models.'
}));

const caseOptions = [
  ['mesh-atx-compact', 'Compact ATX mesh mid-tower', 429, 350, 165, [240, 360], ['mATX', 'ATX'], 4, 'mesh', 'dark', '2 × USB-A 5 Gb/s, 1 × USB-A 2.0, audio'],
  ['mesh-atx-white', 'White airflow ATX mid-tower', 499, 370, 170, [240, 360], ['mATX', 'ATX'], 4, 'mesh', 'light', '2 × USB-A 5 Gb/s, 1 × USB-C 10 Gb/s, audio'],
  ['mesh-matx-2', 'Two-fan micro-ATX mesh case', 349, 320, 160, [240], ['mATX'], 2, 'compact', 'dark', '2 × USB-A 5 Gb/s, 1 × USB-A 2.0, audio'],
  ['mesh-matx-4', 'Four-fan micro-ATX airflow case', 429, 340, 165, [240, 360], ['mATX'], 4, 'mini', 'dark', '2 × USB-A 5 Gb/s, 1 × USB-C 5 Gb/s, audio'],
  ['cube-matx-white', 'White micro-ATX cube case', 479, 330, 160, [240], ['mATX'], 3, 'cube', 'light', '2 × USB-A 5 Gb/s, 1 × USB-A 2.0, audio'],
  ['glass-matx-dual', 'Dual-glass micro-ATX tower', 549, 335, 165, [240, 360], ['mATX'], 4, 'matxglass', 'dark', '2 × USB-A 5 Gb/s, 1 × USB-C 10 Gb/s, audio'],
  ['silent-matx', 'Quiet-panel micro-ATX case', 499, 330, 165, [240], ['mATX'], 3, 'silent', 'dark', '2 × USB-A 5 Gb/s, 1 × USB-A 2.0, audio'],
  ['budget-atx-glass', 'Budget ATX glass-side case', 379, 340, 160, [240], ['mATX', 'ATX'], 3, 'budget', 'dark', '2 × USB-A 5 Gb/s, 1 × USB-A 2.0, audio'],
  ['tower-atx-360', 'ATX airflow tower · 360 mm radiator', 599, 400, 180, [240, 360], ['mATX', 'ATX'], 5, 'tower', 'dark', '2 × USB-A 5 Gb/s, 1 × USB-C 10 Gb/s, audio'],
  ['tower-atx-white', 'White full-height airflow tower', 749, 420, 185, [240, 360], ['mATX', 'ATX'], 5, 'tower', 'light', '2 × USB-A 5 Gb/s, 2 × USB-A 2.0, audio'],
  ['fishbowl-atx', 'Panoramic ATX fishbowl case', 799, 400, 175, [240, 360], ['mATX', 'ATX'], 6, 'fishbowl', 'dark', '2 × USB-A 5 Gb/s, 1 × USB-C 10 Gb/s, audio'],
  ['fishbowl-white', 'White panoramic glass tower', 899, 410, 180, [240, 360], ['mATX', 'ATX'], 6, 'fishbowl', 'light', '2 × USB-A 5 Gb/s, 1 × USB-C 10 Gb/s, audio'],
  ['showcase-atx-8', 'Eight-fan ATX showcase case', 999, 420, 180, [240, 360], ['mATX', 'ATX'], 8, 'showcase', 'dark', '2 × USB-A 10 Gb/s, 1 × USB-C 10 Gb/s, audio'],
  ['showcase-white-8', 'White eight-fan showcase case', 1099, 430, 185, [240, 360], ['mATX', 'ATX'], 8, 'showcase', 'light', '2 × USB-A 10 Gb/s, 1 × USB-C 10 Gb/s, audio'],
  ['dual-chamber-mesh', 'Dual-chamber mesh ATX case', 899, 440, 185, [240, 360], ['mATX', 'ATX'], 6, 'towerglass', 'dark', '2 × USB-A 10 Gb/s, 2 × USB-C 10 Gb/s, audio'],
  ['dual-chamber-white', 'White dual-chamber showcase tower', 1199, 450, 190, [240, 360], ['mATX', 'ATX'], 7, 'towerglass', 'light', '2 × USB-A 10 Gb/s, 2 × USB-C 10 Gb/s, audio'],
  ['mini-itx-like-matx', 'Small-footprint micro-ATX tower', 399, 315, 155, [240], ['mATX'], 2, 'mini', 'dark', '2 × USB-A 5 Gb/s, 1 × USB-A 2.0, audio'],
  ['compact-glass', 'Compact glass-side airflow case', 469, 330, 160, [240], ['mATX'], 3, 'compact', 'dark', '2 × USB-A 5 Gb/s, 1 × USB-C 5 Gb/s, audio'],
  ['tower-silent', 'Large sound-dampened ATX tower', 849, 400, 190, [240, 360], ['mATX', 'ATX'], 4, 'silent', 'dark', '2 × USB-A 10 Gb/s, 1 × USB-C 10 Gb/s, audio'],
  ['budget-matx-white', 'White budget micro-ATX case', 329, 320, 160, [240], ['mATX'], 2, 'budget', 'light', '2 × USB-A 5 Gb/s, 1 × USB-A 2.0, audio']
].map(([id, name, price, maxGpu, maxCooler, radiators, forms, fans, style, finish, frontUsb]) => ({
  id, name, price, tag: `${forms.includes('ATX') ? 'ATX' : 'micro-ATX'} · ${fans} fans`,
  short: `GPU up to ${maxGpu} mm · cooler up to ${maxCooler} mm · ${frontUsb.split(',').slice(0, 2).join(',')}`,
  maxGpu, maxCooler, radiators, forms, fans, style, finish, frontUsb,
  desc: `${name} has a ${style === 'silent' ? 'noise-conscious' : 'ventilated'} layout with room for a ${maxGpu} mm graphics card and ${maxCooler} mm air cooler. Front I/O: ${frontUsb}.`,
  fit: `${forms.map((form) => form === 'mATX' ? 'micro-ATX' : form).join(' or ')} builds; verify radiator placement and cable clearance before purchase.`,
  watch: `Front USB speed depends on the case revision and the matching motherboard header. Included fans: ${fans}.`
}));

const fanOptions = [
  ['single120-pwm', '1 × 120 mm PWM case fan', 49, 0, 1, 120, false, 'Rear exhaust'],
  ['single140-pwm', '1 × 140 mm PWM case fan', 69, 0, 1, 140, false, 'Rear or top'],
  ['duo120-pwm', '2 × 120 mm PWM fan pack', 99, 0, 2, 120, false, 'Front intake'],
  ['duo140-pwm', '2 × 140 mm PWM fan pack', 139, 0, 2, 140, false, 'Front intake'],
  ['trio120-black', '3 × 120 mm black PWM fan pack', 179, 0, 3, 120, false, 'Front intake'],
  ['trio140-black', '3 × 140 mm black PWM fan pack', 229, 0, 3, 140, false, 'Front intake'],
  ['trio120-argb', '3 × 120 mm ARGB fan pack', 249, 0, 3, 120, true, 'Front intake'],
  ['trio140-argb', '3 × 140 mm ARGB fan pack', 299, 0, 3, 140, true, 'Front intake'],
  ['quad120-argb', '4 × 120 mm ARGB fan pack', 329, 0, 4, 120, true, 'Front and rear'],
  ['quad140-pwm', '4 × 140 mm PWM fan pack', 349, 0, 4, 140, false, 'Front and top'],
  ['top120-pair', '2 × 120 mm top exhaust fans', 119, 2, 2, 120, false, 'Top exhaust'],
  ['top140-pair', '2 × 140 mm top exhaust fans', 169, 2, 2, 140, false, 'Top exhaust'],
  ['rear120-argb', '1 × 120 mm rear ARGB fan', 89, 1, 1, 120, true, 'Rear exhaust'],
  ['bottom120-pair', '2 × 120 mm bottom intake fans', 149, 2, 2, 120, false, 'Bottom intake'],
  ['side120-trio', '3 × 120 mm side intake fans', 239, 3, 3, 120, true, 'Side intake'],
  ['quiet120-trio', '3 × 120 mm low-noise fans', 279, 0, 3, 120, false, 'Front intake'],
  ['highair120-trio', '3 × 120 mm high-airflow fans', 299, 0, 3, 120, false, 'Front intake'],
  ['reverse120-trio', '3 × 120 mm reverse-blade ARGB fans', 349, 0, 3, 120, true, 'Show side intake'],
  ['reverse140-duo', '2 × 140 mm reverse-blade ARGB fans', 329, 0, 2, 140, true, 'Show side intake'],
  ['argb-controller', 'ARGB fan pack with controller · 3 × 120 mm', 379, 0, 3, 120, true, 'Front intake']
].map(([id, name, price, extra, count, size, rgb, placement]) => ({
  id, name, price, tag: `${count} fan${count > 1 ? 's' : ''} · ${rgb ? 'ARGB' : 'PWM'}`,
  short: `${count} × ${size} mm · ${placement.toLowerCase()}`,
  extra, count, size, rgb, placement, control: '4-pin PWM speed control',
  desc: `${name} provides ${count} ${size} mm fan${count > 1 ? 's' : ''} for ${placement.toLowerCase()}. ${rgb ? 'ARGB lighting needs a compatible 5 V 3-pin motherboard header or included controller.' : 'No lighting is included.'}`,
  fit: `${placement} positions with matching ${size} mm mounting points and enough fan headers or a powered hub.`,
  watch: 'Check airflow direction and available headers; do not connect 5 V ARGB lighting to a 12 V RGB header.'
}));

const lightingOptions = [
  ['amber', 'Amber glow', 0xffa52a, 'solid'], ['ice-blue', 'Ice blue', 0x8be9ff, 'solid'],
  ['mint', 'Mint green', 0x55efb4, 'solid'], ['magenta', 'Magenta', 0xff35c8, 'solid'],
  ['orange', 'Warm orange', 0xff6b2b, 'solid'], ['gold', 'Soft gold', 0xffd166, 'solid'],
  ['teal', 'Teal', 0x13c6b5, 'solid'], ['deep-blue', 'Deep blue', 0x315bff, 'solid'],
  ['lime', 'Lime green', 0x9cff36, 'solid'], ['pink', 'Soft pink', 0xff8fb1, 'solid'],
  ['indigo', 'Indigo', 0x5546d9, 'solid'], ['warm-white', 'Warm white', 0xffdcb5, 'solid'],
  ['cool-white', 'Cool white', 0xcfe8ff, 'solid'], ['sunset', 'Sunset cycle', 0xff652f, 'rainbow'],
  ['ocean', 'Ocean cycle', 0x16a8ff, 'rainbow'], ['forest', 'Forest cycle', 0x2ccc74, 'rainbow'],
  ['pastel', 'Pastel cycle', 0xf2a8ff, 'rainbow'], ['pulse-red', 'Red pulse', 0xff3b3b, 'rainbow'],
  ['pulse-cyan', 'Cyan pulse', 0x35e0ff, 'rainbow'], ['soft-rainbow', 'Soft rainbow cycle', 0xffa8dc, 'rainbow']
].map(([id, name, color, mode]) => ({
  id, name, price: 0, tag: mode === 'rainbow' ? 'Animated effect' : 'Single color',
  short: mode === 'rainbow' ? 'Slow animated color effect' : 'Steady single-color effect',
  color, mode, effect: name, zones: 'All compatible illuminated parts',
  desc: `${name} applies a ${mode === 'rainbow' ? 'slow animated' : 'steady'} effect to compatible illuminated parts. The exact appearance depends on the LEDs and their controller.`,
  fit: 'A cosmetic choice only; lighting does not change performance.',
  watch: 'Requires compatible addressable RGB hardware for per-LED effects; turn lighting off for a no-glow build.'
}));

const olderCpuOptions = [
  ['r3100', 'AMD Ryzen 3 3100', 'AM4', 4, 8, 3.6, 3.9, 16, 65, false, true, 0.68],
  ['r3300x', 'AMD Ryzen 3 3300X', 'AM4', 4, 8, 3.8, 4.3, 16, 65, false, true, 0.78],
  ['r3600', 'AMD Ryzen 5 3600', 'AM4', 6, 12, 3.6, 4.2, 32, 65, false, true, 0.88],
  ['r3700x', 'AMD Ryzen 7 3700X', 'AM4', 8, 16, 3.6, 4.4, 32, 65, false, true, 0.98],
  ['r3950x', 'AMD Ryzen 9 3950X', 'AM4', 16, 32, 3.5, 4.7, 64, 105, false, false, 1.1],
  ['i38100', 'Intel Core i3-8100', 'LGA1151', 4, 4, 3.6, 3.6, 6, 65, true, true, 0.55],
  ['i59400f', 'Intel Core i5-9400F', 'LGA1151', 6, 6, 2.9, 4.1, 9, 65, false, true, 0.67],
  ['i510400f', 'Intel Core i5-10400F', 'LGA1200', 6, 12, 2.9, 4.3, 12, 65, false, true, 0.75],
  ['i711700k', 'Intel Core i7-11700K', 'LGA1200', 8, 16, 3.6, 5.0, 16, 125, true, false, 0.92],
  ['i912900k', 'Intel Core i9-12900K', 'LGA1700', 16, 24, 3.2, 5.2, 30, 125, true, false, 1.2]
].map(([id, name, socket, cores, threads, base, boost, cache, tdp, igpu, boxCooler, cpuScore]) => ({
  id, name, price: Math.round(350 + cpuScore * 800), tag: `Older platform · ${socket}`,
  short: `${cores} cores · ${threads} threads · ${socket}`,
  socket, memory: socket === 'AM4' || socket === 'LGA1151' || socket === 'LGA1200' ? 'DDR4' : 'DDR4 or DDR5, depending on board',
  igpu, igpuScore: igpu ? 0.65 : 0, cpuScore, tdp, cores, threads, base, boost, cache, boxCooler,
  desc: `${name} is an older-generation processor with ${cores} cores and ${threads} threads. Used-market prices and availability vary widely, and the original board BIOS may need an update.`,
  fit: `${socket} upgrades, refurbished systems and lower-cost builds; confirm CPU support on the motherboard maker's list.`,
  watch: `${igpu ? 'Integrated graphics are basic.' : 'A separate graphics card is required.'} Verify socket, BIOS support, cooler mounting and the condition of any used part.`
}));

const extraCoolerOptions = [
  ['retro-92', 'Legacy 92 mm tower cooler', 119, 'tower', 92, 95, 1, 92],
  ['retro-120', 'Legacy 120 mm tower cooler', 149, 'tower', 150, 140, 1, 120],
  ['tower-3pipe', 'Three-heatpipe compact tower cooler', 179, 'tower', 145, 130, 1, 120],
  ['tower-6pipe-quiet', 'Quiet six-heatpipe tower cooler', 379, 'dual', 158, 210, 2, 120],
  ['dual-120-offset', 'Offset dual-tower cooler', 429, 'dual', 160, 230, 2, 120],
  ['dual-92', 'Compact dual-fan 92 mm cooler', 259, 'dual', 125, 150, 2, 92],
  ['aio120', '120 mm liquid cooler', 299, 'aio', 0, 150, 1, 120],
  ['aio280', '280 mm liquid cooler', 599, 'aio', 0, 280, 2, 140],
  ['aio420', '420 mm liquid cooler', 999, 'aio', 0, 340, 3, 140],
  ['aio360-quiet', 'Quiet 360 mm liquid cooler', 849, 'aio', 0, 300, 3, 120]
].map(([id, name, price, kind, height, capacity, fanCount, fanSize]) => ({
  id, name, price, tag: `Additional cooling · ${capacity} W class`,
  short: kind === 'aio' ? `${name.match(/\d+/)?.[0]} mm radiator · ${fanCount} fans` : `${height} mm tall · ${fanCount} fan${fanCount > 1 ? 's' : ''}`,
  kind, height, radiator: kind === 'aio' ? Number(name.match(/\d+/)?.[0]) : undefined,
  sockets: SOCKETS, capacity, fanCount, fanSize, lighting: 'No RGB',
  desc: `${name} uses ${kind === 'aio' ? 'a sealed liquid loop and radiator' : 'an air-cooled fin stack'} rated for roughly ${capacity} W in this catalog estimate. Mounting hardware, fan curves and actual thermal results vary by exact model.`,
  fit: `${kind === 'aio' ? 'A case that explicitly supports this radiator size and thickness' : `${height} mm cooler clearance`} with the selected CPU socket mounting kit.`,
  watch: 'Check the motherboard socket kit, RAM clearance, case dimensions, fan noise and manufacturer warranty.'
}));

const olderBoards = [
  ['b450m', 'B450 micro-ATX DDR4 board', 'AM4', 'DDR4', 'mATX', 4, 2, false],
  ['b450-atx', 'B450 ATX DDR4 board', 'AM4', 'DDR4', 'ATX', 4, 2, false],
  ['x470-atx', 'X470 ATX DDR4 Wi-Fi board', 'AM4', 'DDR4', 'ATX', 4, 2, true],
  ['a320m', 'A320 micro-ATX legacy board', 'AM4', 'DDR4', 'mATX', 2, 1, false],
  ['h310m', 'H310 micro-ATX legacy board', 'LGA1151', 'DDR4', 'mATX', 2, 1, false],
  ['b365m', 'B365 micro-ATX legacy board', 'LGA1151', 'DDR4', 'mATX', 4, 1, false],
  ['z390-atx', 'Z390 ATX legacy board', 'LGA1151', 'DDR4', 'ATX', 4, 2, false],
  ['b460m', 'B460 micro-ATX DDR4 board', 'LGA1200', 'DDR4', 'mATX', 4, 2, false],
  ['z490-atx', 'Z490 ATX DDR4 Wi-Fi board', 'LGA1200', 'DDR4', 'ATX', 4, 2, true],
  ['h470m', 'H470 micro-ATX DDR4 board', 'LGA1200', 'DDR4', 'mATX', 4, 2, false]
].map(([id, name, socket, ram, form, slots, m2, wifi]) => ({
  id, name, price: 400 + slots * 75 + m2 * 60, tag: `Legacy chipset · ${socket}`,
  short: `${form === 'mATX' ? 'micro-ATX' : form} · ${ram} · ${slots} slots · ${m2} M.2`,
  socket, ram, form, slots, m2, wifi, wifiType: wifi ? 'Wi-Fi (module varies)' : 'None',
  usbRear: 'Typical legacy layout: USB-A 5 Gb/s and USB 2.0; exact count varies by board',
  usbFront: 'USB 2.0 and USB 3.x headers vary by board; confirm case connectors',
  pcie: 'Generation and lane layout depend on CPU and board revision',
  lan: 'Gigabit Ethernet typical; exact controller varies',
  desc: `${name} is an older-platform reference option. CPU support depends on chipset, BIOS version and the manufacturer's compatibility list; onboard USB and storage layouts vary substantially.`,
  fit: `${socket} processors listed by this exact board revision and ${ram} memory. Check BIOS support before upgrading a CPU.`,
  watch: 'Legacy inventory may be used or refurbished. Confirm the socket, BIOS, USB I/O, M.2 generation and warranty with the seller.'
}));

const extraRamOptions = [
  ['8ddr3', '8 GB DDR3 (2 × 4 GB)', 'DDR4', 8, 2, 1600, 11],
  ['16ddr3', '16 GB DDR3 (2 × 8 GB)', 'DDR4', 16, 2, 1600, 11],
  ['16ddr4-2666', '16 GB DDR4 (2 × 8 GB) · 2666', 'DDR4', 16, 2, 2666, 19],
  ['32ddr4-2666', '32 GB DDR4 (2 × 16 GB) · 2666', 'DDR4', 32, 2, 2666, 19],
  ['16ddr4-3000', '16 GB DDR4 (2 × 8 GB) · 3000', 'DDR4', 16, 2, 3000, 16],
  ['64ddr4-2666', '64 GB DDR4 (4 × 16 GB) · 2666', 'DDR4', 64, 4, 2666, 19],
  ['16ddr5-4800', '16 GB DDR5 (2 × 8 GB) · 4800', 'DDR5', 16, 2, 4800, 40],
  ['32ddr5-4800', '32 GB DDR5 (2 × 16 GB) · 4800', 'DDR5', 32, 2, 4800, 40],
  ['48ddr5-6400', '48 GB DDR5 (2 × 24 GB) · 6400', 'DDR5', 48, 2, 6400, 32],
  ['128ddr5-5200', '128 GB DDR5 (4 × 32 GB) · 5200', 'DDR5', 128, 4, 5200, 40]
].map(([id, name, type, capacity, sticks, speed, cl]) => ({
  id, name, price: Math.round(180 + capacity * (type === 'DDR5' ? 13 : 8)), tag: `Older/specialist kit · ${type}`,
  short: `${capacity} GB · ${speed} MT/s · CL${cl} · ${sticks} sticks`,
  type, capacity, sticks, speed, cl, voltage: 'Typical voltage varies by module',
  profile: 'JEDEC speed or optional XMP/EXPO; check module and board support',
  desc: `${name} is a reference memory configuration for upgrades and platform-specific builds. Actual module density, rank, speed profile and supported capacity depend on the exact kit and motherboard BIOS.`,
  fit: `A ${type} motherboard with ${sticks} open slots and support for this capacity.`,
  watch: 'Do not mix kits unless the board maker supports the resulting configuration; advertised profile speed is not guaranteed on every CPU.'
}));

const olderGpuOptions = [
  ['gtx1050ti', 'NVIDIA GeForce GTX 1050 Ti 4 GB', 550, 1.2, 75, 300, 145, 4, 'GDDR5', 'dual'],
  ['gtx1060-6', 'NVIDIA GeForce GTX 1060 6 GB', 699, 1.8, 120, 400, 250, 6, 'GDDR5', 'dual'],
  ['gtx1070', 'NVIDIA GeForce GTX 1070 8 GB', 899, 2.4, 150, 500, 267, 8, 'GDDR5', 'dual'],
  ['gtx1080', 'NVIDIA GeForce GTX 1080 8 GB', 1199, 3.0, 180, 500, 267, 8, 'GDDR5X', 'dual'],
  ['gtx1660s', 'NVIDIA GeForce GTX 1660 SUPER 6 GB', 999, 2.8, 125, 450, 229, 6, 'GDDR6', 'dual'],
  ['gtx1650', 'NVIDIA GeForce GTX 1650 4 GB', 649, 1.5, 75, 300, 170, 4, 'GDDR5', 'dual'],
  ['rx570', 'AMD Radeon RX 570 8 GB', 599, 1.7, 150, 450, 250, 8, 'GDDR5', 'dual'],
  ['rx580', 'AMD Radeon RX 580 8 GB', 699, 2.0, 185, 500, 270, 8, 'GDDR5', 'dual'],
  ['rx5500xt', 'AMD Radeon RX 5500 XT 8 GB', 899, 2.4, 130, 450, 230, 8, 'GDDR6', 'dual'],
  ['rx5600xt', 'AMD Radeon RX 5600 XT 6 GB', 1099, 3.0, 150, 500, 250, 6, 'GDDR6', 'dual']
].map(([id, name, price, score, watts, minPsu, length, vram, mem, kind]) => ({
  id, name, price, tag: `Older generation · ${vram} GB`,
  short: `${vram} GB ${mem} · about ${watts} W · ${length} mm`,
  score, watts, minPsu, length, kind, vram, mem,
  color: name.includes('Radeon') ? 0xd24a3a : 0x76b900,
  bus: 'Model-dependent; check exact board specifications',
  powerConnector: watts <= 75 ? 'PCIe slot power (verify exact card)' : '6-pin or 8-pin PCIe (verify exact card)',
  desc: `${name} is an older graphics-card family for budget upgrades and legacy systems. Its performance, driver support, power connectors and board size vary by manufacturer and card revision.`,
  fit: 'Older or entry-level 1080p systems; check supported drivers and current game requirements.',
  watch: `A ${length} mm card with an estimated ${watts} W board draw. Used cards may have heavy wear; verify condition, fan noise, warranty and power connectors.`
}));

const extraStorageOptions = [
  ['120sata', '120 GB 2.5-inch SATA SSD', 99, 120, 'SATA III SSD', 500, false, '2.5-inch'],
  ['240sata', '240 GB 2.5-inch SATA SSD', 119, 240, 'SATA III SSD', 520, false, '2.5-inch'],
  ['480sata', '480 GB 2.5-inch SATA SSD', 189, 480, 'SATA III SSD', 550, false, '2.5-inch'],
  ['960sata', '960 GB 2.5-inch SATA SSD', 349, 960, 'SATA III SSD', 560, false, '2.5-inch'],
  ['120sata-legacy', '120 GB 2.5-inch SATA HDD', 139, 120, 'SATA HDD · 5400 RPM', 90, false, '2.5-inch'],
  ['320hdd', '320 GB 3.5-inch 7200 RPM hard drive', 199, 320, 'SATA HDD · 7200 RPM', 120, false, '3.5-inch'],
  ['500hdd', '500 GB 3.5-inch 7200 RPM hard drive', 229, 500, 'SATA HDD · 7200 RPM', 150, false, '3.5-inch'],
  ['750hdd', '750 GB 3.5-inch 7200 RPM hard drive', 279, 750, 'SATA HDD · 7200 RPM', 160, false, '3.5-inch'],
  ['10tbhdd', '10 TB 3.5-inch 7200 RPM hard drive', 1699, 10000, 'SATA HDD · 7200 RPM', 270, false, '3.5-inch'],
  ['16tbhdd', '16 TB 3.5-inch 7200 RPM hard drive', 2799, 16000, 'SATA HDD · 7200 RPM', 280, false, '3.5-inch']
].map(([id, name, price, capacity, interfaceType, read, gen4, formFactor]) => ({
  id, name, price, tag: `Legacy capacity · ${capacity >= 1000 ? `${capacity / 1000} TB` : `${capacity} GB`}`,
  short: `${formFactor} · up to ${read} MB/s`,
  capacity, interface: interfaceType, read, gen4, formFactor,
  write: interfaceType.includes('HDD') ? `${Math.round(read * 0.8)} MB/s approximate` : 'Up to 500 MB/s; exact model varies',
  endurance: interfaceType.includes('HDD') ? 'Mechanical drive; protect from shock' : 'Check model-specific TBW rating and warranty',
  desc: `${name} is an older-capacity option for legacy upgrades, archives or secondary storage. The speed shown is a broad sequential estimate, not guaranteed sustained performance.`,
  fit: `A free ${formFactor} mount, SATA data port and SATA power connector.`
}));

const extraPsuOptions = [
  ['300w-oem', '300 W OEM power supply', 149, 300, 'Standard efficiency', false, 'OEM', 'No auxiliary GPU connector'],
  ['400w-atx', '400 W ATX power supply', 219, 400, '80 PLUS White', false, 'ATX 2.3', '1 × 6-pin PCIe'],
  ['430w-bronze', '430 W 80+ Bronze PSU', 249, 430, 'Bronze', false, 'ATX 2.4', '1 × 6+2-pin PCIe'],
  ['480w-bronze', '480 W 80+ Bronze PSU', 279, 480, 'Bronze', false, 'ATX 2.4', '2 × 6+2-pin PCIe'],
  ['520w-bronze', '520 W 80+ Bronze PSU', 329, 520, 'Bronze', false, 'ATX 2.4', '2 × 6+2-pin PCIe'],
  ['600w-gold', '600 W 80+ Gold PSU', 479, 600, 'Gold', false, 'ATX 2.52', '2 × 8-pin PCIe'],
  ['620w-bronze', '620 W 80+ Bronze PSU', 399, 620, 'Bronze', false, 'ATX 2.4', '2 × 8-pin PCIe'],
  ['650w-platinum', '650 W 80+ Platinum PSU', 799, 650, 'Platinum', true, 'ATX 2.52', '2 × 8-pin PCIe'],
  ['700w-gold', '700 W 80+ Gold modular PSU', 649, 700, 'Gold', true, 'ATX 2.52', '4 × 8-pin PCIe'],
  ['1600w-gold', '1600 W 80+ Gold enthusiast PSU', 3299, 1600, 'Gold', true, 'ATX 3.1', '12V-2x6 plus 6 × 8-pin PCIe']
].map(([id, name, price, watts, efficiency, modular, standard, gpuCables]) => ({
  id, name, price, tag: `Specialist/legacy · ${watts} W`,
  short: `${watts} W · ${efficiency} · ${modular ? 'modular' : 'fixed cables'}`,
  watts, efficiency, modular, standard, gpuCables,
  warranty: 'Check the exact model and manufacturing date; warranty differs widely',
  desc: `${name} is a reference option for legacy, low-power or specialist systems. Its connector set and efficiency class are not a substitute for checking independent safety and reliability testing.`,
  fit: `Systems whose measured/recommended power needs and connectors match this exact supply.`,
  watch: 'Avoid old, unknown or untested units for valuable hardware; never reuse modular cables across PSU models.'
}));

const extraCases = [
  ['retro-atx-window', 'Classic ATX tower with acrylic window', 279, 280, 155, [240], ['mATX', 'ATX'], 2, 'budget', 'dark', '2 × USB-A 2.0, audio', 'Steel frame with acrylic side window', 'One 120 mm rear exhaust; one front intake mount', 'Removable front mesh; no bottom filter', 'Two 3.5-inch and two 2.5-inch mounts', '140 mm'],
  ['retro-matx-cube', 'Classic micro-ATX cube chassis', 249, 250, 145, [120, 240], ['mATX'], 1, 'cube', 'dark', '2 × USB-A 2.0, audio', 'Steel panels and compact cube layout', 'Single rear 92 mm fan included', 'Front mesh filter; removable top filter', 'One 3.5-inch and two 2.5-inch mounts', '120 mm'],
  ['retro-full-atx', 'Classic full-tower ATX chassis', 449, 360, 170, [240], ['mATX', 'ATX'], 3, 'tower', 'dark', '4 × USB-A 2.0, audio', 'Steel frame with removable drive cages', 'Two front intakes and one rear exhaust', 'Front and bottom removable filters', 'Six 3.5-inch and four 2.5-inch mounts', '120 mm'],
  ['retro-silver-atx', 'Silver-front ATX airflow tower', 359, 330, 160, [240], ['mATX', 'ATX'], 2, 'budget', 'light', '2 × USB-A 2.0, audio', 'Steel chassis with silver front fascia', 'One rear exhaust; two front mounts', 'Front mesh filter', 'Three 3.5-inch and two 2.5-inch mounts', '120 mm'],
  ['retro-lanbox', 'Compact LAN-party micro-ATX case', 399, 300, 150, [240], ['mATX'], 2, 'compact', 'dark', '2 × USB-A 3.0, audio', 'Short-depth steel chassis with carry-friendly top grip', 'One front intake and one rear exhaust', 'Front and bottom filters', 'Two 2.5-inch mounts; one 3.5-inch mount', '120 mm'],
  ['matx-glass-white', 'White micro-ATX tempered-glass case', 499, 335, 165, [240, 360], ['mATX'], 4, 'matxglass', 'light', '2 × USB-A 5 Gb/s, 1 × USB-C 5 Gb/s, audio', 'Powder-coated steel with tempered-glass side panel', 'Two front intake and one rear exhaust included', 'Front and PSU intake filters', 'Two 3.5-inch and two 2.5-inch mounts', '120 mm'],
  ['silent-window-atx', 'Sound-damped ATX case with window', 649, 370, 175, [240, 360], ['mATX', 'ATX'], 3, 'silent', 'dark', '2 × USB-A 5 Gb/s, audio', 'Steel side panels with acoustic lining and small glass window', 'Two front intake and one rear exhaust', 'Front, roof and PSU removable filters', 'Three 3.5-inch and four 2.5-inch mounts', '140 mm'],
  ['mesh-front-minimal', 'Minimal mesh-front ATX tower', 479, 375, 170, [240, 360], ['mATX', 'ATX'], 3, 'mesh', 'dark', '2 × USB-A 5 Gb/s, 1 × USB-C 10 Gb/s, audio', 'Steel mesh front, tool-free side glass and cable channel', 'Two front PWM fans and one rear fan included', 'Magnetic top and slide-out PSU filters', 'Two 3.5-inch and three 2.5-inch mounts', '140 mm'],
  ['panorama-matx-white', 'White panoramic micro-ATX case', 699, 355, 170, [240, 360], ['mATX'], 5, 'fishbowl', 'light', '2 × USB-A 5 Gb/s, 1 × USB-C 10 Gb/s, audio', 'Dual tempered-glass display panels with side intake', 'Three side intake and one rear exhaust included', 'Bottom intake filter', 'Two 2.5-inch mounts; one 3.5-inch mount', '120 mm'],
  ['workstation-full-atx', 'Workstation full tower with drive cage', 1099, 460, 195, [240, 280, 360, 420], ['mATX', 'ATX'], 5, 'towerglass', 'dark', '2 × USB-A 10 Gb/s, 2 × USB-C 10 Gb/s, audio', 'Reinforced steel frame with removable modular drive cage', 'Three front intake and two roof/rear exhaust positions', 'Front, top and PSU filters', 'Six 3.5-inch and six 2.5-inch mounts', '140 mm']
].map(([id, name, price, maxGpu, maxCooler, radiators, forms, fans, style, finish, frontUsb, materials, includedFanLayout, filters, driveBays, fanMounts]) => ({
  id, name, price, tag: `Detailed case · ${forms.includes('ATX') ? 'ATX' : 'micro-ATX'} · ${fans} fans`,
  short: `${maxGpu} mm GPU · ${maxCooler} mm cooler · ${driveBays}`,
  maxGpu, maxCooler, radiators, forms, fans, style, finish, frontUsb,
  materials, includedFanLayout, filters, driveBays, fanMounts,
  expansionSlots: forms.includes('ATX') ? 7 : 4,
  desc: `${name} uses ${materials.toLowerCase()}. It supports graphics cards up to ${maxGpu} mm, CPU coolers up to ${maxCooler} mm, and ${radiators.join('/')} mm radiators at supported positions. ${includedFanLayout}.`,
  fit: `${forms.map((form) => form === 'mATX' ? 'micro-ATX' : form).join(' or ')} builds with a matching PSU and verified component clearances.`,
  watch: `Dust filters: ${filters}. Drive mounts: ${driveBays}. Front I/O: ${frontUsb}. Confirm radiator thickness, drive-cage clearance and exact measurements with the case manual.`,
  radiatorPositions: 'Front and roof mounts; exact thickness/clearance varies',
  cableSpace: 'Cable-routing depth varies by chassis; verify the manual'
}));

const specialistCases = [
  ['mesh-compact-360', 'Compact high-airflow ATX tower', 629, 390, 175, [240, 280, 360], ['mATX', 'ATX'], 4, 'mesh', 'dark', '2 × USB-A 5 Gb/s, 1 × USB-C 10 Gb/s, headset combo', 'Powder-coated 0.7 mm steel frame, removable fine-mesh front, 4 mm tempered-glass side', 'Three 140 mm PWM front intakes and one 120 mm rear exhaust; supports balanced positive pressure', 'Magnetic roof filter, tool-free front mesh, slide-out PSU filter', 'Two 3.5-inch trays plus two dedicated 2.5-inch mounts; lower tray removable for GPU clearance', 'Front 3 × 120/140 mm; roof 3 × 120 or 2 × 140 mm; rear 1 × 120/140 mm', '478 × 230 × 472 mm', 'Front or roof; roof clearance depends on motherboard heatsinks and radiator/fan stack', '25 mm behind motherboard tray; two cable grommet rows; PSU length up to 220 mm'],
  ['silent-studio-atx', 'Studio acoustic ATX mid-tower', 899, 380, 180, [240, 280, 360], ['mATX', 'ATX'], 3, 'silent', 'dark', '2 × USB-A 10 Gb/s, 1 × USB-C 20 Gb/s, audio combo', 'Thick steel panels with replaceable acoustic lining, reinforced glass side window and rubber grommets', 'Two 140 mm front intakes and one 140 mm rear exhaust with low-noise bearings', 'Full front, roof and PSU filters; front panel releases without tools for cleaning', 'Two 3.5-inch trays and four 2.5-inch sleds; trays can be repositioned or removed', 'Front 3 × 120/140 mm; roof 2 × 120/140 mm; rear 1 × 120/140 mm', '486 × 230 × 477 mm', 'Front 360 mm or roof 240/280 mm; verify top RAM and VRM clearance', '30 mm behind tray with wide tie-down channels; PSU bay supports 240 mm units'],
  ['panorama-side-intake-atx', 'Panoramic side-intake showcase', 1099, 430, 185, [240, 280, 360], ['mATX', 'ATX'], 6, 'fishbowl', 'dark', '2 × USB-A 10 Gb/s, 1 × USB-C 20 Gb/s, headset combo', 'Seamless front/side tempered glass, steel base, removable side intake rail and 8 mm aluminum-look frame', 'Three 120 mm side intakes, two roof exhausts and one rear exhaust; side fans wash the GPU directly', 'Bottom and side-intake filters pull out from the front; roof filter is magnetic', 'Two 3.5-inch trays in the rear chamber and three 2.5-inch mounts behind the board', 'Side 3 × 120 mm; roof 3 × 120/140 mm; rear 1 × 120 mm; bottom 2 × 120 mm', '505 × 245 × 485 mm', 'Roof up to 360 mm or side 360 mm; avoid overlapping thick radiators and long cards', '35 mm rear cable chamber with hidden PSU bay and labeled pass-throughs'],
  ['dual-chamber-atx-8', 'Eight-fan dual-chamber ATX display tower', 1399, 460, 190, [240, 280, 360, 420], ['mATX', 'ATX'], 8, 'towerglass', 'dark', '2 × USB-A 10 Gb/s, 2 × USB-C 10 Gb/s, audio combo', 'Steel dual-chamber frame, two tempered-glass display panels and a hidden cable/PSU compartment', 'Three side intakes, three roof exhausts, one rear exhaust and one bottom intake; included hub supports PWM/ARGB', 'Slide-out bottom intake and roof filters plus a removable side mesh strip', 'Two 3.5-inch trays and four 2.5-inch mounts in the rear chamber; no drive cage in the main airflow path', 'Side 3 × 120 mm; roof 3 × 120/140 mm; bottom 3 × 120 mm; rear 1 × 120 mm', '520 × 245 × 510 mm', 'Roof 420 mm, side 360 mm, or bottom 360 mm depending on GPU width', '40 mm behind tray; separate 250 mm PSU chamber; multiple reusable cable straps'],
  ['server-drive-atx', 'Storage-focused ATX workstation tower', 1249, 450, 190, [240, 280, 360], ['mATX', 'ATX'], 5, 'tower', 'dark', '2 × USB-A 10 Gb/s, 1 × USB-C 20 Gb/s, audio combo', 'Rigid steel chassis, ventilated front door, removable modular drive cage and clear service access', 'Two 140 mm filtered front intakes, one rear exhaust and two roof mounts; front door has side intake channels', 'Washable front-door filter, roof filter and bottom PSU filter', 'Four 3.5-inch hot-swap-style tool-less trays plus four 2.5-inch mounts; confirm cage/cable clearance', 'Front 2 × 140 mm; roof 3 × 120 or 2 × 140 mm; rear 1 × 120/140 mm', '520 × 235 × 510 mm', 'Front 360 mm with drive cage removed; roof 280/360 mm subject to board clearance', '28 mm rear channel; PSU up to 230 mm with cage fitted; removable cage frees GPU space'],
  ['lan-matx-airflow', 'Carry-friendly LAN micro-ATX tower', 579, 330, 165, [120, 240, 280], ['mATX'], 3, 'compact', 'light', '2 × USB-A 5 Gb/s, 1 × USB-C 10 Gb/s, headset combo', 'Short-depth 0.8 mm steel frame, reinforced top carry points and captive thumbscrews', 'Two 140 mm front intakes and one 120 mm rear exhaust; front mesh avoids restrictive solid panels', 'Removable front and bottom filters; raised feet leave room for PSU intake', 'One 3.5-inch tray and two 2.5-inch mounts; tray is removable for long graphics cards', 'Front 2 × 120/140 mm; roof 2 × 120 mm; rear 1 × 120 mm', '405 × 215 × 405 mm', 'Front 240 mm or roof 240 mm; compact layout needs radiator thickness checked', '22 mm behind tray with two large cable pass-throughs; SFX/ATX PSU supported subject to length'],
  ['cube-matx-radiator', 'Wide micro-ATX cube with radiator deck', 699, 360, 170, [240, 280, 360], ['mATX'], 5, 'cube', 'dark', '2 × USB-A 10 Gb/s, 1 × USB-C 10 Gb/s, audio combo', 'Wide steel cube chassis, tempered-glass side and removable upper fan/radiator deck', 'Two side intakes feed the board and GPU; two roof exhausts and one rear exhaust', 'Side and roof magnetic filters; bottom filter slides out toward the front', 'Two 3.5-inch trays and three 2.5-inch mounts; tray positions avoid the main GPU path', 'Side 2 × 120/140 mm; roof 3 × 120 mm; rear 1 × 120 mm; bottom 2 × 120 mm', '410 × 300 × 430 mm', 'Roof 360 mm or side 280 mm; check radiator width against motherboard and RAM', '26 mm rear cable space; PSU up to 200 mm; dedicated side channel for front-panel leads'],
  ['glass-airflow-atx', 'Tempered-glass airflow ATX tower', 779, 420, 180, [240, 280, 360], ['mATX', 'ATX'], 5, 'showcase', 'light', '2 × USB-A 10 Gb/s, 1 × USB-C 20 Gb/s, audio combo', 'White powder-coated steel, 4 mm tempered-glass side and perforated steel front intake', 'Three 120 mm front intakes and two roof exhausts; rear fan position available for a sixth fan', 'Full-length front filter, magnetic roof screen and slide-out PSU filter', 'Two 3.5-inch trays plus three 2.5-inch brackets; trays remove for radiator clearance', 'Front 3 × 120/140 mm; roof 3 × 120 or 2 × 140 mm; rear 1 × 120 mm', '485 × 230 × 465 mm', 'Front 360 mm or roof 280/360 mm depending on motherboard and RAM', '27 mm behind tray; broad grommets and 220 mm PSU clearance with drive cage fitted'],
  ['airflow-xl-420', 'XL high-airflow ATX tower', 1199, 480, 200, [280, 360, 420], ['mATX', 'ATX'], 6, 'tower', 'dark', '2 × USB-A 10 Gb/s, 2 × USB-C 10 Gb/s, audio combo', 'Heavy steel frame with fine-mesh front, reinforced glass panel and tool-less expansion covers', 'Three 140 mm intake fans, two roof exhausts and one rear exhaust; unobstructed front-to-back path', 'Front, roof and PSU filters are removable; front mesh panel is washable after removal', 'Three 3.5-inch trays and four 2.5-inch mounts; bottom cage moves to create GPU/radiator space', 'Front 3 × 120/140 mm; roof 3 × 120/140 mm; rear 1 × 120/140 mm; bottom 2 × 120 mm', '540 × 250 × 530 mm', 'Roof 420 mm or front 360 mm; long radiator stacks may reduce GPU length', '32 mm rear space, multiple tie-down points; up to 250 mm PSU with cages removed'],
  ['workstation-glass-silent', 'Workstation glass tower with filtered intake', 1549, 470, 195, [280, 360, 420], ['mATX', 'ATX'], 7, 'towerglass', 'light', '2 × USB-A 10 Gb/s, 1 × USB-C 20 Gb/s, 1 × USB-C 5 Gb/s, audio', 'Reinforced white steel frame, double tempered-glass panels and removable side mesh intake channel', 'Three side intake fans, three roof exhaust positions and one rear exhaust; PWM hub included', 'Side, roof and PSU filters; each filter is tool-free and washable', 'Two 3.5-inch trays and six 2.5-inch mounts in a separate rear chamber', 'Side 3 × 120/140 mm; roof 3 × 120/140 mm; bottom 2 × 120 mm; rear 1 × 120 mm', '535 × 250 × 520 mm', 'Roof 420 mm or side 360 mm; confirm fan/radiator stack does not overlap GPU power leads', '38 mm rear channel, dedicated PSU room and 2.5-inch SSD wall; cable ties included']
].map(([id, name, price, maxGpu, maxCooler, radiators, forms, fans, style, finish, frontUsb, materials, includedFanLayout, filters, driveBays, fanMounts, dimensions, radiatorPositions, cableSpace]) => ({
  id, name, price, tag: `Detailed case · ${forms.includes('ATX') ? 'ATX' : 'micro-ATX'} · ${fans} fans`,
  short: `${maxGpu} mm GPU · ${maxCooler} mm cooler · ${dimensions}`,
  maxGpu, maxCooler, radiators, forms, fans, style, finish, frontUsb,
  materials, includedFanLayout, filters, driveBays, fanMounts, dimensions,
  expansionSlots: forms.includes('ATX') ? 7 : 4, radiatorPositions, cableSpace,
  desc: `${name} measures ${dimensions}. The chassis uses ${materials.toLowerCase()}. Included airflow: ${includedFanLayout}. Dust management: ${filters}.`,
  fit: `${forms.map((form) => form === 'mATX' ? 'micro-ATX' : form).join(' or ')} boards; graphics cards up to ${maxGpu} mm and CPU coolers up to ${maxCooler} mm. Check radiator/fan stack thickness against GPU, RAM and motherboard heatsinks.`,
  watch: `Front I/O: ${frontUsb}. Drive capacity: ${driveBays}. Cable allowance: ${cableSpace}. Published dimensions and clearances are concept estimates; confirm the exact product revision before buying.`
}));

const extraFans = [
  ['single80', '1 × 80 mm legacy case fan', 39, 0, 1, 80, false, 'Rear exhaust'],
  ['single92', '1 × 92 mm legacy case fan', 45, 0, 1, 92, false, 'Rear exhaust'],
  ['single200', '1 × 200 mm low-speed case fan', 99, 0, 1, 200, false, 'Front intake'],
  ['duo80', '2 × 80 mm legacy fan pack', 69, 0, 2, 80, false, 'Rear exhaust'],
  ['trio92', '3 × 92 mm compact fan pack', 149, 0, 3, 92, false, 'Compact intake/exhaust'],
  ['trio120-silent', '3 × 120 mm quiet PWM fan pack', 249, 0, 3, 120, false, 'Front intake'],
  ['trio120-white', '3 × 120 mm white ARGB fans', 279, 0, 3, 120, true, 'Front intake'],
  ['duo200', '2 × 200 mm slow-turning fans', 249, 0, 2, 200, false, 'Front intake'],
  ['trio120-link', '3 × 120 mm daisy-chain ARGB fans', 329, 0, 3, 120, true, 'Front intake'],
  ['trio140-quiet', '3 × 140 mm quiet PWM fans', 329, 0, 3, 140, false, 'Front intake']
].map(([id, name, price, extra, count, size, rgb, placement]) => ({
  id, name, price, tag: `Additional cooling · ${size} mm`,
  short: `${count} × ${size} mm · ${placement.toLowerCase()}`,
  extra, count, size, rgb, placement, control: 'Fan controller/header compatibility varies',
  desc: `${name} adds airflow at ${placement.toLowerCase()} positions. Larger fans can move air at lower RPM in compatible cases, while small fans fit older and compact mounts.`,
  fit: `A case with matching ${size} mm holes, adequate clearance and available fan power connections.`,
  watch: 'Verify the fan connector, airflow direction, motherboard header current limit and lighting voltage before connecting.'
}));

const extraLighting = [
  ['nocturne', 'Nocturne (dim violet)', 0x56408a, 'solid'],
  ['coral', 'Coral', 0xff786b, 'solid'],
  ['arctic', 'Arctic white-blue', 0xb9e8ff, 'solid'],
  ['copper', 'Copper', 0xc47b42, 'solid'],
  ['ultraviolet', 'Ultraviolet', 0x6a00ff, 'solid'],
  ['spring', 'Spring green', 0x8be28b, 'solid'],
  ['candle', 'Candlelight', 0xffb86b, 'solid'],
  ['monochrome', 'Monochrome fade', 0xd9e1e4, 'rainbow'],
  ['aurora', 'Aurora drift', 0x51d6bd, 'rainbow'],
  ['slow-pulse-violet', 'Slow violet pulse', 0x956bff, 'rainbow']
].map(([id, name, color, mode]) => ({
  id, name, price: 0, tag: 'Additional lighting preset',
  short: mode === 'rainbow' ? 'Slow animated effect' : 'Steady single color',
  color, mode, effect: name, zones: 'Compatible case, cooler and component LEDs',
  desc: `${name} is a visual-only lighting preset for compatible LEDs. Color reproduction and animation vary with the hardware, controller and vendor software.`,
  fit: 'Appearance customization; no performance or temperature effect.',
  watch: 'The 3D preview is illustrative. Real RGB/ARGB devices require a compatible controller and correctly matched 5 V or 12 V connector.'
}));

const osOptions = [
  ['win7', 'Microsoft Windows 7', 'Windows', 'Legacy desktop OS', 'Mainstream support ended; not suitable for routine internet use.'],
  ['win8', 'Microsoft Windows 8', 'Windows', 'Legacy desktop OS', 'Support ended; consider a supported OS for an internet-connected PC.'],
  ['win81', 'Microsoft Windows 8.1', 'Windows', 'Legacy desktop OS', 'Support ended; modern hardware and software compatibility is limited.'],
  ['win10', 'Microsoft Windows 10', 'Windows', 'Desktop OS', 'Standard support ended in October 2025; check current ESU eligibility and software needs.'],
  ['win11', 'Microsoft Windows 11', 'Windows', 'Desktop OS', 'Check CPU, TPM, Secure Boot and memory requirements before installing.'],
  ['ubuntu', 'Ubuntu Desktop', 'Linux', 'Beginner-friendly general desktop', 'LTS releases receive longer maintenance; choose a current supported release.'],
  ['kubuntu', 'Kubuntu', 'Linux', 'KDE Plasma desktop', 'Ubuntu-based; choose a supported release and review its hardware requirements.'],
  ['xubuntu', 'Xubuntu', 'Linux', 'Lightweight XFCE desktop', 'Ubuntu-based; a practical option for modest or older PCs.'],
  ['lubuntu', 'Lubuntu', 'Linux', 'Lightweight LXQt desktop', 'Ubuntu-based; verify peripheral and graphics support for the chosen release.'],
  ['linuxmint', 'Linux Mint Cinnamon', 'Linux', 'Familiar desktop for newcomers', 'Based on Ubuntu LTS; check the supported version and driver manager.'],
  ['linuxmint-xfce', 'Linux Mint XFCE', 'Linux', 'Lighter Mint desktop', 'A lighter desktop option; test Wi-Fi and graphics in a live session.'],
  ['debian', 'Debian', 'Linux', 'Stable general-purpose OS', 'Stable releases favor reliability; some hardware may need newer firmware.'],
  ['fedora', 'Fedora Workstation', 'Linux', 'Up-to-date GNOME desktop', 'Frequent releases; plan regular upgrades and review codec/driver support.'],
  ['fedora-kde', 'Fedora KDE Plasma', 'Linux', 'Current KDE desktop', 'Frequent releases; check release lifecycle before installing.'],
  ['popos', 'Pop!_OS', 'Linux', 'Desktop and gaming oriented', 'Check current release availability and NVIDIA/AMD driver instructions.'],
  ['zorin', 'Zorin OS Core', 'Linux', 'Familiar desktop for switching users', 'Based on Ubuntu; review system requirements and supported release dates.'],
  ['elementary', 'elementary OS', 'Linux', 'Polished, simple desktop', 'Check supported release and app availability for your workflow.'],
  ['opensuse-leap', 'openSUSE Leap', 'Linux', 'Stable community distribution', 'Review release support and hardware enablement requirements.'],
  ['opensuse-tumbleweed', 'openSUSE Tumbleweed', 'Linux', 'Continuously updated rolling release', 'Rolling updates are frequent; keep backups and update carefully.'],
  ['arch', 'Arch Linux', 'Linux', 'Do-it-yourself rolling release', 'Installation and maintenance require comfort with manual configuration.'],
  ['manjaro', 'Manjaro', 'Linux', 'Accessible Arch-based desktop', 'Rolling-release updates need regular maintenance and backups.'],
  ['endeavouros', 'EndeavourOS', 'Linux', 'Lightweight Arch-based system', 'Community distribution; expect hands-on system administration.'],
  ['mxlinux', 'MX Linux', 'Linux', 'Stable, resource-conscious desktop', 'Check hardware support and choose the current supported release.'],
  ['linuxlite', 'Linux Lite', 'Linux', 'Lightweight desktop for older PCs', 'Verify the current release requirements and support dates.'],
  ['rocky', 'Rocky Linux', 'Linux', 'Enterprise-compatible server/workstation', 'More server focused; desktop hardware and third-party apps may need setup.'],
  ['alma', 'AlmaLinux', 'Linux', 'Enterprise-compatible Linux', 'More server focused; check graphics drivers and desktop support for your use.'],
  ['nobara', 'Nobara Linux', 'Linux', 'Gaming and media-focused Fedora variant', 'Community-maintained; review update and support policies.'],
  ['kalilinux', 'Kali Linux', 'Linux', 'Security testing distribution', 'Designed for authorized security work; not recommended as a general daily desktop.'],
  ['parrot', 'Parrot OS Home', 'Linux', 'Privacy and development desktop', 'Select Home edition for general use; security tools must be used lawfully.'],
  ['bodhi', 'Bodhi Linux', 'Linux', 'Very lightweight desktop', 'Check release support and the compatibility of older peripherals.']
].map(([id, name, family, purpose, note]) => ({
  id, name, price: 0, tag: `${family} · OS selection`, short: purpose,
  family, purpose, supportNote: note,
  desc: `${name} is an operating-system choice only; this builder does not install or include a license, activation key, recovery media or technical support. Download from the official project/vendor site and review its license.`,
  fit: `${purpose}; verify processor architecture, driver availability, application compatibility and current support status before installation.`,
  watch: note
}));

export function addCatalogOptions(catalog) {
  catalog.cpu.push(...cpuOptions);
  catalog.cooler.push(...coolerOptions);
  catalog.motherboard.push(...boardOptions);
  catalog.ram.push(...ramOptions);
  catalog.gpu.push(...gpuOptions);
  catalog.storage.push(...storageOptions);
  catalog.psu.push(...psuOptions);
  catalog.case.push(...caseOptions);
  catalog.fans.push(...fanOptions);
  catalog.lighting.push(...lightingOptions);
  catalog.cpu.push(...olderCpuOptions);
  catalog.cooler.push(...extraCoolerOptions);
  catalog.motherboard.push(...olderBoards);
  catalog.ram.push(...extraRamOptions);
  catalog.gpu.push(...olderGpuOptions);
  catalog.storage.push(...extraStorageOptions);
  catalog.psu.push(...extraPsuOptions);
  catalog.case.push(...extraCases);
  catalog.case.push(...specialistCases);
  catalog.fans.push(...extraFans);
  catalog.lighting.push(...extraLighting);
  catalog.os.push(...osOptions);
  catalog.os.push(
    {
      id: 'bazzite', name: 'Bazzite', price: 0, tag: 'Linux · gaming desktop', short: 'Gaming-focused Fedora Atomic desktop',
      family: 'Linux', purpose: 'Gaming-focused desktop with image-based updates',
      supportNote: 'Fedora Atomic-based project with gaming and handheld-PC variants; check the current hardware image and NVIDIA support notes.',
      desc: 'Bazzite is a community Linux desktop built around an image-based update model and gaming-oriented defaults. Select the correct desktop or handheld image and review current driver support.',
      fit: 'Gaming-focused Linux use; verify the selected image, GPU driver, anti-cheat compatibility and application requirements.',
      watch: 'Community-maintained release; check current documentation and support policies.'
    },
    {
      id: 'cachyos', name: 'CachyOS', price: 0, tag: 'Linux · performance focused', short: 'Arch-based rolling-release desktop',
      family: 'Linux', purpose: 'Performance-oriented desktop with frequent updates',
      supportNote: 'Arch-based rolling release with performance-focused packages; review hardware support, kernel updates and maintenance requirements.',
      desc: 'CachyOS is an Arch-based Linux distribution with performance-oriented packaging and a rolling release. Frequent updates require regular maintenance and sensible backups.',
      fit: 'Experienced users who want a customizable desktop; check GPU, game launcher, anti-cheat and software compatibility.',
      watch: 'Community-maintained rolling release; updates can require troubleshooting.'
    }
  );
  for (const pcCase of catalog.case) {
    if (!pcCase.frontUsb) pcCase.frontUsb = 'Front USB and audio layout varies; verify the exact case model';
    if (!pcCase.dimensions) pcCase.dimensions = 'Model-dependent; verify the exact case measurements';
    if (!pcCase.materials) pcCase.materials = 'Steel chassis; panel material varies by configuration';
    if (!pcCase.includedFanLayout) pcCase.includedFanLayout = `${pcCase.fans} included fan${pcCase.fans === 1 ? '' : 's'}; exact size and position vary by model`;
    if (!pcCase.filters) pcCase.filters = 'Filter locations and removability vary; verify the exact case listing';
    if (!pcCase.driveBays) pcCase.driveBays = '2.5-inch and 3.5-inch mount counts vary by model';
    if (!pcCase.fanMounts) pcCase.fanMounts = '120/140 mm fan positions vary by panel and case revision';
    if (!pcCase.expansionSlots) pcCase.expansionSlots = pcCase.forms.includes('ATX') ? 7 : 4;
    if (!pcCase.radiatorPositions) pcCase.radiatorPositions = 'Front/top mounts vary; verify radiator thickness and clearance';
    if (!pcCase.cableSpace) pcCase.cableSpace = 'Cable-routing depth varies; check the case manual';
  }
  for (const drive of catalog.storage) {
    if (!drive.formFactor) drive.formFactor = drive.interface.includes('NVMe') ? 'M.2 2280' : '2.5-inch';
  }
}

export const operatingSystems = osOptions;
