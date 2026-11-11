import { addCatalogOptions } from './catalog-expansion.js';

/*
 * BuildBuddy catalog.
 *
 * Prices are reference numbers in BRL (R$), typed in by hand. They are not live store prices.
 * Specs describe typical values for each model family. Check the product page before buying.
 */

export const categoryInfo = {
  cpu: {
    label: 'Processor', short: 'CPU',
    text: 'The processor runs program instructions. Core and thread counts help with multitasking, while clock speed and cache affect how quickly some tasks finish. Games can be limited by either the processor or graphics card.',
    note: 'Match its socket to the board. Check base/boost clocks, heat rating, integrated graphics and whether a cooler is included; the heat rating is not a guaranteed wall-power maximum.'
  },
  cooler: {
    label: 'CPU cooler', short: 'Cooler',
    text: 'A cooler moves processor heat into the case airflow. A larger heatsink or radiator can keep temperatures and fan noise lower during long workloads, but it still needs room and unobstructed airflow.',
    note: 'Check socket mounting, cooler height, memory clearance and radiator size. Confirm whether your processor includes a usable boxed cooler.'
  },
  motherboard: {
    label: 'Motherboard', short: 'Board',
    text: 'The motherboard connects the processor, memory, graphics card, storage and external devices. Its form factor, slot count, networking and rear/front USB connections determine what the finished PC can use.',
    note: 'Match CPU socket, RAM generation and case size. USB-A/USB-C are connector shapes; compare the port speed and rear I/O or internal header, and confirm the exact board revision.'
  },
  ram: {
    label: 'Memory', short: 'RAM',
    text: 'Memory holds the data and programs the processor is actively using. Capacity helps with demanding games and many open apps; speed and latency can also affect performance.',
    note: 'Match DDR4 or DDR5 to the motherboard and use a kit with a stick count the board supports. Advertised speeds may require enabling an XMP/EXPO profile in firmware.'
  },
  gpu: {
    label: 'Graphics card', short: 'GPU',
    text: 'The graphics card draws game frames and accelerates many creative workloads. Its performance, video memory and software features help determine which resolution and settings are practical.',
    note: 'Check exact card length, thickness, power connectors and recommended supply. The frame-rate numbers here are rough comparisons, not measured benchmarks.'
  },
  storage: {
    label: 'Storage', short: 'SSD',
    text: 'Storage keeps the operating system, apps, games and files after the PC is turned off. NVMe and SATA SSDs have no moving parts; hard drives trade speed for large, lower-cost capacity.',
    note: 'Check capacity, M.2/SATA connection, drive size and PCIe generation support. Published sequential read speed is a best-case transfer figure, not a direct gaming-FPS measure.'
  },
  psu: {
    label: 'Power supply', short: 'PSU',
    text: 'The power supply converts wall power for the PC and feeds every component. Capacity, protections, connector compatibility, noise and efficiency all matter; an efficiency badge alone does not measure overall quality.',
    note: 'Compare the exact unit’s independent quality reviews, warranty, GPU cables and standards. Leave headroom for brief power spikes and never reuse modular cables from another PSU.'
  },
  case: {
    label: 'PC case', short: 'Case',
    text: 'The case provides mounting points, front-panel connections and a path for cool air to enter and warm air to leave. Its layout affects component clearance, noise, cable routing and ease of assembly.',
    note: 'Check motherboard size, GPU length, cooler height, radiator mounts and included fans. Front USB-C only works when the motherboard has the matching internal header.'
  },
  fans: {
    label: 'Case fans', short: 'Fans',
    text: 'Fans move air through the case and across hot components. Intake and exhaust placement, fan size, speed control and obstructions matter more than simply adding the largest number of fans.',
    note: 'Check mounting size, fan headers, PWM control and radiator clearance. Connect 5 V addressable lighting only to a compatible 3-pin ARGB header or controller.'
  },
  lighting: {
    label: 'Lighting', short: 'Lights',
    text: 'Lighting is cosmetic and does not increase performance. Compatible RGB/ARGB fans and components can be controlled through a motherboard header or their own controller.',
    note: 'Confirm 5 V 3-pin ARGB versus 12 V 4-pin RGB before connecting hardware. The color preview is illustrative and cannot control unconnected LEDs.'
  },
  os: {
    label: 'Operating system', short: 'OS',
    text: 'Choose the system you plan to install. This selection is a compatibility and planning note; it does not install software, provide a license or create recovery media. The FPS planner does not change results by OS because comparable measured OS results are not available.',
    note: 'Check the exact release support dates, CPU/platform requirements, driver availability, application compatibility and license terms. Older Windows versions are unsupported for everyday online use.'
  }
};

export const categories = Object.keys(categoryInfo);

const SOCKETS = ['AM3+', 'AM4', 'AM5', 'LGA1151', 'LGA1200', 'LGA1700'];

export const catalog = {
  cpu: [
    {
      id: 'r5600g', name: 'AMD Ryzen 5 5600G', price: 699, tag: 'Built-in graphics', short: '6 cores · AM4 · DDR4',
      socket: 'AM4', memory: 'DDR4', igpu: true, igpuScore: 1.3, cpuScore: 0.94, tdp: 65, cores: 6, threads: 12, base: 3.9, boost: 4.4, cache: 16, boxCooler: true,
      desc: 'A good starting point. It has graphics built in, so the PC works without a graphics card while you save for one.',
      fit: 'School, work, browsing, video calls and light or older games.',
      watch: 'Built-in graphics are fine for light games. Demanding games need a separate card.'
    },
    {
      id: 'r5600', name: 'AMD Ryzen 5 5600', price: 739, tag: 'Best value for 1080p', short: '6 cores · AM4 · DDR4',
      socket: 'AM4', memory: 'DDR4', igpu: false, cpuScore: 1.0, tdp: 65, cores: 6, threads: 12, base: 3.5, boost: 4.4, cache: 32, boxCooler: true,
      desc: 'A popular, affordable gaming chip. It handles most games at 1080p and pairs well with a mid-range graphics card.',
      fit: '1080p gaming on a budget.',
      watch: 'No built-in graphics, so it needs a graphics card.'
    },
    {
      id: 'r5500', name: 'AMD Ryzen 5 5500', price: 549, tag: 'Budget AM4', short: '6 cores · AM4 · DDR4',
      socket: 'AM4', memory: 'DDR4', igpu: false, cpuScore: 0.9, tdp: 65, cores: 6, threads: 12, base: 3.6, boost: 4.2, cache: 16, boxCooler: true,
      desc: 'A cut-down version of the 5600 with less cache and lower clock speeds. A cheap way into a gaming PC.',
      fit: 'Tight-budget gaming with a graphics card.',
      watch: 'No built-in graphics.'
    },
    {
      id: 'r75700x', name: 'AMD Ryzen 7 5700X', price: 1049, tag: 'AM4 · 8 cores', short: '8 cores · AM4 · DDR4',
      socket: 'AM4', memory: 'DDR4', igpu: false, cpuScore: 1.07, tdp: 65, cores: 8, threads: 16, base: 3.4, boost: 4.6, cache: 32, boxCooler: false,
      desc: 'Eight cores on the older AM4 platform. Good for gaming while you also stream or edit.',
      fit: 'Gaming plus streaming or light video editing on DDR4.',
      watch: 'No cooler in the box. Buy one separately.'
    },
    {
      id: 'r5700x3d', name: 'AMD Ryzen 7 5700X3D', price: 1199, tag: 'AM4 · extra cache', short: '8 cores · 3D V-Cache · AM4',
      socket: 'AM4', memory: 'DDR4', igpu: false, cpuScore: 1.18, tdp: 105, cores: 8, threads: 16, base: 3.0, boost: 4.1, cache: 96, boxCooler: false,
      desc: 'The same eight cores as the 5700X, plus a stack of extra cache that helps many games run more smoothly.',
      fit: 'Gaming on an AM4 board with a strong graphics card.',
      watch: 'No cooler in the box.'
    },
    {
      id: 'r58003d', name: 'AMD Ryzen 7 5800X3D', price: 1599, tag: 'AM4 · top gaming chip', short: '8 cores · 3D V-Cache · AM4',
      socket: 'AM4', memory: 'DDR4', igpu: false, cpuScore: 1.2, tdp: 105, cores: 8, threads: 16, base: 3.4, boost: 4.5, cache: 96, boxCooler: false,
      desc: 'The strongest gaming processor on AM4. The large cache helps a lot in games that juggle lots of small pieces of data.',
      fit: 'High frame rates on an AM4 board. Pairs well with a high-refresh monitor.',
      watch: 'No cooler in the box.'
    },
    {
      id: 'r7500f', name: 'AMD Ryzen 5 7500F', price: 899, tag: 'AM5 · no graphics', short: '6 cores · AM5 · DDR5',
      socket: 'AM5', memory: 'DDR5', igpu: false, cpuScore: 1.1, tdp: 65, cores: 6, threads: 12, base: 3.7, boost: 5.0, cache: 32, boxCooler: true,
      desc: 'A six-core chip on the newer AM5 platform at a lower price. It has no built-in graphics.',
      fit: 'Gaming with a graphics card on a DDR5 board.',
      watch: 'Needs a graphics card.'
    },
    {
      id: 'r7600', name: 'AMD Ryzen 5 7600', price: 1299, tag: 'AM5 · upgrade path', short: '6 cores · AM5 · DDR5',
      socket: 'AM5', memory: 'DDR5', igpu: true, igpuScore: 0.72, cpuScore: 1.12, tdp: 65, cores: 6, threads: 12, base: 3.8, boost: 5.1, cache: 32, boxCooler: true,
      desc: 'A modern six-core chip with basic built-in display output. A good gaming pick, and AM5 leaves room to upgrade later.',
      fit: 'Gaming and everyday work with a graphics card.',
      watch: 'The built-in graphics only show the desktop. They are not for games.'
    },
    {
      id: 'r77700x', name: 'AMD Ryzen 7 7700X', price: 1899, tag: 'AM5 · fast all-rounder', short: '8 cores · AM5 · DDR5',
      socket: 'AM5', memory: 'DDR5', igpu: true, igpuScore: 0.75, cpuScore: 1.22, tdp: 105, cores: 8, threads: 16, base: 4.5, boost: 5.4, cache: 32, boxCooler: false,
      desc: 'A fast eight-core chip for gaming and creative work. It runs warm, so a good cooler helps.',
      fit: 'Gaming plus video editing or rendering.',
      watch: 'No cooler in the box.'
    },
    {
      id: 'r77800x3d', name: 'AMD Ryzen 7 7800X3D', price: 2499, tag: 'AM5 · top gaming chip', short: '8 cores · 3D V-Cache · AM5',
      socket: 'AM5', memory: 'DDR5', igpu: true, igpuScore: 0.72, cpuScore: 1.34, tdp: 120, cores: 8, threads: 16, base: 4.2, boost: 5.0, cache: 96, boxCooler: false,
      desc: 'One of the best gaming processors you can buy. The large cache makes many games smoother, and it draws less power than most chips this fast.',
      fit: 'High frame rates on a new platform, with room to upgrade later.',
      watch: 'No cooler in the box.'
    },
    {
      id: 'r79600x', name: 'AMD Ryzen 5 9600X', price: 1399, tag: 'AM5 · newer generation', short: '6 cores · AM5 · DDR5',
      socket: 'AM5', memory: 'DDR5', igpu: true, igpuScore: 0.72, cpuScore: 1.18, tdp: 65, cores: 6, threads: 12, base: 3.9, boost: 5.4, cache: 32, boxCooler: false,
      desc: 'A newer six-core chip with a clear speed gain over the 7600. It has basic built-in display output.',
      fit: 'Gaming with a graphics card and a long upgrade path.',
      watch: 'No cooler in the box.'
    },
    {
      id: 'r79700x', name: 'AMD Ryzen 7 9700X', price: 1849, tag: 'AM5 · newer generation', short: '8 cores · AM5 · DDR5',
      socket: 'AM5', memory: 'DDR5', igpu: true, igpuScore: 0.72, cpuScore: 1.26, tdp: 65, cores: 8, threads: 16, base: 3.8, boost: 5.5, cache: 32, boxCooler: false,
      desc: 'Eight newer-generation cores at a modest 65 W. Fast for gaming and work without needing a huge cooler.',
      fit: 'Gaming, streaming and creative work on AM5.',
      watch: 'No cooler in the box.'
    },
    {
      id: 'i312100f', name: 'Intel Core i3-12100F', price: 499, tag: 'Budget Intel · no graphics', short: '4 cores · LGA1700',
      socket: 'LGA1700', memory: 'DDR4 or DDR5, depending on board', igpu: false, cpuScore: 0.7, tdp: 58, cores: 4, threads: 8, base: 3.3, boost: 4.3, cache: 12, boxCooler: true,
      desc: 'A basic quad-core chip for light gaming and schoolwork. It will hold back a strong graphics card.',
      fit: 'A budget PC with a modest graphics card.',
      watch: 'No built-in graphics.'
    },
    {
      id: 'i512400f', name: 'Intel Core i5-12400F', price: 799, tag: 'Good value · no graphics', short: '6 cores · LGA1700',
      socket: 'LGA1700', memory: 'DDR4 or DDR5, depending on board', igpu: false, cpuScore: 0.97, tdp: 65, cores: 6, threads: 12, base: 2.5, boost: 4.4, cache: 18, boxCooler: true,
      desc: 'A capable six-core chip. The F at the end means it has no built-in graphics, so it always needs a graphics card.',
      fit: 'Budget gaming with a dedicated graphics card.',
      watch: 'Do not buy it without a graphics card.'
    },
    {
      id: 'i513400f', name: 'Intel Core i5-13400F', price: 1099, tag: '10 cores · no graphics', short: '10 cores · LGA1700',
      socket: 'LGA1700', memory: 'DDR4 or DDR5, depending on board', igpu: false, cpuScore: 1.12, tdp: 65, cores: 10, threads: 16, base: 2.5, boost: 4.6, cache: 20, boxCooler: true,
      desc: 'Ten cores made of a mix of fast and efficient ones. Good for gaming while other programs run in the background.',
      fit: 'Gaming and multitasking with a graphics card.',
      watch: 'No built-in graphics.'
    },
    {
      id: 'i514400f', name: 'Intel Core i5-14400F', price: 1149, tag: '10 cores · no graphics', short: '10 cores · LGA1700',
      socket: 'LGA1700', memory: 'DDR4 or DDR5, depending on board', igpu: false, cpuScore: 1.16, tdp: 65, cores: 10, threads: 16, base: 2.5, boost: 4.7, cache: 20, boxCooler: true,
      desc: 'A small step up from the 13400F with slightly higher clock speeds. A sensible middle-of-the-road Intel choice.',
      fit: 'Gaming and multitasking with a graphics card.',
      watch: 'No built-in graphics.'
    },
    {
      id: 'i713700k', name: 'Intel Core i7-13700K', price: 2299, tag: 'High performance · built-in graphics', short: '16 cores · LGA1700',
      socket: 'LGA1700', memory: 'DDR4 or DDR5, depending on board', igpu: true, igpuScore: 0.8, cpuScore: 1.32, tdp: 125, cores: 16, threads: 24, base: 3.4, boost: 5.4, cache: 30, boxCooler: false,
      desc: 'A high-end chip with 16 cores and built-in graphics. It runs hot under load and needs a strong cooler.',
      fit: 'Heavy multitasking, editing and fast gaming. Pair it with a good cooler.',
      watch: 'No cooler in the box, and a basic cooler will struggle with it.'
    },
    {
      id: 'i714700f', name: 'Intel Core i7-14700F', price: 2099, tag: 'High performance · no graphics', short: '20 cores · LGA1700',
      socket: 'LGA1700', memory: 'DDR4 or DDR5, depending on board', igpu: false, cpuScore: 1.36, tdp: 125, cores: 20, threads: 28, base: 2.1, boost: 5.4, cache: 33, boxCooler: false,
      desc: 'Twenty cores for heavy work and very fast gaming. It has no built-in graphics and runs hot, so it needs a strong cooler.',
      fit: 'Heavy editing, rendering and high-end gaming with a graphics card.',
      watch: 'No built-in graphics and no cooler in the box.'
    }
  ],

  cooler: [
    {
      id: 'stock', name: 'Boxed cooler', price: 0, tag: 'Included with some chips', short: 'Basic cooler from the CPU box',
      kind: 'stock', height: 55, sockets: SOCKETS, capacity: 75, needsBox: true,
      desc: 'The basic cooler that comes in the box with many processors. It is enough for a 65 W chip, but it gets loud under load.',
      fit: 'Everyday use and budget builds.'
    },
    {
      id: 'slim', name: 'Slim 120 mm tower cooler', price: 149, tag: 'Fits small cases', short: 'One heatsink · one fan · 110 mm tall',
      kind: 'tower', height: 110, sockets: SOCKETS, capacity: 130,
      desc: 'A short tower cooler that fits compact cases. Quieter and cooler than the boxed cooler.',
      fit: 'Small builds and micro-ATX cases that cannot take a tall cooler.'
    },
    {
      id: 'tower', name: '120 mm tower cooler', price: 169, tag: 'Quieter under load', short: 'One heatsink · one fan · 155 mm tall',
      kind: 'tower', height: 155, sockets: SOCKETS, capacity: 150,
      desc: 'Copper heat pipes and a larger fan. A good upgrade for gaming and long work sessions, and usually quieter than the boxed cooler.',
      fit: 'Gaming and long work sessions on most mid-range chips.'
    },
    {
      id: 'dual', name: 'Dual-tower cooler', price: 289, tag: 'For hot chips', short: 'Two heatsinks · two fans · 160 mm tall',
      kind: 'dual', height: 160, sockets: SOCKETS, capacity: 220,
      desc: 'Two heatsinks and two fans. It handles hot processors and stays fairly quiet at moderate fan speeds.',
      fit: 'Chips rated at 105 W and above. Check RAM clearance on your board.'
    },
    {
      id: 'aio240', name: '240 mm liquid cooler', price: 399, tag: 'Liquid cooling', short: 'Radiator · pump · two 120 mm fans',
      kind: 'aio', radiator: 240, height: 0, sockets: SOCKETS, capacity: 240,
      desc: 'A sealed liquid loop that moves heat to a radiator. It looks clean and cools well, but it needs radiator space in the case.',
      fit: 'Strong cooling and a tidy look. Your case needs radiator support.'
    },
    {
      id: 'aio360', name: '360 mm liquid cooler', price: 699, tag: 'Big liquid cooler', short: 'Large radiator · pump · three 120 mm fans',
      kind: 'aio', radiator: 360, height: 0, sockets: SOCKETS, capacity: 300,
      desc: 'The largest common all-in-one cooler. It keeps hot chips cool at lower fan speeds.',
      fit: 'High-end chips. Check that your case supports a 360 mm radiator.'
    }
  ],

  motherboard: [
    {
      id: 'a520m', name: 'A520M motherboard', price: 399, tag: 'Basic AM4 · DDR4', short: 'micro-ATX · 2 RAM slots · 1 M.2',
      socket: 'AM4', ram: 'DDR4', form: 'mATX', slots: 2, m2: 1, wifi: false,
      desc: 'A basic board for Ryzen processors. It covers the essentials and has few extras.',
      fit: 'A low-cost base for a Ryzen 5000 budget build.'
    },
    {
      id: 'b550m', name: 'B550M motherboard', price: 599, tag: 'Good all-rounder · AM4', short: 'micro-ATX · 4 RAM slots · 2 M.2',
      socket: 'AM4', ram: 'DDR4', form: 'mATX', slots: 4, m2: 2, wifi: false,
      desc: 'A solid AM4 board with four memory slots and a second fast drive slot. A safe choice for a Ryzen gaming PC.',
      fit: 'Ryzen 5 5600 gaming builds in a compact case.'
    },
    {
      id: 'b550atx', name: 'B550 ATX motherboard', price: 799, tag: 'Full size · Wi-Fi · AM4', short: 'ATX · 4 RAM slots · 2 M.2 · Wi-Fi',
      socket: 'AM4', ram: 'DDR4', form: 'ATX', slots: 4, m2: 2, wifi: true,
      desc: 'A full-size AM4 board with built-in Wi-Fi and more room for cards and cables.',
      fit: 'Full-size AM4 builds, or anyone who wants Wi-Fi without a card.'
    },
    {
      id: 'a620m', name: 'A620M motherboard', price: 599, tag: 'Basic AM5 · DDR5', short: 'micro-ATX · 2 RAM slots · 1 M.2',
      socket: 'AM5', ram: 'DDR5', form: 'mATX', slots: 2, m2: 1, wifi: false,
      desc: 'A basic board for newer Ryzen processors and DDR5 memory. It keeps the cost of the AM5 platform down.',
      fit: 'A low-cost way onto AM5.'
    },
    {
      id: 'b650m', name: 'B650M motherboard', price: 899, tag: 'AM5 · DDR5', short: 'micro-ATX · 4 RAM slots · 2 M.2',
      socket: 'AM5', ram: 'DDR5', form: 'mATX', slots: 4, m2: 2, wifi: false,
      desc: 'A mainstream AM5 board with more slots and a better power setup for faster chips.',
      fit: 'A balanced base for a newer gaming or creative PC.'
    },
    {
      id: 'b650atx', name: 'B650 ATX motherboard', price: 1299, tag: 'AM5 · Wi-Fi · ATX', short: 'ATX · 4 RAM slots · 3 M.2 · Wi-Fi',
      socket: 'AM5', ram: 'DDR5', form: 'ATX', slots: 4, m2: 3, wifi: true,
      desc: 'A full-size AM5 board with Wi-Fi, three fast drive slots and stronger power delivery.',
      fit: 'Fast processors and big storage plans.'
    },
    {
      id: 'b850m', name: 'B850M motherboard', price: 999, tag: 'Newer AM5 · DDR5', short: 'micro-ATX · 4 RAM slots · 2 M.2',
      socket: 'AM5', ram: 'DDR5', form: 'mATX', slots: 4, m2: 2, wifi: false,
      desc: 'A newer mid-range AM5 board. It sits between the basic and high-end options.',
      fit: 'A future-friendly AM5 build without paying for extras.'
    },
    {
      id: 'x670e', name: 'X670E ATX motherboard', price: 1899, tag: 'High-end AM5 · Wi-Fi', short: 'ATX · 4 RAM slots · 4 M.2 · Wi-Fi',
      socket: 'AM5', ram: 'DDR5', form: 'ATX', slots: 4, m2: 4, wifi: true,
      desc: 'A premium AM5 board with strong power delivery and four drive slots, for people who want the most room to grow.',
      fit: 'High-end builds that need lots of storage and upgrade room.'
    },
    {
      id: 'h610m', name: 'H610M motherboard', price: 499, tag: 'Basic Intel · DDR4', short: 'micro-ATX · 2 RAM slots · 1 M.2',
      socket: 'LGA1700', ram: 'DDR4', form: 'mATX', slots: 2, m2: 1, wifi: false,
      desc: 'A simple Intel board for budget builds. It has the basics and few extras.',
      fit: 'A budget Intel build with a graphics card.'
    },
    {
      id: 'b760m', name: 'B760M motherboard', price: 699, tag: 'Mainstream Intel · DDR4', short: 'micro-ATX · 4 RAM slots · 2 M.2',
      socket: 'LGA1700', ram: 'DDR4', form: 'mATX', slots: 4, m2: 2, wifi: false,
      desc: 'A flexible Intel board with more memory slots and a second drive slot.',
      fit: '12th to 14th generation Intel chips in a compact build.'
    },
    {
      id: 'z790atx', name: 'Z790 ATX motherboard', price: 1599, tag: 'High-end Intel · Wi-Fi', short: 'ATX · 4 RAM slots · 4 M.2 · Wi-Fi',
      socket: 'LGA1700', ram: 'DDR4', form: 'ATX', slots: 4, m2: 4, wifi: true,
      desc: 'A premium full-size Intel board with strong power delivery and room for lots of storage. Works well with unlocked K-series chips.',
      fit: 'High-end Intel builds with lots of storage.'
    }
  ],

  ram: [
    {
      id: '16ddr4', name: '16 GB DDR4 (2 × 8 GB)', price: 279, tag: 'Basic DDR4 kit', short: '3200 MT/s · dual channel',
      type: 'DDR4', capacity: 16, sticks: 2, speed: 3200, cl: 16,
      desc: 'Two matched sticks run in dual-channel mode, which is a little faster than a single stick. Enough for everyday use and lighter games.',
      fit: 'School, office and browsing. A starting point for games.'
    },
    {
      id: '32ddr4', name: '32 GB DDR4 (2 × 16 GB)', price: 459, tag: 'Recommended DDR4', short: '3600 MT/s · dual channel',
      type: 'DDR4', capacity: 32, sticks: 2, speed: 3600, cl: 18,
      desc: 'A comfortable amount of memory for gaming and multitasking on a DDR4 board.',
      fit: 'Gaming, streaming and keeping lots of apps open.'
    },
    {
      id: '64ddr4', name: '64 GB DDR4 (4 × 16 GB)', price: 899, tag: 'Four sticks', short: '3200 MT/s · needs 4 slots',
      type: 'DDR4', capacity: 64, sticks: 4, speed: 3200, cl: 16,
      desc: 'A large kit for video editing, virtual machines and heavy multitasking. It needs a board with four memory slots.',
      fit: 'Editing, 3D work and heavy multitasking.'
    },
    {
      id: '16ddr5', name: '16 GB DDR5 (2 × 8 GB)', price: 349, tag: 'Basic DDR5 kit', short: '5600 MT/s · dual channel',
      type: 'DDR5', capacity: 16, sticks: 2, speed: 5600, cl: 36,
      desc: 'DDR5 is the newer memory type. This kit is enough to start, but 32 GB is a safer choice for a new build.',
      fit: 'A starter kit for an AM5 build.'
    },
    {
      id: '32ddr5', name: '32 GB DDR5 (2 × 16 GB)', price: 589, tag: 'Recommended DDR5', short: '6000 MT/s · dual channel',
      type: 'DDR5', capacity: 32, sticks: 2, speed: 6000, cl: 30,
      desc: 'A good balance of speed and capacity for gaming and creative work on AM5.',
      fit: 'Most AM5 builds.'
    },
    {
      id: '64ddr5', name: '64 GB DDR5 (2 × 32 GB)', price: 1199, tag: 'Large DDR5 kit', short: '6000 MT/s · dual channel',
      type: 'DDR5', capacity: 64, sticks: 2, speed: 6000, cl: 30,
      desc: 'A large kit that uses just two sticks. Good for big projects and many apps open at once.',
      fit: 'Video editing, 3D work and heavy multitasking.'
    }
  ],

  gpu: [
    {
      id: 'none', name: 'No graphics card', price: 0, tag: 'Built-in graphics only', short: 'Uses the processor’s graphics',
      score: 0, watts: 0, minPsu: 0, length: 0, kind: 'none', vram: 0, mem: '',
      desc: 'Skip the separate card and use the graphics inside the processor. Fine for office work and light or older games.',
      fit: 'Office work, browsing, school and light games.'
    },
    {
      id: 'rtx3050', name: 'NVIDIA GeForce RTX 3050 8 GB', price: 1199, tag: 'Entry gaming', short: '8 GB GDDR6 · about 130 W',
      score: 2.5, watts: 130, minPsu: 550, length: 242, kind: 'dual', vram: 8, mem: 'GDDR6', color: 0x76b900,
      desc: 'An entry-level card for smooth 1080p gaming in lighter games and esports titles.',
      fit: 'Lighter 1080p gaming on a tight budget.'
    },
    {
      id: 'rx6600', name: 'AMD Radeon RX 6600 8 GB', price: 1399, tag: 'Good 1080p value', short: '8 GB GDDR6 · about 132 W',
      score: 3.1, watts: 132, minPsu: 500, length: 250, kind: 'dual', vram: 8, mem: 'GDDR6', color: 0xd24a3a,
      desc: 'A value card that handles popular games well at 1080p. A strong pick for competitive games.',
      fit: 'Full HD gaming on a budget.'
    },
    {
      id: 'rx6650xt', name: 'AMD Radeon RX 6650 XT 8 GB', price: 1599, tag: '1080p with headroom', short: '8 GB GDDR6 · about 176 W',
      score: 3.7, watts: 176, minPsu: 500, length: 267, kind: 'dual', vram: 8, mem: 'GDDR6', color: 0xd24a3a,
      desc: 'A faster 1080p card. It lets you turn settings up in more games or run a higher refresh rate.',
      fit: 'High-refresh 1080p gaming.'
    },
    {
      id: 'rx7600', name: 'AMD Radeon RX 7600 8 GB', price: 1799, tag: '1080p all-rounder', short: '8 GB GDDR6 · about 165 W',
      score: 4.0, watts: 165, minPsu: 550, length: 270, kind: 'dual', vram: 8, mem: 'GDDR6', color: 0xd24a3a,
      desc: 'A solid 1080p card with newer features than the RX 6600. A good match for a balanced gaming PC.',
      fit: 'Balanced 1080p gaming.'
    },
    {
      id: 'arc-b580', name: 'Intel Arc B580 12 GB', price: 1899, tag: '12 GB for 1080p and 1440p', short: '12 GB GDDR6 · about 190 W',
      score: 5.3, watts: 190, minPsu: 600, length: 280, kind: 'dual', vram: 12, mem: 'GDDR6', color: 0x1689c9,
      desc: 'Plenty of video memory for its class. Game support keeps improving, but check that your favorite games run well.',
      fit: 'Buyers who want more video memory for the money.',
      watch: 'Check driver support for the games you play most.'
    },
    {
      id: 'rtx4060', name: 'NVIDIA GeForce RTX 4060 8 GB', price: 2199, tag: 'Efficient 1080p', short: '8 GB GDDR6 · about 115 W',
      score: 4.1, watts: 115, minPsu: 550, length: 250, kind: 'dual', vram: 8, mem: 'GDDR6', color: 0x76b900,
      desc: 'A power-efficient card with DLSS upscaling. It runs cool and quiet and handles most games well at 1080p.',
      fit: 'Quiet 1080p gaming and streaming.'
    },
    {
      id: 'rtx4060ti', name: 'NVIDIA GeForce RTX 4060 Ti 8 GB', price: 2499, tag: '1080p with extra speed', short: '8 GB GDDR6 · about 160 W',
      score: 4.8, watts: 160, minPsu: 600, length: 240, kind: 'dual', vram: 8, mem: 'GDDR6', color: 0x76b900,
      desc: 'A step up from the RTX 4060, with more speed for high-refresh 1080p gaming and DLSS upscaling.',
      fit: 'High-refresh 1080p gaming.',
      watch: 'The 8 GB of memory can feel tight in newer games at high settings.'
    },
    {
      id: 'rtx5060', name: 'NVIDIA GeForce RTX 5060 8 GB', price: 2599, tag: 'Newer generation · 1080p', short: '8 GB GDDR7 · about 145 W',
      score: 5.0, watts: 145, minPsu: 600, length: 280, kind: 'dual', vram: 8, mem: 'GDDR7', color: 0x76b900,
      desc: 'A newer-generation card with faster memory. Good for smooth 1080p gaming with DLSS upscaling.',
      fit: 'High-refresh 1080p gaming.',
      watch: 'Only 8 GB of memory, so check recent reviews before buying for the newest games.'
    },
    {
      id: 'rx9060xt', name: 'AMD Radeon RX 9060 XT 16 GB', price: 2899, tag: '1080p and 1440p · 16 GB', short: '16 GB GDDR6 · about 160 W',
      score: 5.7, watts: 160, minPsu: 600, length: 250, kind: 'dual', vram: 16, mem: 'GDDR6', color: 0xd24a3a,
      desc: 'A newer AMD card with 16 GB of memory. Strong for 1080p and a fair start at 1440p.',
      fit: '1080p gaming that might move up to 1440p later.'
    },
    {
      id: 'rtx5060ti', name: 'NVIDIA GeForce RTX 5060 Ti 16 GB', price: 3299, tag: '1440p starter · 16 GB', short: '16 GB GDDR7 · about 180 W',
      score: 6.1, watts: 180, minPsu: 600, length: 250, kind: 'dual', vram: 16, mem: 'GDDR7', color: 0x76b900,
      desc: 'A newer card with 16 GB of memory. Good for 1080p at high refresh rates and a reasonable start at 1440p.',
      fit: '1080p at high refresh, or a light 1440p setup.'
    },
    {
      id: 'rx7700xt', name: 'AMD Radeon RX 7700 XT 12 GB', price: 3599, tag: '1440p value', short: '12 GB GDDR6 · about 245 W',
      score: 7.2, watts: 245, minPsu: 700, length: 320, kind: 'triple', vram: 12, mem: 'GDDR6', color: 0xd24a3a,
      desc: 'A 12 GB card built for detailed 1440p gaming.',
      fit: 'Smooth 1440p gaming on a budget.',
      watch: 'A long card. Check your case length.'
    },
    {
      id: 'rx7800xt', name: 'AMD Radeon RX 7800 XT 16 GB', price: 3999, tag: '1440p with lots of memory', short: '16 GB GDDR6 · about 263 W',
      score: 8.0, watts: 263, minPsu: 700, length: 320, kind: 'triple', vram: 16, mem: 'GDDR6', color: 0xd24a3a,
      desc: 'A strong 1440p card with 16 GB of memory for big textures and newer games.',
      fit: 'High-refresh 1440p gaming.',
      watch: 'A long card. Check case clearance.'
    },
    {
      id: 'rtx5070', name: 'NVIDIA GeForce RTX 5070 12 GB', price: 4299, tag: '1440p · great performance', short: '12 GB GDDR7 · about 250 W',
      score: 7.6, watts: 250, minPsu: 650, length: 300, kind: 'triple', vram: 12, mem: 'GDDR7', color: 0x76b900,
      desc: 'A powerful card for smooth 1440p gaming, with DLSS upscaling and ray tracing.',
      fit: '1440p gaming at high settings.'
    },
    {
      id: 'rx7900gre', name: 'AMD Radeon RX 7900 GRE 16 GB', price: 4399, tag: '1440p · strong raster', short: '16 GB GDDR6 · about 260 W',
      score: 9.3, watts: 260, minPsu: 750, length: 286, kind: 'triple', vram: 16, mem: 'GDDR6', color: 0xd24a3a,
      desc: 'A high-end card for 1440p gaming at high settings, with 16 GB of memory.',
      fit: 'High-detail 1440p gaming.',
      watch: 'Needs a strong power supply.'
    },
    {
      id: 'rx9070', name: 'AMD Radeon RX 9070 16 GB', price: 4699, tag: '1440p · high-end', short: '16 GB GDDR6 · about 220 W',
      score: 9.9, watts: 220, minPsu: 700, length: 300, kind: 'triple', vram: 16, mem: 'GDDR6', color: 0xd24a3a,
      desc: 'A high-end 16 GB card for detailed 1440p gaming and capable 4K play.',
      fit: '1440p at high refresh rates.'
    },
    {
      id: 'rtx4070s', name: 'NVIDIA GeForce RTX 4070 SUPER 12 GB', price: 4999, tag: '1440p · reliable', short: '12 GB GDDR6X · about 220 W',
      score: 7.4, watts: 220, minPsu: 650, length: 300, kind: 'triple', vram: 12, mem: 'GDDR6X', color: 0x76b900,
      desc: 'A well-balanced 1440p card with DLSS and good power efficiency for its speed.',
      fit: 'Detailed 1440p gaming and creative work.'
    },
    {
      id: 'rx9070xt', name: 'AMD Radeon RX 9070 XT 16 GB', price: 5999, tag: '1440p · 4K capable', short: '16 GB GDDR6 · about 304 W',
      score: 10.8, watts: 304, minPsu: 750, length: 340, kind: 'triple', vram: 16, mem: 'GDDR6', color: 0xd24a3a,
      desc: 'A high-end card that plays most games at 1440p on high settings and can handle 4K with some compromises.',
      fit: '1440p high-refresh and 4K gaming.',
      watch: 'A long card. Check case clearance and your power supply.'
    },
    {
      id: 'rx7900xt', name: 'AMD Radeon RX 7900 XT 20 GB', price: 6299, tag: '4K-ready · 20 GB', short: '20 GB GDDR6 · about 315 W',
      score: 11.4, watts: 315, minPsu: 800, length: 300, kind: 'triple', vram: 20, mem: 'GDDR6', color: 0xd24a3a,
      desc: 'A large-memory high-end card for 4K gaming and heavy creative work.',
      fit: '4K gaming and large projects.',
      watch: 'Needs a big case and a strong power supply.'
    },
    {
      id: 'rtx5070ti', name: 'NVIDIA GeForce RTX 5070 Ti 16 GB', price: 6499, tag: '1440p · enthusiast', short: '16 GB GDDR7 · about 300 W',
      score: 10.2, watts: 300, minPsu: 750, length: 340, kind: 'triple', vram: 16, mem: 'GDDR7', color: 0x76b900,
      desc: 'A high-end card for demanding games at 1440p and entry-level 4K.',
      fit: 'High-refresh 1440p and 4K gaming.'
    },
    {
      id: 'rtx5080', name: 'NVIDIA GeForce RTX 5080 16 GB', price: 8499, tag: '4K · enthusiast', short: '16 GB GDDR7 · about 360 W',
      score: 12.5, watts: 360, minPsu: 850, length: 340, kind: 'triple', vram: 16, mem: 'GDDR7', color: 0x76b900,
      desc: 'A top-tier card for 4K gaming and demanding creative work.',
      fit: '4K gaming at high settings.',
      watch: 'Needs a large case and a strong power supply.'
    },
    {
      id: 'rtx5090', name: 'NVIDIA GeForce RTX 5090 32 GB', price: 18999, tag: 'Flagship · 4K', short: '32 GB GDDR7 · about 575 W',
      score: 17.0, watts: 575, minPsu: 1000, length: 304, kind: 'triple', vram: 32, mem: 'GDDR7', color: 0x76b900,
      desc: 'The fastest consumer card available, built for 4K gaming and heavy professional work.',
      fit: 'Enthusiasts who want the best 4K performance.',
      watch: 'Very power hungry. It needs a 1000 W power supply and a case with good airflow.'
    }
  ],

  storage: [
    {
      id: '500ssd', name: '500 GB NVMe SSD', price: 199, tag: 'Basic storage', short: 'M.2 · NVMe',
      capacity: 500, interface: 'NVMe', read: 3500, gen4: false,
      desc: 'A fast drive for Windows and a few games. Much quicker than a hard drive.',
      fit: 'Windows plus a handful of games.'
    },
    {
      id: '1tbssd', name: '1 TB NVMe SSD', price: 329, tag: 'Most balanced', short: 'M.2 · NVMe',
      capacity: 1000, interface: 'NVMe', read: 3500, gen4: false,
      desc: 'Room for Windows, apps and several large games. A good default size.',
      fit: 'Most gaming PCs.'
    },
    {
      id: '2tbssd', name: '2 TB NVMe SSD', price: 579, tag: 'Large game library', short: 'M.2 · NVMe',
      capacity: 2000, interface: 'NVMe', read: 3500, gen4: false,
      desc: 'Space for a big game library, photos and video projects.',
      fit: 'Large game libraries and media.'
    },
    {
      id: '1tbgen4', name: '1 TB PCIe 4.0 NVMe SSD', price: 449, tag: 'Faster · with heatsink', short: 'M.2 · PCIe 4.0 · heatsink',
      capacity: 1000, interface: 'PCIe 4.0 NVMe', read: 7000, gen4: true,
      desc: 'Much faster than a standard NVMe drive, with its own heatsink to keep speeds steady.',
      fit: 'Anyone who copies or loads big files often.',
      watch: 'On older boards this drive may run at PCIe 3.0 speed.'
    },
    {
      id: '2tbgen4', name: '2 TB PCIe 4.0 NVMe SSD', price: 879, tag: 'Fast and large', short: 'M.2 · PCIe 4.0 · heatsink',
      capacity: 2000, interface: 'PCIe 4.0 NVMe', read: 7000, gen4: true,
      desc: 'Fast and roomy. A good main drive when your game library is big.',
      fit: 'Big game libraries that need speed.'
    },
    {
      id: '4tbssd', name: '4 TB NVMe SSD', price: 1199, tag: 'Huge capacity', short: 'M.2 · NVMe',
      capacity: 4000, interface: 'NVMe', read: 3500, gen4: false,
      desc: 'A very large drive for big libraries and raw video footage.',
      fit: 'Creators who keep lots of large projects.'
    }
  ],

  psu: [
    {
      id: '500w', name: '500 W 80+ Bronze PSU', price: 299, tag: 'Entry level', short: '500 W · Bronze efficiency',
      watts: 500, efficiency: 'Bronze', modular: false,
      desc: 'Enough for modest builds with low-power cards. The brand and model matter as much as the number on the box.',
      fit: 'Basic PCs and light graphics cards.',
      watch: 'Buy a known brand. Cheap unbranded units are risky.'
    },
    {
      id: '550w', name: '550 W 80+ Bronze PSU', price: 349, tag: 'Value', short: '550 W · Bronze efficiency',
      watts: 550, efficiency: 'Bronze', modular: false,
      desc: 'A budget choice for mid-range cards. Pick a reputable model with a good warranty.',
      fit: 'Builds with an RX 6600 or an RTX 4060.'
    },
    {
      id: '650w', name: '650 W 80+ Bronze PSU', price: 429, tag: 'Comfortable headroom', short: '650 W · Bronze efficiency',
      watts: 650, efficiency: 'Bronze', modular: false,
      desc: 'Extra capacity for stronger parts and future upgrades.',
      fit: 'Most 1080p builds and light 1440p builds.'
    },
    {
      id: '750w', name: '750 W 80+ Gold PSU', price: 579, tag: 'Gold efficiency', short: '750 W · Gold · modular cables',
      watts: 750, efficiency: 'Gold', modular: true,
      desc: 'Higher efficiency and detachable cables for a tidier build.',
      fit: 'Stronger processors and cards with room to grow.'
    },
    {
      id: '850w', name: '850 W 80+ Gold PSU', price: 749, tag: 'High-end ready', short: '850 W · Gold · modular cables',
      watts: 850, efficiency: 'Gold', modular: true,
      desc: 'Enough power for a high-end graphics card and a fast processor.',
      fit: 'Cards above 300 W.'
    },
    {
      id: '1000w', name: '1000 W 80+ Platinum PSU', price: 1199, tag: 'Enthusiast', short: '1000 W · Platinum · modular cables',
      watts: 1000, efficiency: 'Platinum', modular: true,
      desc: 'Plenty of capacity and very high efficiency for the most powerful parts.',
      fit: 'Top-end graphics cards and heavy builds.'
    }
  ],

  case: [
    {
      id: 'budget-atx', name: 'Basic ATX mid-tower', price: 329, tag: 'Simple and roomy', short: 'Up to 330 mm GPU · 160 mm cooler',
      maxGpu: 330, maxCooler: 160, radiators: [240], forms: ['mATX', 'ATX'], fans: 3, style: 'budget', finish: 'dark',
      desc: 'A plain steel tower with a perforated front and room for a full-size board. Nothing fancy, but it does the job.',
      fit: 'A first build on a tight budget.'
    },
    {
      id: 'compact', name: 'Compact airflow case', price: 299, tag: '3 fans · micro-ATX', short: 'Up to 330 mm GPU · 160 mm cooler',
      maxGpu: 330, maxCooler: 160, radiators: [240], forms: ['mATX'], fans: 3, style: 'compact', finish: 'dark',
      desc: 'A small case with a mesh front. It keeps parts cool as long as air can move through it.',
      fit: 'Small, low-cost builds with a micro-ATX board.'
    },
    {
      id: 'mini-mesh', name: 'Mini mesh case', price: 349, tag: '3 fans · compact', short: 'Up to 310 mm GPU · 160 mm cooler',
      maxGpu: 310, maxCooler: 160, radiators: [240], forms: ['mATX'], fans: 3, style: 'mini', finish: 'dark',
      desc: 'A compact mesh-front case with a bit more room for cable routing than the smallest options.',
      fit: 'Compact micro-ATX builds with shorter graphics cards.'
    },
    {
      id: 'cube-airflow', name: 'Cube airflow case', price: 429, tag: '4 fans · micro-ATX cube', short: 'Up to 335 mm GPU · 160 mm cooler',
      maxGpu: 335, maxCooler: 160, radiators: [240], forms: ['mATX'], fans: 4, style: 'cube', finish: 'dark',
      desc: 'A wider compact case with a mesh front and room for four fans.',
      fit: 'A compact build that needs more airflow.'
    },
    {
      id: 'matx-glass', name: 'Micro-ATX glass tower', price: 449, tag: '4 fans · glass front and side', short: 'Up to 320 mm GPU · 165 mm cooler',
      maxGpu: 320, maxCooler: 165, radiators: [240], forms: ['mATX'], fans: 4, style: 'matxglass', finish: 'dark',
      desc: 'A small tower with glass on the front and side, so you can show off the build without a big footprint.',
      fit: 'Showing off a compact micro-ATX build.'
    },
    {
      id: 'mesh', name: 'Mesh mid-tower', price: 399, tag: '4 fans · ATX', short: 'Up to 360 mm GPU · 165 mm cooler · 360 mm radiator',
      maxGpu: 360, maxCooler: 165, radiators: [240, 360], forms: ['mATX', 'ATX'], fans: 4, style: 'mesh', finish: 'dark',
      desc: 'A roomy airflow case with four fans and space for large graphics cards.',
      fit: 'A flexible, well-ventilated case for most gaming builds.'
    },
    {
      id: 'white-mesh', name: 'White mesh mid-tower', price: 499, tag: '4 fans · light finish', short: 'Up to 360 mm GPU · 165 mm cooler',
      maxGpu: 360, maxCooler: 165, radiators: [240, 360], forms: ['mATX', 'ATX'], fans: 4, style: 'mesh', finish: 'light',
      desc: 'The same airflow design as the mesh tower, in a light finish.',
      fit: 'A bright build that still breathes well.'
    },
    {
      id: 'silent-atx', name: 'Quiet-panel ATX case', price: 549, tag: '4 fans · solid front', short: 'Up to 340 mm GPU · 170 mm cooler',
      maxGpu: 340, maxCooler: 170, radiators: [240, 360], forms: ['mATX', 'ATX'], fans: 4, style: 'silent', finish: 'dark',
      desc: 'A solid front panel that softens fan noise and looks more understated.',
      fit: 'Quieter builds. Keep the included fans running so heat does not build up.'
    },
    {
      id: 'airflow-pro', name: 'Airflow Pro full tower', price: 699, tag: '5 fans · lots of room', short: 'Up to 420 mm GPU · 185 mm cooler',
      maxGpu: 420, maxCooler: 185, radiators: [240, 360], forms: ['mATX', 'ATX'], fans: 5, style: 'tower', finish: 'dark',
      desc: 'A tall mesh-front tower with plenty of room for long cards and big coolers.',
      fit: 'Large gaming builds and easy upgrades.'
    },
    {
      id: 'panorama-matx', name: 'Panoramic micro-ATX glass case', price: 599, tag: '5 fans · glass front and side', short: 'Up to 360 mm GPU · 170 mm cooler',
      maxGpu: 360, maxCooler: 170, radiators: [240, 360], forms: ['mATX'], fans: 5, style: 'fishbowl', finish: 'dark',
      desc: 'A compact case with a curved glass look, made to show the components off.',
      fit: 'Display builds in a micro-ATX size. Plan the airflow carefully.'
    },
    {
      id: 'showcase', name: 'Panoramic showcase case', price: 649, tag: '6 fans · ATX · glass sides', short: 'Up to 400 mm GPU · 170 mm cooler',
      maxGpu: 400, maxCooler: 170, radiators: [240, 360], forms: ['mATX', 'ATX'], fans: 6, style: 'showcase', finish: 'dark',
      desc: 'Glass on the front and side, so your parts and lighting are always on display.',
      fit: 'A clean, visible build. Make sure airflow is still good.'
    },
    {
      id: 'white-glass', name: 'White panoramic glass case', price: 849, tag: '6 fans · light finish · glass', short: 'Up to 380 mm GPU · 170 mm cooler',
      maxGpu: 380, maxCooler: 170, radiators: [240, 360], forms: ['mATX', 'ATX'], fans: 6, style: 'showcase', finish: 'light',
      desc: 'A bright glass case with a clean white finish and room for a large graphics card.',
      fit: 'Light-colored builds that need to be seen.'
    },
    {
      id: 'dual-chamber', name: 'Dual-chamber showcase tower', price: 799, tag: '7 fans · hidden cable area', short: 'Up to 420 mm GPU · 180 mm cooler',
      maxGpu: 420, maxCooler: 180, radiators: [240, 360], forms: ['mATX', 'ATX'], fans: 7, style: 'showcase', finish: 'dark',
      desc: 'Glass front and a separate rear area that hides the cables, so the build stays tidy.',
      fit: 'Large builds where cable routing matters.'
    },
    {
      id: 'full-tower-mesh', name: 'Full-tower mesh case', price: 899, tag: '5 fans · large ATX', short: 'Up to 440 mm GPU · 190 mm cooler',
      maxGpu: 440, maxCooler: 190, radiators: [240, 360], forms: ['mATX', 'ATX'], fans: 5, style: 'tower', finish: 'dark',
      desc: 'A spacious full tower with a mesh front and room for oversized parts.',
      fit: 'High-power systems and easier installation.'
    },
    {
      id: 'white-full', name: 'White full-tower mesh case', price: 949, tag: '6 fans · light finish', short: 'Up to 440 mm GPU · 190 mm cooler',
      maxGpu: 440, maxCooler: 190, radiators: [240, 360], forms: ['mATX', 'ATX'], fans: 6, style: 'tower', finish: 'light',
      desc: 'A large white tower with a mesh front and room for big graphics cards and coolers.',
      fit: 'Large light-colored builds.'
    },
    {
      id: 'full-tower-glass', name: 'Full-tower glass case', price: 999, tag: '8 fans · panoramic glass', short: 'Up to 450 mm GPU · 190 mm cooler',
      maxGpu: 450, maxCooler: 190, radiators: [240, 360], forms: ['mATX', 'ATX'], fans: 8, style: 'towerglass', finish: 'dark',
      desc: 'A large display case with front and side glass and plenty of room for premium parts.',
      fit: 'Big display builds. Keep the glass clean and check the intake airflow.'
    }
  ],

  fans: [
    {
      id: 'included', name: 'Fans that come with the case', price: 0, tag: 'No extra cost', short: 'Whatever your case includes',
      extra: 0, count: 0, size: 0, rgb: false, placement: 'Case default',
      desc: 'The fans that come with your case. Fine for most builds.',
      fit: 'A good start. Upgrade later if the PC runs hot.'
    },
    {
      id: 'rgb3', name: '3 × 120 mm RGB fan pack', price: 199, tag: 'Glowing fans', short: 'Replaces the front fans · RGB ring',
      extra: 0, count: 3, size: 120, rgb: true, placement: 'Front',
      desc: 'Three matching fans with a glowing ring. They replace the front fans, so the lighting shows through the glass.',
      fit: 'A matching look through a glass side.'
    },
    {
      id: 'perf3', name: '3 × 120 mm performance fan pack', price: 249, tag: 'Quieter airflow', short: 'Replaces the front fans · no lighting',
      extra: 0, count: 3, size: 120, rgb: false, placement: 'Front',
      desc: 'Three quality fans that move more air at lower noise than basic case fans.',
      fit: 'Cooler parts without the lights.'
    },
    {
      id: 'top2', name: '2 × 140 mm top fans', price: 179, tag: 'Extra exhaust', short: 'Mounts on top · exhaust',
      extra: 2, count: 2, size: 140, rgb: false, placement: 'Top',
      desc: 'Two large fans on the top of the case that push hot air out.',
      fit: 'Hot builds. Not usable with a top radiator.'
    }
  ],

  lighting: [
    {
      id: 'off', name: 'Lights off', price: 0, tag: 'No glow', short: 'A dark, quiet look',
      color: 0x000000, mode: 'off',
      desc: 'No lighting at all. The parts look the way they do in daylight.',
      fit: 'A clean, simple look.'
    },
    {
      id: 'cyan', name: 'Cyan', price: 0, tag: 'Single color', short: 'One steady color',
      color: 0x35e0ff, mode: 'solid',
      desc: 'A steady cool cyan on all the lit parts.',
      fit: 'Goes with most desks.'
    },
    {
      id: 'violet', name: 'Violet', price: 0, tag: 'Single color', short: 'One steady color',
      color: 0x9b6bff, mode: 'solid',
      desc: 'A steady violet that works well in a dark room.',
      fit: 'Moody builds.'
    },
    {
      id: 'red', name: 'Red', price: 0, tag: 'Single color', short: 'One steady color',
      color: 0xff3b3b, mode: 'solid',
      desc: 'A steady red. A bold look.',
      fit: 'Gaming builds with a bit of attitude.'
    },
    {
      id: 'white', name: 'White', price: 0, tag: 'Single color', short: 'One steady color',
      color: 0xfff2e0, mode: 'solid',
      desc: 'A soft, steady white that keeps things simple.',
      fit: 'Minimal and tidy builds.'
    },
    {
      id: 'rainbow', name: 'Rainbow cycle', price: 0, tag: 'Animated', short: 'Colors slowly change',
      color: 0xff00ff, mode: 'rainbow',
      desc: 'Colors cycle slowly through the spectrum.',
      fit: 'Playful builds.'
    }
  ],
  os: []
};

addCatalogOptions(catalog);

export const presets = {
  starter: { cpu: 'r5600g', cooler: 'stock', motherboard: 'a520m', ram: '16ddr4', gpu: 'none', storage: '500ssd', psu: '500w', case: 'compact', fans: 'included', lighting: 'off', os: 'win11' },
  esports: { cpu: 'r5600', cooler: 'stock', motherboard: 'b550m', ram: '32ddr4', gpu: 'rx6600', storage: '1tbssd', psu: '550w', case: 'mesh', fans: 'included', lighting: 'cyan', os: 'win11' },
  creator: { cpu: 'r77700x', cooler: 'aio240', motherboard: 'b650atx', ram: '32ddr5', gpu: 'rtx5070', storage: '2tbssd', psu: '850w', case: 'showcase', fans: 'rgb3', lighting: 'rainbow', os: 'win11' },
  retroOffice: { cpu: 'i38100', cooler: 'stock', motherboard: 'h310m', ram: '16ddr4-2666', gpu: 'none', storage: '240sata', psu: '400w-atx', case: 'retro-atx-window', fans: 'included', lighting: 'off', os: 'win10' },
  retroGaming: { cpu: 'r3600', cooler: 'stock', motherboard: 'b450m', ram: '32ddr4-3200', gpu: 'gtx1660s', storage: '500ssd', psu: '520w-bronze', case: 'retro-full-atx', fans: 'included', lighting: 'amber', os: 'linuxmint' },
  budgetLinux: { cpu: 'r5500', cooler: 'stock', motherboard: 'b550m', ram: '16ddr4', gpu: 'rx570', storage: '480sata', psu: '600w-bronze', case: 'mesh-matx-2', fans: 'single120-pwm', lighting: 'off', os: 'xubuntu' },
  oldIntelRefresh: { cpu: 'i59400f', cooler: 'stock', motherboard: 'b365m', ram: '32ddr4-2666', gpu: 'rx6600', storage: '1tbgen3-value', psu: '600w-bronze', case: 'retro-silver-atx', fans: 'included', lighting: 'cool-white', os: 'win10' },
  am4Classic: { cpu: 'r5700g', cooler: 'stock', motherboard: 'b450m', ram: '32ddr4-3600-cl16', gpu: 'none', storage: '2tbgen3', psu: '600w-gold', case: 'mesh-atx-compact', fans: 'duo120-pwm', lighting: 'teal', os: 'debian' },
  matxCompact: { cpu: 'r5600', cooler: 'tower-4pipe', motherboard: 'b550m', ram: '32ddr4', gpu: 'rx7600', storage: '1tbgen4', psu: '650w-gold', case: 'mesh-matx-4', fans: 'included', lighting: 'violet', os: 'popos' },
  white1440: { cpu: 'r7600', cooler: 'stock', motherboard: 'b650m-wifi', ram: '32ddr5-6000-cl36', gpu: 'rx9060xt', storage: '2tbgen4', psu: '750w-gold-white', case: 'mesh-atx-white', fans: 'trio120-white', lighting: 'ice-blue', os: 'win11' },
  creatorLinux: { cpu: 'r7900', cooler: 'dual-120-black', motherboard: 'b650-atx-wifi', ram: '64ddr5-6000-cl32', gpu: 'rtx4070s', storage: '4tbgen4', psu: '850w-gold-atx31', case: 'workstation-full-atx', fans: 'trio140-quiet', lighting: 'mint', os: 'fedora' },
  streamingIntel: { cpu: 'i513600k', cooler: 'dual-140', motherboard: 'z790-atx-ddr5', ram: '64ddr5-5600', gpu: 'rtx4070', storage: '2tbssd', psu: '850w-gold-atx31', case: 'showcase-atx-8', fans: 'trio120-argb', lighting: 'magenta', os: 'win11' },
  workstationAM5: { cpu: 'r7950x', cooler: 'aio360-quiet', motherboard: 'x870-atx', ram: '128ddr5-5200', gpu: 'rtx5080', storage: '8tbgen4', psu: '1200w-gold', case: 'workstation-full-atx', fans: 'quad140-pwm', lighting: 'warm-white', os: 'opensuse-leap' },
  livingRoom: { cpu: 'r8600g', cooler: 'stock', motherboard: 'a620m-2slot', ram: '32ddr5-5600', gpu: 'none', storage: '1tbsata', psu: '450w-bronze', case: 'retro-matx-cube', fans: 'single92', lighting: 'off', os: 'lubuntu' }
};

export const presetInfo = {
  starter: { label: 'Study and browsing', blurb: 'Schoolwork, browsing, video calls and a few light games.' },
  esports: { label: 'Smooth 1080p gaming', blurb: 'Popular games at 1080p with high frame rates.' },
  creator: { label: 'Gaming and editing', blurb: '1440p games, video editing and streaming.' },
  retroOffice: { label: 'Classic office PC', blurb: 'Older Intel platform for browsing and light desktop tasks.' },
  retroGaming: { label: 'AM4 budget gaming', blurb: 'A practical older-platform 1080p build.' },
  budgetLinux: { label: 'Low-cost Linux desktop', blurb: 'Affordable parts and a lightweight Linux desktop.' },
  oldIntelRefresh: { label: 'Used Intel refresh', blurb: 'Reuse a compatible older system with a newer graphics card.' },
  am4Classic: { label: 'AM4 integrated desktop', blurb: 'Eight-core AM4 processor with integrated graphics and extra storage.' },
  matxCompact: { label: 'Compact micro-ATX gaming', blurb: 'Small-footprint case with a modern mid-range GPU.' },
  white1440: { label: 'White RX 9060 XT build', blurb: 'A light-finish build centered on the RX 9060 XT.' },
  creatorLinux: { label: 'Linux creator workstation', blurb: 'High-memory AM5 setup for production workloads.' },
  streamingIntel: { label: 'Intel streaming build', blurb: 'Modern Intel system for gaming, streaming and capture.' },
  workstationAM5: { label: 'AM5 workstation', blurb: 'Many cores, large memory and roomy storage for demanding work.' },
  livingRoom: { label: 'Small living-room PC', blurb: 'Integrated graphics in a compact case for media and everyday use.' }
};

for (const os of catalog.os.filter((part) => part.family === 'Linux')) {
  const presetId = `linux-${os.id}`;
  presets[presetId] = { ...presets.budgetLinux, os: os.id };
  presetInfo[presetId] = {
    label: `${os.name} desktop`,
    blurb: `A practical, compatible desktop build configured with ${os.name}.`
  };
}

/*
 * Game estimates use a simple model: a graphics score times a per-game weight, adjusted for resolution
 * and capped by the processor. "cap" is roughly how high a fast CPU lets that game go.
 * The weights are rough planning values. Calibrate them against real benchmarks before relying on exact numbers.
 */
export const games = [
  { name: 'Valorant', genre: 'Competitive shooter', rate: 55, cap: 320 },
  { name: 'Counter-Strike 2', genre: 'Competitive shooter', rate: 28, cap: 260 },
  { name: 'Fortnite', genre: 'Battle royale', rate: 25, cap: 220 },
  { name: 'GTA V', genre: 'Open world', rate: 26, cap: 200 },
  { name: 'Forza Horizon 5', genre: 'Racing, open world', rate: 17, cap: 200 },
  { name: 'Elden Ring', genre: 'Action RPG', rate: 15, cap: 180 },
  { name: 'Hogwarts Legacy', genre: 'Action RPG', rate: 13, cap: 180 },
  { name: 'Cyberpunk 2077', genre: 'Open world, demanding', rate: 14, cap: 180 }
];
