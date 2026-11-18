const PRICE_NOT_LOCALIZED = null;
const PRICE_NOTE = 'No localized price is supplied; check current local pricing before purchase.';

const motherboardOptions = [
  {
    id: 'research-asus-tuf-b650-plus-wifi',
    name: 'ASUS TUF Gaming B650-PLUS WIFI',
    price: PRICE_NOT_LOCALIZED,
    tag: 'AM5 · ATX · Wi-Fi 6',
    short: 'ATX · DDR5 · 4 DIMM · 3 M.2',
    socket: 'AM5',
    ram: 'DDR5',
    form: 'ATX',
    slots: 4,
    m2: 3,
    wifi: true,
    wifiType: 'Wi-Fi 6',
    usbRear: '8 ports: 1 × USB-C 20 Gb/s, 1 × USB-C 10 Gb/s, 2 × USB-A 10 Gb/s, 4 × USB-A 2.0',
    usbFront: 'USB-C header, 2 × USB-A 5 Gb/s and 4 × USB 2.0',
    pcie: 'Three M.2 sockets: one PCIe 5.0 x4 and two PCIe 4.0 x4; slot behavior depends on CPU and slot sharing.',
    lan: 'Realtek 2.5 Gb Ethernet',
    desc: 'The exact ASUS TUF Gaming B650-PLUS WIFI board uses socket AM5 and DDR5, with four DIMM slots, three M.2 sockets, Wi-Fi 6 and a 2.5 Gb Ethernet controller. M.2 lane sharing and CPU-dependent PCIe behavior are listed in ASUS’s specifications.',
    fit: 'AM5 processors and DDR5 memory in an ATX-compatible case. Confirm the selected CPU on ASUS’s support list and the case’s ATX support.',
    watch: `${PRICE_NOTE} The third M.2 socket shares bandwidth with the secondary PCIe x16 slot; memory speeds above the standard rate require supported hardware and an EXPO profile.`,
    sourceUrl: 'https://www.asus.com/us/motherboards-components/motherboards/tuf-gaming/tuf-gaming-b650-plus-wifi/techspec/'
  },
  {
    id: 'msi-pro-b660m-a-ddr4',
    name: 'MSI PRO B660M-A DDR4',
    price: PRICE_NOT_LOCALIZED,
    tag: 'Intel B660 · micro-ATX · DDR4',
    short: 'LGA1700 · 4 DIMM · 2 M.2 · 2.5 Gb LAN',
    socket: 'LGA1700',
    ram: 'DDR4',
    form: 'mATX',
    slots: 4,
    m2: 2,
    wifi: false,
    wifiType: 'No Wi-Fi',
    usbRear: 'USB 3.2 Gen 2 Type-C and Type-A, USB 3.2 Gen 1 Type-A and USB 2.0; verify port counts on MSI’s I/O diagram.',
    usbFront: 'Front USB headers are provided; match the exact case cables to the board manual.',
    pcie: 'LGA1700 board for 12th Gen Intel Core; check the manual for slot wiring and storage lane sharing.',
    lan: 'Realtek 2.5 Gb Ethernet',
    desc: 'The exact MSI PRO B660M-A DDR4 is a micro-ATX LGA1700 motherboard with four DDR4 DIMM slots, two M.2 sockets and 2.5 Gb Ethernet. This is the DDR4 edition; it does not accept DDR5 memory.',
    fit: '12th Gen Intel Core processors and DDR4 memory in a micro-ATX-compatible case. Confirm the exact processor support list and firmware before purchase.',
    watch: 'The B660 chipset does not permit multiplier overclocking for K-series CPUs. A 12700K can run at supported stock/turbo settings, but confirm cooler capacity, board power limits and case airflow.',
    sourceUrl: 'https://www.msi.com/Motherboard/PRO-B660M-A-DDR4/Specification'
  }
];

const intel12thGenCpuOptions = [
  {
    id: 'i712700k',
    name: 'Intel Core i7-12700K',
    price: PRICE_NOT_LOCALIZED,
    tag: '12th Gen · unlocked · LGA1700',
    short: '12 cores (8P+4E) · 20 threads · up to 5.0 GHz',
    socket: 'LGA1700',
    memory: 'DDR4 or DDR5, depending on motherboard',
    igpu: true,
    igpuScore: 0.8,
    cpuScore: 1.24,
    tdp: 125,
    maxTurboPower: 190,
    cores: 12,
    threads: 20,
    base: 3.6,
    boost: 5.0,
    cache: 25,
    boxCooler: false,
    desc: 'Alder Lake desktop CPU with eight Performance-cores and four Efficient-cores, 20 threads, 25 MB Intel Smart Cache and integrated UHD Graphics 770. Intel specifies 125 W Processor Base Power and 190 W Maximum Turbo Power.',
    fit: 'LGA1700 boards that support 12th Gen Intel Core; the MSI PRO B660M-A DDR4 supports DDR4 memory only. Use a capable cooler for sustained turbo loads.',
    watch: 'No boxed thermal solution is included. K-series multiplier overclocking requires a compatible Z-series chipset; B660 supports the CPU at stock/turbo settings but not CPU ratio overclocking.',
    sourceUrl: 'https://www.intel.com/content/www/us/en/products/sku/134594/intel-core-i712700k-processor-25m-cache-up-to-5-00-ghz/specifications.html'
  },
  {
    id: 'i712700',
    name: 'Intel Core i7-12700',
    price: PRICE_NOT_LOCALIZED,
    tag: '12th Gen · LGA1700',
    short: '12 cores (8P+4E) · 20 threads · up to 4.9 GHz',
    socket: 'LGA1700',
    memory: 'DDR4 or DDR5, depending on motherboard',
    igpu: true,
    igpuScore: 0.8,
    cpuScore: 1.2,
    tdp: 65,
    maxTurboPower: 180,
    cores: 12,
    threads: 20,
    base: 2.1,
    boost: 4.9,
    cache: 25,
    boxCooler: true,
    desc: 'Alder Lake desktop CPU with eight Performance-cores and four Efficient-cores, 20 threads, 25 MB Intel Smart Cache and integrated UHD Graphics 770. Intel specifies 65 W Processor Base Power and 180 W Maximum Turbo Power.',
    fit: 'LGA1700 boards that support 12th Gen Intel Core, including the MSI PRO B660M-A DDR4 with DDR4 memory.',
    watch: 'The boxed cooler is included, but a stronger cooler may be quieter under sustained high turbo power. Check firmware and the board’s power settings.',
    sourceUrl: 'https://www.intel.com/content/www/us/en/products/sku/134591/intel-core-i712700-processor-25m-cache-up-to-4-90-ghz/specifications.html'
  }
];

const compatibleExistingCpuDetails = [
  {
    id: 'i512600k',
    maxTurboPower: 150,
    desc: 'Alder Lake desktop CPU with six Performance-cores and four Efficient-cores, 16 threads, 20 MB Intel Smart Cache and integrated UHD Graphics 770. Intel specifies 125 W Processor Base Power and 150 W Maximum Turbo Power.',
    fit: 'LGA1700 boards that support 12th Gen Intel Core; works with the MSI PRO B660M-A DDR4 when paired with DDR4 memory.',
    watch: 'No boxed thermal solution is included. K-series multiplier overclocking is unavailable on B660; use a capable cooler for sustained turbo loads.',
    sourceUrl: 'https://www.intel.com/content/www/us/en/products/sku/134589/intel-core-i512600k-processor-20m-cache-up-to-4-90-ghz/specifications.html'
  },
  {
    id: 'i512400f',
    maxTurboPower: 117,
    desc: 'Alder Lake desktop CPU with six cores and 12 threads, 18 MB Intel Smart Cache, no integrated graphics, 65 W Processor Base Power and 117 W Maximum Turbo Power.',
    fit: 'LGA1700 boards that support 12th Gen Intel Core; works with the MSI PRO B660M-A DDR4 when paired with DDR4 memory.',
    watch: 'The F suffix means there are no integrated graphics, so a separate graphics card is required. The boxed version includes a basic cooler.',
    sourceUrl: 'https://www.intel.com/content/www/us/en/products/sku/134587/intel-core-i512400f-processor-18m-cache-up-to-4-40-ghz/specifications.html'
  }
];

const ramOptions = [
  {
    id: 'research-corsair-vengeance-lpx-cmk16gx4m2b3200c16',
    name: 'CORSAIR Vengeance LPX 16 GB DDR4-3200 CL16 (2 × 8 GB)',
    price: PRICE_NOT_LOCALIZED,
    tag: '16 GB · DDR4',
    short: '3200 MT/s · CL16 · 2 sticks',
    type: 'DDR4',
    capacity: 16,
    sticks: 2,
    speed: 3200,
    cl: 16,
    profile: 'XMP 2.0; rated speed requires supported system configuration and BIOS settings',
    desc: 'CORSAIR part CMK16GX4M2B3200C16 is a 16 GB kit made from two 8 GB DDR4 modules, rated at 3200 MT/s and CL16. CORSAIR notes that tested speed may require BIOS adjustments and depends on the CPU and motherboard.',
    fit: 'DDR4 motherboards with two available DIMM slots; verify the exact kit part number and the board’s memory support list.',
    watch: `${PRICE_NOTE} The advertised memory profile is not guaranteed on every CPU and motherboard combination.`,
    sourceUrl: 'https://www.corsair.com/us/en/p/memory/cmk16gx4m2b3200c16/vengeance-lpx-16gb-2-x-8gb-ddr4-dram-3200mhz-c16-memory-kit-black-cmk16gx4m2b3200c16'
  },
  {
    id: 'research-corsair-vengeance-cmk32gx5m2b6000c36',
    name: 'CORSAIR Vengeance 32 GB DDR5-6000 CL36 (2 × 16 GB)',
    price: PRICE_NOT_LOCALIZED,
    tag: '32 GB · DDR5',
    short: '6000 MT/s · CL36 · 2 sticks',
    type: 'DDR5',
    capacity: 32,
    sticks: 2,
    speed: 6000,
    cl: 36,
    profile: 'Memory profile; speed depends on CPU, motherboard and BIOS settings',
    desc: 'CORSAIR part CMK32GX5M2B6000C36 is a 32 GB kit comprising two 16 GB DDR5 modules, rated up to 6000 MT/s at CL36. CORSAIR states that its tested speed can require BIOS adjustments.',
    fit: 'DDR5 motherboards with two available DIMM slots; check the motherboard QVL and supported profile.',
    watch: `${PRICE_NOTE} CORSAIR lists this kit as optimized for Intel motherboards; verify platform support and stable operating speed before enabling its profile.`,
    sourceUrl: 'https://www.corsair.com/us/en/p/memory/cmk32gx5m2b6000c36/vengeance-32gb-2x16gb-ddr5-dram-6000mt-s-cl36-memory-kit-black-cmk32gx5m2b6000c36'
  }
];

const storageOptions = [
  {
    id: 'research-samsung-990-pro-2tb',
    name: 'Samsung 990 PRO 2 TB NVMe SSD',
    price: PRICE_NOT_LOCALIZED,
    tag: '2 TB · PCIe 4.0 NVMe',
    short: 'M.2 2280 · up to 7450/6900 MB/s',
    capacity: 2000,
    interface: 'PCIe 4.0 x4 NVMe M.2 SSD',
    read: 7450,
    write: 'Up to 6,900 MB/s',
    gen4: true,
    formFactor: 'M.2 2280',
    desc: 'Samsung identifies the 2 TB 990 PRO as a PCIe 4.0 NVMe M.2 SSD, with sequential read speeds up to 7,450 MB/s and write speeds up to 6,900 MB/s. These are manufacturer maximums, not sustained or game-loading guarantees.',
    fit: 'A free M.2 socket supporting an 80 mm PCIe NVMe drive; check the motherboard manual for slot generation and shared-lane behavior.',
    watch: `${PRICE_NOTE} Confirm the capacity and exact MZ-V9P2T0B/AM product code when ordering; published sequential speeds are best-case figures.`,
    sourceUrl: 'https://www.samsung.com/us/memory-storage/nvme-ssd/990-pro-pcie-4-0-nvme-ssd-1tb-sku-mz-v9p2t0b-am/'
  }
];

const caseOptions = [
  {
    id: 'research-corsair-4000d-airflow',
    name: 'CORSAIR 4000D AIRFLOW',
    price: PRICE_NOT_LOCALIZED,
    tag: 'ATX mid-tower · airflow front',
    short: 'GPU up to 360 mm · cooler up to 170 mm',
    maxGpu: 360,
    maxCooler: 170,
    radiators: [240, 280, 360],
    forms: ['mATX', 'ATX'],
    fans: 2,
    style: 'mesh',
    finish: 'dark',
    dimensions: '466 × 230 × 453 mm (H × W × D)',
    materials: 'Steel chassis with tempered-glass side panel and airflow-optimized steel front panel',
    includedFanLayout: 'Two included 120 mm CORSAIR AirGuide fans',
    fanMounts: 'Front: 2 × 120/140 mm; roof: 3 × 120 mm or 2 × 140 mm; rear: 1 × 120 mm',
    filters: 'Front and roof filter positions; removable PSU filter',
    driveBays: 'Up to 2 × 2.5-inch SSDs and 2 × 3.5-inch HDDs',
    expansionSlots: 7,
    radiatorPositions: 'Front: up to 360 mm; roof: up to 280 mm',
    cableSpace: '25 mm behind the motherboard tray',
    frontUsb: '1 × USB-C, 1 × USB-A 5 Gb/s, combo audio/microphone',
    desc: 'The 4000D AIRFLOW is a specific ATX mid-tower model with an airflow-optimized steel front, tempered-glass side panel, two included 120 mm AirGuide fans, and support for up to a 360 mm front radiator. CORSAIR lists 170 mm CPU-cooler and 360 mm graphics-card clearance.',
    fit: 'ATX or micro-ATX builds with graphics cards no longer than 360 mm and air coolers up to 170 mm; check radiator/fan stack clearance for the chosen GPU.',
    watch: `${PRICE_NOTE} Front-mounted radiator configurations can reduce available graphics-card length; confirm the selected layout and the motherboard’s matching front USB-C header.`,
    sourceUrl: 'https://www.corsair.com/us/en/p/cases/cc-9011200-ww/4000d-airflow-tempered-glass-mid-tower-atx-pc-case-cc-9011200-ww'
  }
];

const fanOptions = [
  {
    id: 'research-corsair-icue-link-rx120-rgb-triple-kit',
    name: 'CORSAIR iCUE LINK RX120 RGB 120 mm Triple Starter Kit',
    price: PRICE_NOT_LOCALIZED,
    tag: '3 fans · RGB · iCUE LINK',
    short: '3 × 120 mm PWM fans · system hub included',
    extra: 0,
    count: 3,
    size: 120,
    rgb: true,
    placement: 'Case intake, exhaust or radiator positions accepting 120 mm fans',
    control: 'PWM fans; iCUE LINK single-connector ecosystem, with system hub included',
    desc: 'CORSAIR part CO-9051018-WW is a triple pack of 120 mm PWM RX120 RGB fans. The starter kit includes an iCUE LINK System Hub; CORSAIR describes AirGuide stator vanes and magnetic-dome bearings.',
    fit: 'Cases or radiators with 120 mm mounting points and enough clearance for the fan/radiator stack; use the included iCUE LINK hub and supplied cables.',
    watch: `${PRICE_NOTE} This kit uses CORSAIR iCUE LINK connections rather than ordinary motherboard-only fan daisy-chaining; verify hub placement, available power and RGB software requirements.`,
    sourceUrl: 'https://www.corsair.com/us/en/p/case-fans/co-9051018-ww/icue-link-rx120-rgb-120mm-pwm-fan-triple-starter-kit-co-9051018-ww'
  }
];

const lightingOptions = [
  {
    id: 'research-lian-li-strimer-plus-v2',
    name: 'Lian Li Strimer Plus V2 addressable RGB extension cable',
    price: PRICE_NOT_LOCALIZED,
    tag: 'Addressable RGB cable lighting',
    short: 'Model family has 24-pin and GPU 8-pin variants',
    color: 0x7d8cff,
    mode: 'rainbow',
    effect: 'Customizable addressable RGB cable lighting',
    zones: 'Illuminated extension-cable strands',
    desc: 'The Strimer Plus V2 is a real Lian Li family of customizable addressable-RGB extension cables. Lian Li lists motherboard 24-pin, dual 8-pin GPU and triple 8-pin GPU versions, with lighting effects configured through L-Connect 3.',
    fit: 'A cosmetic choice for compatible 24-pin or GPU 8-pin cable extensions; confirm the exact cable variant, case clearance and controller/software requirements.',
    watch: `${PRICE_NOTE} This catalog choice represents the product family, not a particular cable length or connector SKU. Match the exact extension to the PSU-side cable and GPU power connector; it does not change performance.`,
    sourceUrl: 'https://lian-li.com/product/strimer-plus-v2/'
  }
];

const osOptions = [
  {
    id: 'research-ubuntu-26-04-1-lts',
    name: 'Ubuntu Desktop 26.04.1 LTS',
    price: 0,
    tag: 'Linux · Long-term support',
    short: 'Ubuntu 26.04.1 LTS · x86-64 / ARM64',
    family: 'Linux',
    purpose: 'General desktop operating system with long-term support',
    supportNote: 'Canonical lists five years of free security and maintenance updates for the LTS release, with Ubuntu Pro offering an extended support option.',
    desc: 'Ubuntu Desktop 26.04.1 LTS is Canonical’s long-term-support desktop release. Canonical lists Intel/AMD 64-bit and ARM 64-bit downloads and documents minimum system requirements.',
    fit: 'General desktop, development and Linux-compatible gaming workloads; verify GPU drivers, application support and game anti-cheat compatibility.',
    watch: 'The OS selection does not include installation media, support subscription or a commercial application license. Check current release notes and hardware requirements.',
    sourceUrl: 'https://ubuntu.com/download/desktop'
  },
  {
    id: 'research-windows-11-26h2',
    name: 'Microsoft Windows 11 2026 Update (26H2)',
    price: PRICE_NOT_LOCALIZED,
    tag: 'Windows · 2026 release',
    short: 'Windows 11 26H2 · x64 Installation Assistant',
    family: 'Windows',
    purpose: 'Microsoft desktop operating system',
    supportNote: 'Microsoft identifies 26H2 as the current Windows 11 release on its download page; check device requirements, release health and licensing before installation.',
    desc: 'Windows 11 2026 Update (version 26H2) is listed by Microsoft on its official Windows 11 download page. Microsoft notes that the Installation Assistant is for x64 PCs and that device requirements apply.',
    fit: 'Windows-compatible applications and games on supported x64 hardware; verify the processor, firmware, TPM and other requirements for the specific PC.',
    watch: 'This choice does not provide a license or installation media. Microsoft’s Installation Assistant requires a Windows license and does not run on Arm-based PCs.',
    sourceUrl: 'https://www.microsoft.com/en-us/software-download/windows11'
  }
];

export function addResearchCatalogOptions(catalog) {
  catalog.motherboard.push(...motherboardOptions);
  catalog.cpu.push(...intel12thGenCpuOptions);
  for (const details of compatibleExistingCpuDetails) {
    const cpu = catalog.cpu.find((part) => part.id === details.id);
    if (cpu) Object.assign(cpu, details);
  }
  catalog.ram.push(...ramOptions);
  catalog.storage.push(...storageOptions);
  catalog.case.push(...caseOptions);
  catalog.fans.push(...fanOptions);
  catalog.lighting.push(...lightingOptions);
  catalog.os.push(...osOptions);
}
