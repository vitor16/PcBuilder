export const GPU_RASTER_HIERARCHY = {
  referenceGpu: 'rtx5070',
  source: {
    title: "Tom's Hardware GPU Benchmarks Hierarchy 2026",
    url: 'https://www.tomshardware.com/reviews/gpu-hierarchy,4388.html',
    updated: '2026-06-24',
    test: '19-game geometric mean, 1080p rasterization'
  },
  results: {
    rtx5090: { averageFps: 166.3, onePercentLowFps: 116 },
    rtx5080: { averageFps: 133.6, onePercentLowFps: 99 },
    rtx4080s: { averageFps: 127.6, onePercentLowFps: 94 },
    rtx4080: { averageFps: 126.0, onePercentLowFps: 94 },
    rtx5070ti: { averageFps: 123.7, onePercentLowFps: 93 },
    rx9070xt: { averageFps: 116.7, onePercentLowFps: 92 },
    rtx5070: { averageFps: 103.8, onePercentLowFps: 80 },
    rx9070: { averageFps: 103.4, onePercentLowFps: 82 },
    rtx5060ti: { averageFps: 80.8, onePercentLowFps: 64 },
    rx9060xt: { averageFps: 70.9, onePercentLowFps: 57 },
    rtx5060: { averageFps: 64.0, onePercentLowFps: 51 },
    'arc-b580': { averageFps: 52.8, onePercentLowFps: 42 },
    'rx9060xt8': { averageFps: 60.2, onePercentLowFps: 47 }
  },
  cpuScaling: {
    referenceCpu: 'r79800x3d',
    source: {
      title: 'TechSpot GPU/CPU scaling test (10-game average)',
      url: 'https://www.techspot.com/review/3193-gpu-for-budget-pc-scaling-test/',
      updated: '2026-11-06',
      test: '10-game average, mixed tests; CPU-limited 1080p scaling'
    },
    results: {
      rtx5070: {
        r79800x3d: { averageFps: 184, onePercentLowFps: 129 },
        r7600: { averageFps: 134, onePercentLowFps: 92 },
        r5600: { averageFps: 116, onePercentLowFps: 79 },
        r5500: { averageFps: 93, onePercentLowFps: 63 }
      },
      rtx5060: {
        r79800x3d: { averageFps: 132, onePercentLowFps: 100 },
        r7600: { averageFps: 116, onePercentLowFps: 80 },
        r5600: { averageFps: 104, onePercentLowFps: 69 },
        r5500: { averageFps: 84, onePercentLowFps: 53 }
      },
      rx9060xt8: {
        r79800x3d: { averageFps: 135, onePercentLowFps: 106 },
        r7600: { averageFps: 125, onePercentLowFps: 90 },
        r5600: { averageFps: 116, onePercentLowFps: 81 },
        r5500: { averageFps: 104, onePercentLowFps: 72 }
      }
    },
    gameMeasurements: {
      'Hogwarts Legacy': {
        settings: 'In-game benchmark · High preset',
        results: {
          rtx5070: {
            r79800x3d: { averageFps: 133, onePercentLowFps: 76 },
            r7600: { averageFps: 76, onePercentLowFps: 47 },
            r5600: { averageFps: 68, onePercentLowFps: 39 },
            r5500: { averageFps: 60, onePercentLowFps: 35 }
          },
          rtx5060: {
            r79800x3d: { averageFps: 99, onePercentLowFps: 62 },
            r7600: { averageFps: 74, onePercentLowFps: 41 },
            r5600: { averageFps: 65, onePercentLowFps: 37 },
            r5500: { averageFps: 60, onePercentLowFps: 35 }
          },
          rx9060xt8: {
            r79800x3d: { averageFps: 103, onePercentLowFps: 66 },
            r7600: { averageFps: 91, onePercentLowFps: 51 },
            r5600: { averageFps: 76, onePercentLowFps: 46 },
            r5500: { averageFps: 73, onePercentLowFps: 44 }
          }
        }
      },
      'Battlefield 6': {
        settings: 'In-game benchmark · Low preset',
        results: {
          rtx5070: {
            r79800x3d: { averageFps: 251, onePercentLowFps: 197 },
            r7600: { averageFps: 168, onePercentLowFps: 129 },
            r5600: { averageFps: 151, onePercentLowFps: 120 },
            r5500: { averageFps: 126, onePercentLowFps: 97 }
          },
          rtx5060: {
            r79800x3d: { averageFps: 174, onePercentLowFps: 147 },
            r7600: { averageFps: 167, onePercentLowFps: 125 },
            r5600: { averageFps: 149, onePercentLowFps: 117 },
            r5500: { averageFps: 126, onePercentLowFps: 97 }
          },
          rx9060xt8: {
            r79800x3d: { averageFps: 170, onePercentLowFps: 143 },
            r7600: { averageFps: 169, onePercentLowFps: 136 },
            r5600: { averageFps: 156, onePercentLowFps: 128 },
            r5500: { averageFps: 143, onePercentLowFps: 111 }
          }
        }
      }
    }
  }
};

const TECHSPOT_3168 = {
  title: 'TechSpot RTX 5070 vs. RX 9070 XT: 52-game comparison',
  url: 'https://www.techspot.com/review/3168-geforce-rtx-5070-vs-radeon-rx-9070-xt/',
  updated: '2026-09-07',
  testSystem: 'Ryzen 7 9800X3D, MSI MPG X870E Carbon WiFi, 32 GB DDR5-6000 CL30, Windows 11 25H2',
  gpuBoards: {
    rx9070xt: 'Sapphire RX 9070 XT Pure',
    rtx5070: 'MSI RTX 5070 Gaming Trio White'
  },
  caveat: 'Charted settings are listed per game. The article does not label an upscaler or frame-generation mode for these results.'
};

const TECHSPOT_3176 = {
  title: 'TechSpot RX 9070 XT vs. RTX 5060 Ti 16GB: 52-game comparison',
  url: 'https://www.techspot.com/review/3176-madness-9070-xt-vs-5060-ti/',
  updated: '2026-09-24',
  testSystem: 'Ryzen 7 9800X3D, MSI MPG X870E Carbon WiFi, 32 GB DDR5-6000 CL30, Windows 11 25H2',
  gpuBoards: {
    rx9070xt: 'Sapphire RX 9070 XT Pure',
    rtx5060ti: 'MSI Ventus 2X RTX 5060 Ti 16GB'
  },
  caveat: 'Charted settings are listed per game. The article does not label an upscaler or frame-generation mode for these results.'
};

const measuredPair = (averageFps, onePercentLowFps) => ({
  r79800x3d: { averageFps, onePercentLowFps }
});

export const GPU_GAME_MEASUREMENTS = [
  {
    game: '007 First Light',
    mode: 'raster',
    settings: 'Ultra preset',
    source: TECHSPOT_3168,
    chartUrl: 'https://www.techspot.com/articles-info/3168/bench/007.png',
    resolutions: {
      '1440': { rx9070xt: measuredPair(102, 84), rtx5070: measuredPair(74, 60) },
      '2160': { rx9070xt: measuredPair(57, 49), rtx5070: measuredPair(42, 36) }
    }
  },
  {
    game: "Assassin's Creed Shadows",
    mode: 'ray-tracing',
    settings: 'Ultra High · RT Diffuse + Specular Everywhere',
    source: TECHSPOT_3168,
    chartUrl: 'https://www.techspot.com/articles-info/3168/bench/ACS.png',
    resolutions: {
      '1440': { rx9070xt: measuredPair(55, 47), rtx5070: measuredPair(40, 34) },
      '2160': { rx9070xt: measuredPair(36, 32), rtx5070: measuredPair(27, 23) }
    }
  },
  {
    game: 'DOOM: The Dark Ages',
    mode: 'raster',
    settings: 'Ultra Nightmare preset',
    source: TECHSPOT_3168,
    chartUrl: 'https://www.techspot.com/articles-info/3168/bench/Doom.png',
    resolutions: {
      '1440': { rx9070xt: measuredPair(97, 88), rtx5070: measuredPair(75, 59) },
      '2160': { rx9070xt: measuredPair(54, 48), rtx5070: measuredPair(36, 29) }
    }
  },
  {
    game: 'DOOM: The Dark Ages',
    mode: 'ray-tracing',
    settings: 'Ultra Quality · Path Tracing',
    source: TECHSPOT_3168,
    chartUrl: 'https://www.techspot.com/articles-info/3168/bench/Doom.png',
    resolutions: {
      '1440': { rx9070xt: measuredPair(19, 15), rtx5070: measuredPair(25, 20) },
      '2160': { rx9070xt: measuredPair(9, 5), rtx5070: measuredPair(7, 2) }
    }
  },
  {
    game: 'Spider-Man 2',
    mode: 'raster',
    settings: 'Very High preset',
    source: TECHSPOT_3176,
    chartUrl: 'https://www.techspot.com/articles-info/3176/bench/Spider-o.png',
    resolutions: {
      '1440': { rx9070xt: measuredPair(130, 88), rtx5060ti: measuredPair(81, 44) },
      '2160': { rx9070xt: measuredPair(80, 51), rtx5060ti: measuredPair(47, 26) }
    }
  },
  {
    game: 'Spider-Man 2',
    mode: 'ray-tracing',
    settings: 'Very High · Ray Tracing Ultimate',
    source: TECHSPOT_3176,
    chartUrl: 'https://www.techspot.com/articles-info/3176/bench/Spider-o.png',
    resolutions: {
      '1440': { rx9070xt: measuredPair(67, 44), rtx5060ti: measuredPair(42, 24) },
      '2160': { rx9070xt: measuredPair(36, 29), rtx5060ti: measuredPair(24, 14) }
    }
  },
  {
    game: 'Pragmata',
    mode: 'raster',
    settings: 'Max Quality preset',
    source: TECHSPOT_3176,
    chartUrl: 'https://www.techspot.com/articles-info/3176/bench/Pragmata-o.png',
    resolutions: {
      '1440': { rx9070xt: measuredPair(138, 113), rtx5060ti: measuredPair(89, 67) },
      '2160': { rx9070xt: measuredPair(78, 67), rtx5060ti: measuredPair(48, 38) }
    }
  },
  {
    game: 'Pragmata',
    mode: 'ray-tracing',
    settings: 'RT Max Quality',
    source: TECHSPOT_3176,
    chartUrl: 'https://www.techspot.com/articles-info/3176/bench/Pragmata-o.png',
    resolutions: {
      '1440': { rx9070xt: measuredPair(135, 111), rtx5060ti: measuredPair(83, 62) },
      '2160': { rx9070xt: measuredPair(76, 65), rtx5060ti: measuredPair(45, 36) }
    }
  }
];
