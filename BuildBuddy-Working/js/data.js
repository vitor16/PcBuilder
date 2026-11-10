/* BuildBuddy catalog. Prices are illustrative reference prices in BRL, not a live feed. */

export const categoryInfo = {
  cpu: {
    label: 'Processor', short: 'CPU', step: 'The brain',
    title: 'The processor is the PC’s decision-maker.',
    text: 'The CPU runs every instruction your computer receives. It sets how responsive everyday use feels and can limit games when it is too slow for the graphics card.',
    note: 'It must match the motherboard socket. A different socket cannot be forced to fit.'
  },
  cooler: {
    label: 'CPU cooler', short: 'Cooler', step: 'Keeps it cool',
    title: 'The cooler keeps the processor comfortable.',
    text: 'Processors turn electricity into heat. The cooler pulls that heat away so the CPU can hold its speed without throttling.',
    note: 'The boxed cooler is fine for modest CPUs. Taller coolers need a case with enough clearance.'
  },
  motherboard: {
    label: 'Motherboard', short: 'Board', step: 'The hub',
    title: 'The motherboard is the connection hub.',
    text: 'Every part plugs into it. It decides the CPU socket, the memory type, how many drives you can add and which cases it fits.',
    note: 'Socket and memory generation must match your CPU and RAM. Size must fit your case.'
  },
  ram: {
    label: 'Memory', short: 'RAM', step: 'Short-term workspace',
    title: 'RAM is your PC’s short-term workspace.',
    text: 'It holds what your computer is actively using. More RAM helps with multitasking and newer games, but the type has to match the motherboard.',
    note: '16 GB is a practical start. 32 GB gives breathing room for games and multitasking.'
  },
  gpu: {
    label: 'Graphics card', short: 'GPU', step: 'The game specialist',
    title: 'The graphics card is the game specialist.',
    text: 'It draws the image you see. A stronger graphics card usually means higher frame rates and better settings.',
    note: 'For gaming this is usually the part that changes performance the most.'
  },
  storage: {
    label: 'Storage', short: 'SSD', step: 'Where files live',
    title: 'Storage is where your files live.',
    text: 'Windows, games, photos and projects are saved here. An SSD makes startup and loading far faster than an old hard drive.',
    note: '1 TB is a comfortable start if you plan to install several large games.'
  },
  psu: {
    label: 'Power supply', short: 'PSU', step: 'The power source',
    title: 'The power supply feeds every component.',
    text: 'It converts wall power into the clean electricity your parts need. Enough wattage and a reputable model keep the PC stable.',
    note: 'Do not choose by wattage alone. Buy a trusted model with the right connectors.'
  },
  case: {
    label: 'PC case', short: 'Case', step: 'The home',
    title: 'The case holds everything together.',
    text: 'It protects parts and affects airflow, noise, looks and how easy the build is. Bigger is not always better. The parts still need to fit.',
    note: 'Mesh fronts help airflow. Check the maximum graphics card length and cooler height.'
  },
  fans: {
    label: 'Case fans', short: 'Fans', step: 'Moves the air',
    title: 'Case fans move air through the PC.',
    text: 'Cool air comes in at the front, warm air leaves at the back and top. Good airflow keeps every part cooler and quieter.',
    note: 'Your case already includes some fans. Extra fans mainly add looks or a little more airflow.'
  },
  lighting: {
    label: 'Lighting', short: 'RGB', step: 'Looks',
    title: 'Lighting is for looks only.',
    text: 'RGB lighting does not change performance. It changes how your PC looks through the glass panel.',
    note: 'Pick a color that matches your desk. You can turn it off any time in the 3D view.'
  }
};

export const categories = Object.keys(categoryInfo);

const SOCKETS = ['AM4', 'AM5', 'LGA1700'];

export const catalog = {
  cpu: [
    { id: 'r5600g', name: 'AMD Ryzen 5 5600G', price: 699, tag: 'Entry · built-in graphics', short: '6 cores / 12 threads · AM4 · DDR4', socket: 'AM4', ram: 'DDR4', igpu: true, cpuScore: 0.94, tdp: 65, cores: 6, boxCooler: true, desc: 'A friendly starting point with graphics built in, so you can use the PC without a separate graphics card at first.', fit: 'School, work, browsing, media and lighter games. You can add a graphics card later.' },
    { id: 'r5600', name: 'AMD Ryzen 5 5600', price: 739, tag: 'Great value · gaming', short: '6 cores / 12 threads · AM4 · DDR4', socket: 'AM4', ram: 'DDR4', igpu: false, cpuScore: 1.0, tdp: 65, cores: 6, boxCooler: true, desc: 'A popular value gaming processor with six cores and twelve threads. It has no built-in graphics.', fit: 'A balanced 1080p gaming PC with a dedicated graphics card.' },
    { id: 'r75700x', name: 'AMD Ryzen 7 5700X', price: 1049, tag: 'AM4 · 8 cores', short: '8 cores / 16 threads · AM4 · DDR4', socket: 'AM4', ram: 'DDR4', igpu: false, cpuScore: 1.07, tdp: 65, cores: 8, boxCooler: false, desc: 'Eight cores on the mature AM4 platform. It does not include a cooler and has no built-in graphics.', fit: 'Gaming plus streaming or editing while keeping a DDR4 platform affordable. Needs a separate cooler.' },
    { id: 'r58003d', name: 'AMD Ryzen 7 5800X3D', price: 1599, tag: 'AM4 · top gaming chip', short: '8 cores / 16 threads · 3D V-Cache · AM4', socket: 'AM4', ram: 'DDR4', igpu: false, cpuScore: 1.2, tdp: 105, cores: 8, boxCooler: false, desc: 'Extra cache on the processor makes many games faster. It is the strongest gaming option on AM4.', fit: 'High-refresh gaming on a DDR4 board. Needs a separate cooler.' },
    { id: 'r7600', name: 'AMD Ryzen 5 7600', price: 1299, tag: 'Newer platform · upgrade path', short: '6 cores / 12 threads · AM5 · DDR5', socket: 'AM5', ram: 'DDR5', igpu: true, cpuScore: 1.12, tdp: 65, cores: 6, boxCooler: true, desc: 'A modern AM5 processor with a basic built-in display output. Its graphics are not meant for demanding games.', fit: 'Gaming and productivity with a graphics card, with room for future AM5 upgrades.' },
    { id: 'r77700x', name: 'AMD Ryzen 7 7700X', price: 1899, tag: 'AM5 · fast all-rounder', short: '8 cores / 16 threads · AM5 · DDR5', socket: 'AM5', ram: 'DDR5', igpu: true, cpuScore: 1.22, tdp: 105, cores: 8, boxCooler: false, desc: 'A fast eight-core AM5 processor with a basic built-in display output. No cooler is included.', fit: 'Fast gaming and creative work. Needs a separate cooler.' },
    { id: 'i512400f', name: 'Intel Core i5-12400F', price: 799, tag: 'Value · needs a graphics card', short: '6 cores / 12 threads · LGA1700 · DDR4 board', socket: 'LGA1700', ram: 'DDR4', igpu: false, cpuScore: 0.97, tdp: 65, cores: 6, boxCooler: true, desc: 'A capable six-core Intel processor. The “F” means it has no built-in graphics.', fit: 'A budget gaming PC with a dedicated graphics card. Do not pick it without one.' },
    { id: 'i513400f', name: 'Intel Core i5-13400F', price: 1099, tag: 'LGA1700 · 10 cores', short: '10 cores / 16 threads · LGA1700', socket: 'LGA1700', ram: 'DDR4', igpu: false, cpuScore: 1.12, tdp: 65, cores: 10, boxCooler: true, desc: 'Ten cores for gaming with extra power for background tasks. No built-in graphics.', fit: 'Gaming and multitasking with a dedicated graphics card.' },
    { id: 'i713700k', name: 'Intel Core i7-13700K', price: 2299, tag: 'LGA1700 · high performance', short: '16 cores / 24 threads · LGA1700', socket: 'LGA1700', ram: 'DDR4', igpu: true, cpuScore: 1.32, tdp: 125, cores: 16, boxCooler: false, desc: 'A high-end processor with many cores and built-in graphics. It runs hot and has no cooler in the box.', fit: 'Heavy multitasking, editing and high-refresh gaming. Needs a strong cooler.' }
  ],
  cooler: [
    { id: 'stock', name: 'Cooler included with CPU', price: 0, tag: 'Included · no extra cost', short: 'Use the CPU’s boxed cooler', kind: 'stock', height: 55, sockets: SOCKETS, capacity: 75, needsBox: true, desc: 'Many boxed processors include a basic cooler. It keeps the price down and is enough for modest CPUs.', fit: 'A good start for 65 W processors. Some CPUs do not include one.' },
    { id: 'tower', name: '120 mm single tower cooler', price: 169, tag: 'Quieter under load', short: 'Single heatsink · one fan · 155 mm tall', kind: 'tower', height: 155, sockets: SOCKETS, capacity: 150, desc: 'A heatsink with heat pipes and a fan moves heat away from the processor, often more quietly than a small boxed cooler.', fit: 'A good upgrade for gaming and long work sessions.' },
    { id: 'dual', name: 'Dual-tower cooler', price: 289, tag: 'Big cooling capacity', short: 'Two heatsinks · two fans · 160 mm tall', kind: 'dual', height: 160, sockets: SOCKETS, capacity: 220, desc: 'A large air cooler with two towers and two fans handles hot processors at lower noise.', fit: 'For 105 W and above. Confirm RAM and case clearance.' },
    { id: 'aio240', name: '240 mm liquid cooler', price: 399, tag: 'Liquid · 2 × 120 mm', short: 'Radiator + pump + two fans', kind: 'aio', rad: 240, height: 0, radiator: 240, sockets: SOCKETS, capacity: 240, desc: 'An all-in-one liquid cooler moves heat to a radiator. It has more parts than an air cooler and needs a compatible case mount.', fit: 'Strong cooling with a clean look. Needs radiator support in the case.' },
    { id: 'aio360', name: '360 mm liquid cooler', price: 699, tag: 'Liquid · 3 × 120 mm', short: 'Large radiator + pump + three fans', kind: 'aio', rad: 360, height: 0, radiator: 360, sockets: SOCKETS, capacity: 300, desc: 'The biggest common all-in-one cooler. It keeps hot processors cool at lower fan speeds.', fit: 'For high-end CPUs. Check that your case supports a 360 mm radiator.' }
  ],
  motherboard: [
    { id: 'a520m', name: 'A520M motherboard', price: 399, tag: 'AM4 · DDR4 · micro-ATX', short: 'Entry AMD board · 2 RAM slots · 1 M.2', socket: 'AM4', ram: 'DDR4', form: 'mATX', slots: 2, m2: 1, wifi: false, desc: 'A basic AM4 board for Ryzen processors. It connects the CPU, memory, storage and expansion cards.', fit: 'A low-cost foundation for a Ryzen 5000 budget build.' },
    { id: 'b550m', name: 'B550M motherboard', price: 599, tag: 'AM4 · DDR4 · micro-ATX', short: 'Mainstream AMD board · 4 RAM slots · 2 M.2', socket: 'AM4', ram: 'DDR4', form: 'mATX', slots: 4, m2: 2, wifi: false, desc: 'A feature-rich AM4 board with modern storage and expansion options.', fit: 'A good all-round board for a Ryzen 5 5600 gaming PC.' },
    { id: 'b550atx', name: 'B550 ATX motherboard', price: 799, tag: 'AM4 · DDR4 · ATX · Wi-Fi', short: 'Full-size board · 4 RAM slots · 2 M.2 · Wi-Fi', socket: 'AM4', ram: 'DDR4', form: 'ATX', slots: 4, m2: 2, wifi: true, desc: 'A full-size AM4 board with built-in Wi-Fi and more expansion slots.', fit: 'A roomier AM4 build with space for extra cards and easier cable access.' },
    { id: 'a620m', name: 'A620M motherboard', price: 599, tag: 'AM5 · DDR5 · micro-ATX', short: 'Entry AM5 board · 2 RAM slots · 1 M.2', socket: 'AM5', ram: 'DDR5', form: 'mATX', slots: 2, m2: 1, wifi: false, desc: 'An entry AM5 board for newer Ryzen processors and DDR5 memory.', fit: 'A low-cost way into the newer platform.' },
    { id: 'b650m', name: 'B650M motherboard', price: 899, tag: 'AM5 · DDR5 · micro-ATX', short: 'Mainstream AM5 board · 4 RAM slots · 2 M.2', socket: 'AM5', ram: 'DDR5', form: 'mATX', slots: 4, m2: 2, wifi: false, desc: 'A mainstream AM5 board with a broader feature set for newer processors.', fit: 'A flexible base for a newer gaming or creative PC.' },
    { id: 'b650atx', name: 'B650 ATX motherboard', price: 1299, tag: 'AM5 · DDR5 · ATX · Wi-Fi', short: 'Full-size board · 4 RAM slots · 3 M.2 · Wi-Fi', socket: 'AM5', ram: 'DDR5', form: 'ATX', slots: 4, m2: 3, wifi: true, desc: 'A full-size AM5 board with Wi-Fi, more storage slots and stronger power delivery.', fit: 'A solid base for fast processors and big storage plans.' },
    { id: 'h610m', name: 'H610M motherboard', price: 499, tag: 'LGA1700 · DDR4 · micro-ATX', short: 'Entry Intel board · 2 RAM slots · 1 M.2', socket: 'LGA1700', ram: 'DDR4', form: 'mATX', slots: 2, m2: 1, wifi: false, desc: 'An affordable Intel board for supported LGA1700 processors. This version uses DDR4.', fit: 'A basic pairing for an i5-12400F budget build.' },
    { id: 'b760m', name: 'B760M motherboard', price: 699, tag: 'LGA1700 · DDR4 · micro-ATX', short: 'Mainstream Intel board · 4 RAM slots · 2 M.2', socket: 'LGA1700', ram: 'DDR4', form: 'mATX', slots: 4, m2: 2, wifi: false, desc: 'A more flexible Intel board. This example uses DDR4, so do not pair it with DDR5 memory.', fit: 'A sensible base for supported 12th to 14th generation Intel processors.' },
    { id: 'z790atx', name: 'Z790 ATX motherboard', price: 1599, tag: 'LGA1700 · DDR4 · ATX · Wi-Fi', short: 'Full-size board · strong power delivery · Wi-Fi', socket: 'LGA1700', ram: 'DDR4', form: 'ATX', slots: 4, m2: 4, wifi: true, desc: 'A premium full-size Intel board with strong power delivery for unlocked processors.', fit: 'For a Core i7 K-series processor and plenty of storage.' }
  ],
  ram: [
    { id: '16ddr4', name: '16 GB DDR4 · 2 × 8 GB', price: 279, tag: 'DDR4 · dual channel', short: '3200 MT/s · two matched sticks', type: 'DDR4', capacity: 16, sticks: 2, desc: 'Two matched sticks can run in dual-channel mode, which makes memory faster on compatible boards.', fit: 'A workable start for everyday use and lighter games.' },
    { id: '32ddr4', name: '32 GB DDR4 · 2 × 16 GB', price: 459, tag: 'DDR4 · recommended', short: '3200 to 3600 MT/s · dual channel', type: 'DDR4', capacity: 32, sticks: 2, desc: 'A comfortable amount of DDR4 for multitasking and gaming.', fit: 'A strong choice for gaming on a DDR4 platform.' },
    { id: '64ddr4', name: '64 GB DDR4 · 4 × 16 GB', price: 899, tag: 'DDR4 · four sticks', short: '3200 MT/s · needs 4 RAM slots', type: 'DDR4', capacity: 64, sticks: 4, desc: 'A large kit for editing, virtual machines and heavy multitasking. It needs a board with four memory slots.', fit: 'Creative and professional work. More than most games need.' },
    { id: '16ddr5', name: '16 GB DDR5 · 2 × 8 GB', price: 349, tag: 'DDR5 · dual channel', short: '5600 MT/s · two matched sticks', type: 'DDR5', capacity: 16, sticks: 2, desc: 'DDR5 is the newer generation. It only fits DDR5 boards because the slot notch is in a different place.', fit: 'A starter amount for a DDR5 platform.' },
    { id: '32ddr5', name: '32 GB DDR5 · 2 × 16 GB', price: 589, tag: 'DDR5 · recommended', short: '6000 MT/s · dual channel', type: 'DDR5', capacity: 32, sticks: 2, desc: 'A roomy 32 GB DDR5 kit with two matched modules.', fit: 'A good long-term choice for newer gaming and creative builds.' },
    { id: '64ddr5', name: '64 GB DDR5 · 2 × 32 GB', price: 1199, tag: 'DDR5 · big workspace', short: '6000 MT/s · dual channel', type: 'DDR5', capacity: 64, sticks: 2, desc: 'A very large DDR5 kit using just two sticks.', fit: 'Video editing, 3D work and many apps open at once.' }
  ],
  gpu: [
    { id: 'none', name: 'No dedicated graphics card', price: 0, tag: 'Built-in graphics only', short: 'Use the graphics built into your processor', score: 0, watts: 0, minPsu: 0, length: 0, kind: 'none', desc: 'Skip the separate card and use the graphics inside a compatible processor. This keeps the cost down.', fit: 'School, office work, browsing and lighter or older games. A CPU without built-in graphics will show no image.' },
    { id: 'rtx3050', name: 'NVIDIA GeForce RTX 3050 · 8 GB', price: 1199, tag: '1080p · entry gaming', short: '8 GB GDDR6 · about 130 W', score: 2.5, watts: 130, minPsu: 550, length: 242, kind: 'dual', color: 0x76b900, desc: 'An entry gaming card with 8 GB of video memory and support for modern rendering features.', fit: 'Lighter 1080p gaming. Check the power supply recommendation.' },
    { id: 'rx6600', name: 'AMD Radeon RX 6600 · 8 GB', price: 1399, tag: '1080p · value', short: '8 GB GDDR6 · about 132 W', score: 3.1, watts: 132, minPsu: 500, length: 250, kind: 'dual', color: 0xd24a3a, desc: 'A value card with 8 GB of video memory, aimed at Full HD gaming.', fit: 'Popular competitive games and many older titles at 1080p.' },
    { id: 'rx6650xt', name: 'AMD Radeon RX 6650 XT · 8 GB', price: 1599, tag: '1080p · extra headroom', short: '8 GB GDDR6 · about 176 W', score: 3.7, watts: 176, minPsu: 500, length: 267, kind: 'dual', color: 0xd24a3a, desc: 'A faster 1080p option with 8 GB of video memory for higher settings in many games.', fit: 'A good upgrade for high-refresh Full HD gaming.' },
    { id: 'rx7600', name: 'AMD Radeon RX 7600 · 8 GB', price: 1799, tag: '1080p · strong all-rounder', short: '8 GB GDDR6 · about 165 W', score: 4.0, watts: 165, minPsu: 550, length: 270, kind: 'dual', color: 0xd24a3a, desc: 'A step up for 1080p gaming that targets high-refresh Full HD with sensible settings.', fit: 'A good match for a balanced 1080p gaming PC.' },
    { id: 'rtx4060', name: 'NVIDIA GeForce RTX 4060 · 8 GB', price: 2199, tag: '1080p · efficient', short: '8 GB GDDR6 · DLSS · about 115 W', score: 4.1, watts: 115, minPsu: 550, length: 250, kind: 'dual', color: 0x76b900, desc: 'An efficient 1080p card with DLSS and ray tracing support.', fit: 'Competitive games, streaming and many current games at 1080p.' },
    { id: 'rtx5060', name: 'NVIDIA GeForce RTX 5060 · 8 GB', price: 2599, tag: 'Newer generation · 1080p', short: '8 GB GDDR7 · DLSS · about 145 W', score: 5.0, watts: 145, minPsu: 600, length: 280, kind: 'dual', color: 0x76b900, desc: 'A newer-generation option for a faster 1080p experience.', fit: 'High-refresh 1080p and a stronger start for heavy games.' },
    { id: 'arc-b580', name: 'Intel Arc B580 · 12 GB', price: 1899, tag: '1080p / 1440p · 12 GB', short: '12 GB GDDR6 · about 190 W', score: 5.3, watts: 190, minPsu: 600, length: 280, kind: 'dual', color: 0x1689c9, desc: 'A 12 GB graphics card for modern 1080p and entry 1440p gaming.', fit: 'A roomy video-memory option. Check driver support for your favorite games.' },
    { id: 'rtx5070', name: 'NVIDIA GeForce RTX 5070 · 12 GB', price: 4299, tag: '1440p · great performance', short: '12 GB GDDR7 · DLSS · about 250 W', score: 7.6, watts: 250, minPsu: 650, length: 300, kind: 'triple', color: 0x76b900, desc: 'A powerful card for smooth 1440p gaming with plenty of video memory.', fit: 'High settings at 1440p and strong 1080p high-refresh play.' },
    { id: 'rtx4070s', name: 'NVIDIA GeForce RTX 4070 SUPER · 12 GB', price: 4999, tag: '1440p · high performance', short: '12 GB GDDR6X · about 220 W', score: 7.4, watts: 220, minPsu: 650, length: 300, kind: 'triple', color: 0x76b900, desc: 'A high-performance 12 GB card suited to detailed 1440p gaming and creative work.', fit: 'A balanced match for high-refresh 1440p monitors.' },
    { id: 'rx7700xt', name: 'AMD Radeon RX 7700 XT · 12 GB', price: 3599, tag: '1440p · value performance', short: '12 GB GDDR6 · about 245 W', score: 7.2, watts: 245, minPsu: 700, length: 320, kind: 'triple', color: 0xd24a3a, desc: 'A 12 GB card designed for high-detail 1440p gaming.', fit: 'Check the case length and power-supply recommendations.' },
    { id: 'rx7800xt', name: 'AMD Radeon RX 7800 XT · 16 GB', price: 3999, tag: '1440p · lots of video memory', short: '16 GB GDDR6 · about 263 W', score: 8.0, watts: 263, minPsu: 700, length: 320, kind: 'triple', color: 0xd24a3a, desc: 'A strong 1440p card with 16 GB of video memory for textures and big games.', fit: 'High-refresh 1440p gaming. A large card, so check case clearance.' },
    { id: 'rtx5070ti', name: 'NVIDIA GeForce RTX 5070 Ti · 16 GB', price: 6499, tag: '1440p / 4K · enthusiast', short: '16 GB GDDR7 · about 300 W', score: 10.2, watts: 300, minPsu: 750, length: 340, kind: 'triple', color: 0x76b900, desc: 'A high-end 16 GB graphics card for demanding 1440p and entry 4K gaming.', fit: 'Pair with a large case and a power supply with enough headroom.' },
    { id: 'rx9070xt', name: 'AMD Radeon RX 9070 XT · 16 GB', price: 5999, tag: '1440p / 4K · high-end', short: '16 GB GDDR6 · about 304 W', score: 10.8, watts: 304, minPsu: 750, length: 340, kind: 'triple', color: 0xd24a3a, desc: 'A high-end 16 GB card for detailed 1440p gaming and capable 4K play.', fit: 'Choose a case with generous card clearance and a strong power supply.' },
    { id: 'rtx5080', name: 'NVIDIA GeForce RTX 5080 · 16 GB', price: 8499, tag: '4K · enthusiast', short: '16 GB GDDR7 · about 360 W', score: 12.5, watts: 360, minPsu: 850, length: 340, kind: 'triple', color: 0x76b900, desc: 'A top-tier card for 4K gaming and demanding creative work.', fit: 'For 4K play. Needs a large case and a strong power supply.' }
  ],
  storage: [
    { id: '500ssd', name: '500 GB NVMe SSD', price: 199, tag: 'Fast everyday storage', short: 'M.2 · PCIe NVMe', capacity: 500, desc: 'An NVMe SSD stores Windows, apps and files and loads them far faster than a hard drive.', fit: 'Enough for Windows and a few games.' },
    { id: '1tbssd', name: '1 TB NVMe SSD', price: 329, tag: 'Most balanced', short: 'M.2 · PCIe NVMe', capacity: 1000, desc: 'Twice the room of 500 GB without extra cables.', fit: 'A comfortable size for Windows, apps and several large games.' },
    { id: '2tbssd', name: '2 TB NVMe SSD', price: 579, tag: 'Large game library', short: 'M.2 · PCIe NVMe', capacity: 2000, desc: 'A larger fast drive for big game libraries, media and projects.', fit: 'Video editing and large libraries.' },
    { id: '1tbgen4', name: '1 TB PCIe 4.0 NVMe SSD', price: 449, tag: 'Faster · heatsink', short: 'M.2 · up to 7000 MB/s', capacity: 1000, gen4: true, desc: 'A faster NVMe SSD with its own heatsink. Loads and file copies are quicker.', fit: 'For people who copy big files often.' },
    { id: '4tbssd', name: '4 TB NVMe SSD', price: 1199, tag: 'Huge capacity', short: 'M.2 · PCIe NVMe', capacity: 4000, desc: 'A very large fast drive for huge libraries and raw video.', fit: 'Creators who keep many large projects installed.' }
  ],
  psu: [
    { id: '500w', name: '500 W 80+ Bronze PSU', price: 299, tag: 'Entry · reliable model needed', short: '500 W · Bronze example', watts: 500, modular: false, desc: 'The power supply turns wall power into stable power for the parts. The quality of the actual model matters as much as the number.', fit: 'Modest builds with low-power graphics cards.' },
    { id: '550w', name: '550 W 80+ Bronze PSU', price: 349, tag: 'Value · mainstream 1080p', short: '550 W · Bronze example', watts: 550, modular: false, desc: '80+ Bronze is an efficiency rating, not a guarantee of build quality.', fit: 'Midrange cards such as the RX 7600 with a good model.' },
    { id: '650w', name: '650 W 80+ Bronze PSU', price: 429, tag: 'Recommended headroom', short: '650 W · Bronze example', watts: 650, modular: false, desc: 'Extra capacity gives room for stronger parts and future upgrades.', fit: 'A flexible choice for many 1080p and 1440p builds.' },
    { id: '750w', name: '750 W 80+ Gold PSU', price: 579, tag: 'More headroom · Gold', short: '750 W · Gold · modular cables', watts: 750, modular: true, desc: 'A Gold-rated unit with detachable cables for a tidier build.', fit: 'Stronger CPUs and graphics cards with room to upgrade.' },
    { id: '850w', name: '850 W 80+ Gold PSU', price: 749, tag: 'High-end ready · Gold', short: '850 W · Gold · modular cables', watts: 850, modular: true, desc: 'High capacity for top graphics cards and heavy processors.', fit: 'Builds with a card above 300 W.' },
    { id: '1000w', name: '1000 W 80+ Platinum PSU', price: 1199, tag: 'Enthusiast · Platinum', short: '1000 W · Platinum · modular cables', watts: 1000, modular: true, desc: 'A top-tier unit with plenty of capacity and efficiency.', fit: 'Only needed for the most powerful parts or heavy overclocking.' }
  ],
  case: [
    { id: 'compact', name: 'Compact airflow case', price: 299, tag: '3 fans · mATX', short: 'Up to 330 mm GPU · 160 mm cooler · 240 mm radiator', maxGpu: 330, maxCooler: 160, radiators: [240], forms: ['mATX'], fans: 3, style: 'compact', desc: 'A small case with a mesh front. Air needs a clear path in and out to keep temperatures down.', fit: 'A low-cost case for a first build. Only fits micro-ATX or smaller boards.' },
    { id: 'mini-mesh', name: 'Mini mesh mATX case', price: 349, tag: '3 fans · compact mesh', short: 'Up to 310 mm GPU · 160 mm cooler · 240 mm radiator', maxGpu: 310, maxCooler: 160, radiators: [240], forms: ['mATX'], fans: 3, style: 'mini', desc: 'A compact mesh-front case with a little more room for airflow and cable routing.', fit: 'A small build for micro-ATX boards and shorter graphics cards.' },
    { id: 'cube-airflow', name: 'Cube airflow case', price: 429, tag: '4 fans · mATX cube', short: 'Up to 335 mm GPU · 160 mm cooler · 240 mm radiator', maxGpu: 335, maxCooler: 160, radiators: [240], forms: ['mATX'], fans: 4, style: 'cube', desc: 'A wider compact case with a mesh front and room for extra cooling.', fit: 'A distinctive compact build. Check the graphics-card length.' },
    { id: 'mesh', name: 'Mesh mid-tower case', price: 399, tag: '4 fans · ATX', short: 'Up to 360 mm GPU · 165 mm cooler · 360 mm radiator', maxGpu: 360, maxCooler: 165, radiators: [240, 360], forms: ['mATX', 'ATX'], fans: 4, style: 'mesh', desc: 'A roomier airflow case with four fans and space for large graphics cards.', fit: 'A flexible case for a balanced gaming PC and easy upgrades.' },
    { id: 'white-mesh', name: 'White airflow mid-tower', price: 499, tag: '4 fans · ATX · light finish', short: 'Up to 360 mm GPU · 165 mm cooler · 360 mm radiator', maxGpu: 360, maxCooler: 165, radiators: [240, 360], forms: ['mATX', 'ATX'], fans: 4, style: 'mesh', finish: 'light', desc: 'A light-finish airflow tower with a mesh front and space for full-size parts.', fit: 'A clean light-colored build with room for future upgrades.' },
    { id: 'silent-atx', name: 'Quiet-panel ATX case', price: 549, tag: '4 fans · quiet front', short: 'Up to 340 mm GPU · 170 mm cooler · 360 mm radiator', maxGpu: 340, maxCooler: 170, radiators: [240, 360], forms: ['mATX', 'ATX'], fans: 4, style: 'silent', desc: 'A solid-front tower with a quieter, more understated appearance.', fit: 'A quieter-looking build. Use the included case fans to keep airflow moving.' },
    { id: 'airflow-pro', name: 'Airflow Pro full tower', price: 699, tag: '5 fans · ATX · extra room', short: 'Up to 420 mm GPU · 185 mm cooler · 360 mm radiator', maxGpu: 420, maxCooler: 185, radiators: [240, 360], forms: ['mATX', 'ATX'], fans: 5, style: 'tower', desc: 'A tall mesh-front case with generous graphics-card and cooler clearance.', fit: 'For large gaming builds with room to work and upgrade.' },
    { id: 'panorama-matx', name: 'Panoramic compact glass case', price: 599, tag: '5 fans · mATX · glass front', short: 'Up to 360 mm GPU · 170 mm cooler · 360 mm radiator', maxGpu: 360, maxCooler: 170, radiators: [240, 360], forms: ['mATX'], fans: 5, style: 'fishbowl', desc: 'A compact panoramic case with glass at the front and side to show the components.', fit: 'A display-focused micro-ATX build. Plan airflow around the glass panels.' },
    { id: 'showcase', name: 'Panoramic showcase case', price: 649, tag: '6 fans · ATX · two glass sides', short: 'Up to 400 mm GPU · 170 mm cooler · 360 mm radiator', maxGpu: 400, maxCooler: 170, radiators: [240, 360], forms: ['mATX', 'ATX'], fans: 6, style: 'showcase', desc: 'A glass-heavy case with views from the front and side. It puts parts and lighting on display.', fit: 'A clean visible build. Make sure airflow is still enough.' },
    { id: 'dual-chamber', name: 'Dual-chamber showcase tower', price: 799, tag: '7 fans · ATX · hidden cable bay', short: 'Up to 420 mm GPU · 180 mm cooler · 360 mm radiator', maxGpu: 420, maxCooler: 180, radiators: [240, 360], forms: ['mATX', 'ATX'], fans: 7, style: 'showcase', desc: 'A roomy glass-front display case with a separate rear cable area and extra cooling.', fit: 'A large showcase build for long graphics cards and tidy cable routing.' },
    { id: 'full-tower-mesh', name: 'Full-tower mesh case', price: 899, tag: '5 fans · large ATX', short: 'Up to 440 mm GPU · 190 mm cooler · 360 mm radiator', maxGpu: 440, maxCooler: 190, radiators: [240, 360], forms: ['mATX', 'ATX'], fans: 5, style: 'tower', desc: 'A spacious full tower with a high-airflow mesh front and room for oversized components.', fit: 'For high-power systems and easier installation.' },
    { id: 'full-tower-glass', name: 'Full-tower panoramic glass case', price: 999, tag: '8 fans · ATX · panoramic glass', short: 'Up to 450 mm GPU · 190 mm cooler · 360 mm radiator', maxGpu: 450, maxCooler: 190, radiators: [240, 360], forms: ['mATX', 'ATX'], fans: 8, style: 'towerglass', desc: 'A large panoramic display case with front and side glass and room for premium components.', fit: 'A spacious display build. Keep the glass clean and plan intake airflow.' }
  ],
  fans: [
    { id: 'included', name: 'Fans included with the case', price: 0, tag: 'No extra cost', short: 'Use the fans that come with your case', extra: 0, rgb: false, desc: 'Most cases include basic fans in the front and back.', fit: 'A solid start. You can upgrade later.' },
    { id: 'rgb3', name: '3 × 120 mm RGB fan pack', price: 199, tag: 'Adds 3 glowing fans', short: 'Replaces the front fans · RGB ring', extra: 0, rgb: true, desc: 'Three matching fans with an RGB ring. They replace the case fans on the front.', fit: 'A matching look through the glass.' },
    { id: 'perf3', name: '3 × 120 mm performance fan pack', price: 249, tag: 'Quieter · more airflow', short: 'Replaces the front fans · high airflow', extra: 0, rgb: false, desc: 'Three quality fans designed to move more air at lower noise.', fit: 'Cooler parts with less noise, without any lighting.' },
    { id: 'top2', name: '2 × 140 mm top exhaust fans', price: 179, tag: 'Adds two top fans', short: 'Mounts on the roof · exhaust', extra: 2, rgb: false, desc: 'Two large fans on the roof push hot air out.', fit: 'Helps high-power builds. Not usable with a top radiator.' }
  ],
  lighting: [
    { id: 'off', name: 'Lighting off', price: 0, tag: 'No glow', short: 'Dark, stealth build', color: 0x000000, mode: 'off', desc: 'A dark build. Parts look as they do in daylight.', fit: 'A clean look.' },
    { id: 'cyan', name: 'Cyan glow', price: 0, tag: 'Solid color', short: 'One steady color', color: 0x35e0ff, mode: 'solid', desc: 'A cool steady cyan across all lit parts.', fit: 'Works with most desks.' },
    { id: 'violet', name: 'Violet glow', price: 0, tag: 'Solid color', short: 'One steady color', color: 0x9b6bff, mode: 'solid', desc: 'A deep violet accent.', fit: 'A moody look in a dark room.' },
    { id: 'red', name: 'Red glow', price: 0, tag: 'Solid color', short: 'One steady color', color: 0xff3b3b, mode: 'solid', desc: 'A strong red accent.', fit: 'A bold gaming look.' },
    { id: 'white', name: 'White glow', price: 0, tag: 'Solid color', short: 'One steady color', color: 0xfff2e0, mode: 'solid', desc: 'A clean, soft white.', fit: 'A tidy minimal look.' },
    { id: 'rainbow', name: 'Rainbow cycle', price: 0, tag: 'Animated', short: 'Colors flow through the build', color: 0xff00ff, mode: 'rainbow', desc: 'Colors slowly cycle through the full spectrum.', fit: 'A lively look.' }
  ]
};

export const presets = {
  starter: { cpu: 'r5600g', cooler: 'stock', motherboard: 'a520m', ram: '16ddr4', gpu: 'none', storage: '500ssd', psu: '500w', case: 'compact', fans: 'included', lighting: 'off' },
  esports: { cpu: 'r5600', cooler: 'stock', motherboard: 'b550m', ram: '32ddr4', gpu: 'rx6600', storage: '1tbssd', psu: '550w', case: 'mesh', fans: 'included', lighting: 'cyan' },
  creator: { cpu: 'r77700x', cooler: 'aio240', motherboard: 'b650atx', ram: '32ddr5', gpu: 'rtx5070', storage: '2tbssd', psu: '850w', case: 'showcase', fans: 'rgb3', lighting: 'rainbow' }
};

export const games = [
  { name: 'Valorant', type: 'Competitive', rate: 55 },
  { name: 'Fortnite', type: 'Performance mode', rate: 25 },
  { name: 'GTA V', type: 'High settings', rate: 26 },
  { name: 'Cyberpunk 2077', type: 'Medium, no RT', rate: 14 },
  { name: 'Counter-Strike 2', type: 'High settings', rate: 28 },
  { name: 'Elden Ring', type: 'High settings', rate: 15 }
];
