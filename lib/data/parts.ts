import type { Case, Cpu, Gpu, Motherboard, Part, Psu, Ram, Storage } from "../types";

// Prices are manually maintained street-price estimates (USD), not live market data.
// See lib/data/provider.ts for the swap-in point for a real pricing source.
//
// Last verified: 2026-08-20, via web search against Tom's Hardware / videocardprices.com /
// bestvaluegpu.com / bacloud / tech-insider / cheapestssd.com listings.
//
// Context that matters for these numbers: an AI-driven DRAM/NAND shortage (fabs shifting
// capacity to HBM for datacenter AI) has been pushing GPU, RAM, and SSD prices sharply
// upward through 2026, with no relief expected before late 2026/2027. GPU/RAM/SSD prices
// here reflect that spike and will drift again within weeks — re-verify before relying on
// them for a real purchase, or ask for a refresh.
// CPU/motherboard/PSU/case prices are less exposed to that shortage and closer to stable.
//
// amazonUrl: a real, specific Amazon listing found via search on 2026-08-20 (preferring
// manufacturer-official or well-known board-partner listings — ASUS/MSI/Gigabyte/ASRock/
// Sapphire/XFX/Corsair/Seasonic/etc. — over generic/unbranded resellers). Amazon inventory
// churns, so a listing can still go stale; PartRow falls back to a live Amazon search for
// any part without one.

// gamingIndex: real relative 1440p gaming performance from techfuelhq's 2026 GPU hierarchy
// (RTX 5090 = 100) — the same source used for the FPS benchmark table, now also driving the
// CPU-bottleneck check in lib/recommend.ts instead of the hand-guessed `tier` gap it used to.
export const gpus: Gpu[] = [
  { id: "arc-b570", category: "gpu", name: "Intel Arc B570", brand: "Intel", price: 259, tdp: 150, tier: 2, gamingIndex: 26.5, recommendedPsuWatts: 500, amazonUrl: "https://www.amazon.com/ASRock-B570-Challenger-Cooling-Graphics/dp/B0DQYM2MHX" },
  { id: "rtx-3060-12g", category: "gpu", name: "GeForce RTX 3060 12GB", brand: "NVIDIA", price: 280, tdp: 170, tier: 2, gamingIndex: 25.0, recommendedPsuWatts: 550, amazonUrl: "https://www.amazon.com/MSI-GeForce-RTX-3060-12G/dp/B08WPRMVWB" },
  { id: "arc-b580", category: "gpu", name: "Intel Arc B580", brand: "Intel", price: 303, tdp: 190, tier: 3, gamingIndex: 30.3, recommendedPsuWatts: 600, amazonUrl: "https://www.amazon.com/ASRock-Intel-B580-Challenger-Graphics/dp/B0DNV4NWF7" },
  { id: "rx-7600", category: "gpu", name: "Radeon RX 7600", brand: "AMD", price: 279, tdp: 165, tier: 3, gamingIndex: 27.2, recommendedPsuWatts: 550, amazonUrl: "https://www.amazon.com/Sapphire-11324-01-20G-Radeon-Gaming-Graphics/dp/B0C4WBW3XX" },
  { id: "rtx-4060", category: "gpu", name: "GeForce RTX 4060", brand: "NVIDIA", price: 339, tdp: 115, tier: 3, gamingIndex: 28.4, recommendedPsuWatts: 550, amazonUrl: "https://www.amazon.com/MSI-GeForce-4060-Gaming-Graphics/dp/B0C7WCKXB6" },
  { id: "rtx-5060", category: "gpu", name: "GeForce RTX 5060", brand: "NVIDIA", price: 330, tdp: 145, tier: 4, gamingIndex: 35.8, recommendedPsuWatts: 550, amazonUrl: "https://www.amazon.com/ASUS-Graphics-DisplayPort-Axial-tech-Technology/dp/B0F8PR9L3X" },
  { id: "rx-9060xt-8g", category: "gpu", name: "Radeon RX 9060 XT 8GB", brand: "AMD", price: 400, tdp: 150, tier: 4, gamingIndex: 37.3, recommendedPsuWatts: 450, amazonUrl: "https://www.amazon.com/ASUS-GeForce-Dual-Fan-Graphics-Warranty/dp/B0F8PR76W4" },
  { id: "rx-9060xt-16g", category: "gpu", name: "Radeon RX 9060 XT 16GB", brand: "AMD", price: 470, tdp: 160, tier: 5, gamingIndex: 40.2, recommendedPsuWatts: 450, amazonUrl: "https://www.amazon.com/ASUS-RadeonTM-Graphics-2-5-Slot-axial-tech/dp/B0F8PPT3G1" },
  { id: "rtx-4060ti-16g", category: "gpu", name: "GeForce RTX 4060 Ti 16GB", brand: "NVIDIA", price: 450, tdp: 165, tier: 5, gamingIndex: 36.2, recommendedPsuWatts: 550, amazonUrl: "https://www.amazon.com/MSI-GeForce-Ventus-Black-Graphics/dp/B0CBK7BRL9" },
  { id: "rtx-5060ti-16g", category: "gpu", name: "GeForce RTX 5060 Ti 16GB", brand: "NVIDIA", price: 805, tdp: 180, tier: 5, gamingIndex: 43.9, recommendedPsuWatts: 600, amazonUrl: "https://www.amazon.com/ASUS-DisplayPort-2-5-Slot-Axial-tech-Technology/dp/B0F7WB6LSH" },
  { id: "rx-7700xt", category: "gpu", name: "Radeon RX 7700 XT", brand: "AMD", price: 409, tdp: 245, tier: 5, gamingIndex: 43.4, recommendedPsuWatts: 700, amazonUrl: "https://www.amazon.com/SAPPHIRE-PULSE-RADEON-GAMING-GDDR6-VIDEO/dp/B0CGLYMRFX" },
  { id: "rtx-4070", category: "gpu", name: "GeForce RTX 4070", brand: "NVIDIA", price: 520, tdp: 200, tier: 6, gamingIndex: 46.5, recommendedPsuWatts: 600, amazonUrl: "https://www.amazon.com/NVIDIA-GeForce-4070-Founders-Graphics/dp/B0C3SPXZJ8" },
  { id: "rtx-5070", category: "gpu", name: "GeForce RTX 5070", brand: "NVIDIA", price: 900, tdp: 220, tier: 6, gamingIndex: 57.6, recommendedPsuWatts: 650, amazonUrl: "https://www.amazon.com/NVIDIA-GeForce-GDDR7-Graphics-Graphite/dp/B0F7XHBT13" },
  { id: "rx-9070", category: "gpu", name: "Radeon RX 9070", brand: "AMD", price: 820, tdp: 220, tier: 7, gamingIndex: 62.1, recommendedPsuWatts: 650, amazonUrl: "https://www.amazon.com/GIGABYTE-Radeon-Graphics-GV-R9070GAMING-OC-16GD/dp/B0DS2QZC9P" },
  { id: "rx-9070xt", category: "gpu", name: "Radeon RX 9070 XT", brand: "AMD", price: 799, tdp: 304, tier: 7, gamingIndex: 69.7, recommendedPsuWatts: 750, amazonUrl: "https://www.amazon.com/Sapphire-11348-03-20G-RadeonTM-Gaming-Graphics/dp/B0DTHMPWFR" },
  { id: "rtx-5070ti", category: "gpu", name: "GeForce RTX 5070 Ti", brand: "NVIDIA", price: 1050, tdp: 300, tier: 8, gamingIndex: 69.8, recommendedPsuWatts: 750, amazonUrl: "https://www.amazon.com/GIGABYTE-Graphics-WINDFORCE-GV-N507TGAMING-OC-16GD/dp/B0DTRC7782" },
  { id: "rtx-4080-super", category: "gpu", name: "GeForce RTX 4080 Super", brand: "NVIDIA", price: 1000, tdp: 320, tier: 8, gamingIndex: 70.9, recommendedPsuWatts: 750, amazonUrl: "https://www.amazon.com/NVIDIA-GeForce-4080-Super-GDDR6X/dp/B0CVNM2LBK" },
  { id: "rtx-5080", category: "gpu", name: "GeForce RTX 5080", brand: "NVIDIA", price: 1500, tdp: 360, tier: 9, gamingIndex: 76.7, recommendedPsuWatts: 850, amazonUrl: "https://www.amazon.com/NVIDIA-GeForce-RTX-5080-Founders/dp/B0DYVCGVK4" },
  { id: "rtx-5090", category: "gpu", name: "GeForce RTX 5090", brand: "NVIDIA", price: 4700, tdp: 575, tier: 10, gamingIndex: 100.0, recommendedPsuWatts: 1000, amazonUrl: "https://www.amazon.com/GIGABYTE-Graphics-WINDFORCE-GV-N5090GAMING-OC-32GD/dp/B0DT7GBNWQ" },
];

// gamingIndex: real relative *gaming* performance (not general/productivity benchmarks,
// which overstate high-core-count CPUs — gaming barely scales past 6-8 cores). Sourced from
// techfuelhq's 2026 CPU hierarchy for the 7 current-gen chips it covers; the rest (older
// AM4 Ryzen 5000 parts, and current-gen chips outside that table) are positioned from
// several head-to-head gaming comparisons against those 7 anchors. tier (1-10) is derived
// from gamingIndex via the same curve used for GPUs, so it's no longer a separate guess —
// note gaming performance is much less spread out than GPU performance, so CPU tiers cluster
// in the 2-7 range rather than using the full 1-10 scale; that compression is real, not a bug.
export const cpus: Cpu[] = [
  // AM4 (paired with DDR4, not DDR5) — Ryzen 5000 series stuck around specifically because
  // it's the budget lever: an AM4 CPU + motherboard + DDR4 kit is dramatically cheaper than
  // any AM5/LGA1851 combination, especially with DDR5 prices where they are. 5500 is the
  // floor (weakest/cheapest); 5600 has 2x the L3 cache and a higher boost clock for a modest
  // step up — both keep their real relative pricing (5600 costs more than 5500).
  { id: "ryzen-5-5500", category: "cpu", name: "Ryzen 5 5500", brand: "AMD", price: 95, socket: "AM4", tdp: 65, tier: 2, gamingIndex: 40, amazonUrl: "https://www.amazon.com/AMD-5500-12-Thread-Unlocked-Processor/dp/B09VCJ171S" },
  { id: "ryzen-5-5600", category: "cpu", name: "Ryzen 5 5600", brand: "AMD", price: 120, socket: "AM4", tdp: 65, tier: 2, gamingIndex: 45, amazonUrl: "https://www.amazon.com/AMD-5600-12-Thread-Unlocked-Processor/dp/B09VCHR1VH" },
  { id: "ryzen-7-5700x", category: "cpu", name: "Ryzen 7 5700X", brand: "AMD", price: 200, socket: "AM4", tdp: 65, tier: 3, gamingIndex: 50 },
  // 3D V-Cache makes this punch well above its (older) generation specifically for gaming —
  // AMD relaunched it as a "10th Anniversary Edition" in mid-2026 at this official price,
  // undercutting the $450-800 collector pricing older stock was fetching beforehand.
  { id: "ryzen-7-5800x3d", category: "cpu", name: "Ryzen 7 5800X3D", brand: "AMD", price: 349, socket: "AM4", tdp: 105, tier: 6, gamingIndex: 68, amazonUrl: "https://www.amazon.com/AMD-5800X3D-16-Thread-Processor-Technology/dp/B09VCJ2SHD" },
  { id: "ryzen-5-7500f", category: "cpu", name: "Ryzen 5 7500F", brand: "AMD", price: 150, socket: "AM5", tdp: 65, tier: 5, gamingIndex: 62, amazonUrl: "https://www.amazon.com/AMD-Ryzen-7500F-3-7GHz-Threads/dp/B0D1CK42PV" },
  { id: "core-ultra-5-225f", category: "cpu", name: "Core Ultra 5 225F", brand: "Intel", price: 210, socket: "LGA1851", tdp: 65, tier: 4, gamingIndex: 57, amazonUrl: "https://www.amazon.com/Intel%C2%AE-CoreTM-Desktop-Processor-P-cores/dp/B0DT7CW7VR" },
  { id: "ryzen-5-9600x", category: "cpu", name: "Ryzen 5 9600X", brand: "AMD", price: 235, socket: "AM5", tdp: 65, tier: 6, gamingIndex: 72.6, amazonUrl: "https://www.amazon.com/AMD-RyzenTM-9600X-12-Thread-Processor/dp/B0D6NN6TM7" },
  { id: "ryzen-7-7700", category: "cpu", name: "Ryzen 7 7700", brand: "AMD", price: 270, socket: "AM5", tdp: 65, tier: 5, gamingIndex: 65, amazonUrl: "https://www.amazon.com/AMD-7700-16-Thread-Unlocked-Processor/dp/B0BMQHSCVF" },
  { id: "core-ultra-5-245k", category: "cpu", name: "Core Ultra 5 245K", brand: "Intel", price: 270, socket: "LGA1851", tdp: 125, tier: 5, gamingIndex: 67.1, amazonUrl: "https://www.amazon.com/Intel-Core-Ultra-Processor-245K/dp/B0DFK2P311" },
  { id: "ryzen-7-9700x", category: "cpu", name: "Ryzen 7 9700X", brand: "AMD", price: 310, socket: "AM5", tdp: 65, tier: 7, gamingIndex: 75, amazonUrl: "https://www.amazon.com/AMD-9700X-16-Thread-Unlocked-Processor/dp/B0D6NMDNNX" },
  { id: "core-ultra-7-265k", category: "cpu", name: "Core Ultra 7 265K", brand: "Intel", price: 300, socket: "LGA1851", tdp: 125, tier: 6, gamingIndex: 70.3, amazonUrl: "https://www.amazon.com/Intel-Core-Ultra-Processor-265K/dp/B0DFK2MH2D" },
  { id: "ryzen-9-7900x", category: "cpu", name: "Ryzen 9 7900X", brand: "AMD", price: 380, socket: "AM5", tdp: 120, tier: 6, gamingIndex: 69.2, amazonUrl: "https://www.amazon.com/AMD-7900X-24-Thread-Unlocked-Processor/dp/B0BBJ59WJ4" },
  { id: "ryzen-9-9900x", category: "cpu", name: "Ryzen 9 9900X", brand: "AMD", price: 400, socket: "AM5", tdp: 120, tier: 6, gamingIndex: 73.9, amazonUrl: "https://www.amazon.com/AMD-RyzenTM-9900X-24-Thread-Processor/dp/B0D6NN87T8" },
  { id: "core-ultra-9-285k", category: "cpu", name: "Core Ultra 9 285K", brand: "Intel", price: 500, socket: "LGA1851", tdp: 125, tier: 6, gamingIndex: 71.8, amazonUrl: "https://www.amazon.com/Intel-Core-Ultra-Processor-285K/dp/B0DFKC99VL" },
  { id: "ryzen-9-9950x", category: "cpu", name: "Ryzen 9 9950X", brand: "AMD", price: 575, socket: "AM5", tdp: 170, tier: 7, gamingIndex: 76.9, amazonUrl: "https://www.amazon.com/AMD-RyzenTM-9950X-32-Thread-Processor/dp/B0D6NNRBGP" },
  // AM5 X3D — the 3D V-Cache lineup, all sourced from the same techfuelhq hierarchy as the
  // non-X3D chips above. These are the real reason gaming tiers 8-10 exist in the catalog at
  // all: no non-X3D chip gets close, since gaming just doesn't scale with core count/clocks
  // the way productivity workloads do, but the extra cache is disproportionately good for it.
  { id: "ryzen-5-7600x3d", category: "cpu", name: "Ryzen 5 7600X3D", brand: "AMD", price: 230, socket: "AM5", tdp: 65, tier: 7, gamingIndex: 80.6, amazonUrl: "https://amazon.com/AMD-7600X3D-Raphael-4-1GHz-Processor/dp/B0F9XH8DBP" },
  { id: "ryzen-7-7800x3d", category: "cpu", name: "Ryzen 7 7800X3D", brand: "AMD", price: 334, socket: "AM5", tdp: 120, tier: 8, gamingIndex: 85.6, amazonUrl: "https://www.amazon.com/AMD-Ryzen-7800X3D-16-Thread-Processor/dp/B0BTZB7F88" },
  { id: "ryzen-7-9800x3d", category: "cpu", name: "Ryzen 7 9800X3D", brand: "AMD", price: 465, socket: "AM5", tdp: 120, tier: 10, gamingIndex: 97.0, amazonUrl: "https://www.amazon.com/AMD-9800X3D-16-Thread-Desktop-Processor/dp/B0DKFMSMYK" },
  { id: "ryzen-9-9950x3d", category: "cpu", name: "Ryzen 9 9950X3D", brand: "AMD", price: 650, socket: "AM5", tdp: 170, tier: 9, gamingIndex: 95.7, amazonUrl: "https://www.amazon.com/AMD-Ryzen-9950X3D-16-Core-Processor/dp/B0DVZSG8D5" },
];

// tier reflects VRM/build quality and chipset class (A620 < B650 < B850 < X870E; B860 < Z890),
// not just price — e.g. Intel's unlocked "K" CPUs need a Z-series board to actually overclock,
// so B860 never qualifies as a match for a K-series chip regardless of its tier gap.
export const motherboards: Motherboard[] = [
  // AM4 — old chipsets, but still fine for the AM4 CPUs above; A520/B450/B550 all cost a
  // fraction of any AM5/LGA1851 board.
  { id: "mb-a520m", category: "motherboard", name: "Gigabyte A520M K V2", brand: "Gigabyte", price: 45, socket: "AM4", tier: 1, amazonUrl: "https://www.amazon.com/Gigabyte-A520M-motherboard-Socket-micro/dp/B0BXFBN121" },
  { id: "mb-b450m", category: "motherboard", name: "ASRock B450M-HDV R4.0", brand: "ASRock", price: 55, socket: "AM4", tier: 2 },
  { id: "mb-b550m", category: "motherboard", name: "ASUS Prime B550M-A", brand: "ASUS", price: 70, socket: "AM4", tier: 3, amazonUrl: "https://www.amazon.com/PLACA-ASUS-PRIME-B550M-A-AM4/dp/B089HDHVV6" },
  { id: "mb-a620m", category: "motherboard", name: "MSI PRO A620M-E", brand: "MSI", price: 110, socket: "AM5", tier: 1, amazonUrl: "https://www.amazon.com/MSI-PRO-A620M-Motherboard-Micro-ATX/dp/B0BZW9RG3P" },
  { id: "mb-b650m", category: "motherboard", name: "ASRock B650M PG Lightning", brand: "ASRock", price: 150, socket: "AM5", tier: 3, amazonUrl: "https://www.amazon.com/ASRock-B650M-Lightning-Socket-Type-C/dp/B0CJT9KKSD" },
  { id: "mb-b850", category: "motherboard", name: "Gigabyte B850 AORUS Elite", brand: "Gigabyte", price: 220, socket: "AM5", tier: 5, amazonUrl: "https://www.amazon.com/GIGABYTE-B850-AORUS-WIFI7-Motherboard/dp/B0DQLHVQSF" },
  { id: "mb-x870e", category: "motherboard", name: "ASUS ROG X870E Hero", brand: "ASUS", price: 520, socket: "AM5", tier: 9, amazonUrl: "https://www.amazon.com/ASUS-ROG-X870E-Motherboard-Overclocking/dp/B0DDZSP2BG" },
  { id: "mb-b860m", category: "motherboard", name: "MSI PRO B860M-P", brand: "MSI", price: 140, socket: "LGA1851", tier: 2, amazonUrl: "https://www.amazon.com/MSI-B860M-WiFi-Motherboard-mATX/dp/B0DQB38722" },
  { id: "mb-z890-steel", category: "motherboard", name: "ASRock Z890 Steel Legend", brand: "ASRock", price: 270, socket: "LGA1851", tier: 5, amazonUrl: "https://www.amazon.com/ASRock-Z890-LGA1851RL-ILM-Motherboard-Thunderbolt/dp/B0DJHLSY68" },
  { id: "mb-z890-hero", category: "motherboard", name: "ASUS ROG Maximus Z890 Hero", brand: "ASUS", price: 670, socket: "LGA1851", tier: 9, amazonUrl: "https://www.amazon.com/ASUS-ROG-Z890-ThunderboltTM-Overclocking/dp/B0DGWWRTPV" },
];

// DDR5 kit prices are roughly 4-5x their pre-shortage level as of August 2026 (a 32GB kit
// that was ~$85 in 2025 now runs $340-590 depending on retailer/speed). DDR4 has been hit
// too (a 32GB kit that was ~$60-90 in late 2025 is now ~$188) but is still far cheaper than
// DDR5 — one of the reasons AM4 remains a real budget lever, not just a cheaper CPU/board.
export const rams: Ram[] = [
  { id: "ram-16-3200-ddr4", category: "ram", name: "16GB (2x8GB) DDR4-3200", brand: "Corsair", price: 120, capacityGb: 16, memoryType: "DDR4" },
  { id: "ram-32-3200-ddr4", category: "ram", name: "32GB (2x16GB) DDR4-3200", brand: "Crucial", price: 188, capacityGb: 32, memoryType: "DDR4", amazonUrl: "https://www.amazon.com/Crucial-3200MHz-PC4-25600-Downclockable-Compatible/dp/B08C4LXXCJ" },
  { id: "ram-16-5600", category: "ram", name: "16GB (2x8GB) DDR5-5600", brand: "Corsair", price: 210, capacityGb: 16, memoryType: "DDR5", amazonUrl: "https://www.amazon.com/CORSAIR-Vengeance-2x8GB-5600MHz-Intel/dp/B0H6G2Z2ZV" },
  { id: "ram-32-6000", category: "ram", name: "32GB (2x16GB) DDR5-6000", brand: "Corsair", price: 370, capacityGb: 32, memoryType: "DDR5", amazonUrl: "https://www.amazon.com/CORSAIR-VENGEANCE-6000MHz-Compatible-Computer/dp/B0BZHTVHN5" },
  { id: "ram-32-6400", category: "ram", name: "32GB (2x16GB) DDR5-6400 CL32", brand: "G.Skill", price: 410, capacityGb: 32, memoryType: "DDR5", amazonUrl: "https://www.amazon.com/G-Skill-Trident-PC5-51200-CL32-39-39-102-F5-6400J3239G16GA2-TZ5RK/dp/B09QS2K59B" },
  { id: "ram-64-6000", category: "ram", name: "64GB (2x32GB) DDR5-6000", brand: "G.Skill", price: 700, capacityGb: 64, memoryType: "DDR5", amazonUrl: "https://www.amazon.com/G-Skill-Trident-288-Pin-CL30-40-40-96-F5-6000J3040G32GX2-TZ5N/dp/B0BJP3MRW1" },
];

// NVMe SSD prices have roughly doubled+ since late 2025 due to the same NAND shortage
// (a 2TB Gen4 drive that was ~$115-175 is now commonly $280-390).
export const storages: Storage[] = [
  { id: "ssd-500-gen4", category: "storage", name: "500GB NVMe Gen4 SSD", brand: "WD", price: 110, capacityGb: 500, amazonUrl: "https://www.amazon.com/Western-Digital-500GB-SN580-Internal/dp/B0C8WP6B8R" },
  { id: "ssd-1tb-gen4", category: "storage", name: "1TB NVMe Gen4 SSD", brand: "WD", price: 180, capacityGb: 1000, amazonUrl: "https://www.amazon.com/WD_BLACK-SN770-Internal-Gaming-Solid/dp/B09QV692XY" },
  { id: "ssd-2tb-gen4", category: "storage", name: "2TB NVMe Gen4 SSD", brand: "Samsung", price: 320, capacityGb: 2000, amazonUrl: "https://www.amazon.com/Samsung-SSD-Plus-PCIe-2280/dp/B0DHLCRF91" },
  { id: "ssd-2tb-gen5", category: "storage", name: "2TB NVMe Gen5 SSD", brand: "Samsung", price: 420, capacityGb: 2000, amazonUrl: "https://www.amazon.com/Samsung-Computing-Workstations-VAP2T0B-AM/dp/B0DX2DPJZ5" },
  { id: "ssd-4tb-gen4", category: "storage", name: "4TB NVMe Gen4 SSD", brand: "Crucial", price: 620, capacityGb: 4000, amazonUrl: "https://www.amazon.com/Crucial-Internal-PlayStation-Compatible-CT4000T500SSD5/dp/B0DBBJSGFQ" },
];

// tier reflects efficiency rating + brand/build quality, not just wattage (a bigger Bronze
// unit is still a Bronze unit) — e.g. 80+ Gold/Platinum units rank above Bronze regardless
// of how their wattage compares, so a premium GPU doesn't end up on a bargain-tier PSU.
export const psus: Psu[] = [
  { id: "psu-550-bronze", category: "psu", name: "550W 80+ Bronze", brand: "Corsair", price: 60, wattage: 550, tier: 1, amazonUrl: "https://www.amazon.com/Corsair-CV550-550-Power-Supply/dp/B07YVVNK6Y" },
  { id: "psu-650-bronze", category: "psu", name: "650W 80+ Bronze", brand: "Corsair", price: 75, wattage: 650, tier: 2, amazonUrl: "https://www.amazon.com/Corsair-CV650-Watt-Bronze-Version/dp/B08MBBQBRB" },
  { id: "psu-750-gold", category: "psu", name: "750W 80+ Gold", brand: "EVGA", price: 100, wattage: 750, tier: 5, amazonUrl: "https://www.amazon.com/EVGA-SuperNOVA-Modular-Warranty-120-GP-0750-X1/dp/B0797HL9Z4" },
  { id: "psu-850-gold", category: "psu", name: "850W 80+ Gold", brand: "Corsair", price: 125, wattage: 850, tier: 6, amazonUrl: "https://www.amazon.com/CORSAIR-RM850x-Certified-Modular-Supply/dp/B079H5WNXN" },
  { id: "psu-1000-gold", category: "psu", name: "1000W 80+ Gold", brand: "Seasonic", price: 170, wattage: 1000, tier: 7, amazonUrl: "https://www.amazon.com/Seasonic-Full-Modular-Warranty-Application-SSR-1000FX/dp/B0BG9SVPJ7" },
  { id: "psu-1200-platinum", category: "psu", name: "1200W 80+ Platinum", brand: "Seasonic", price: 250, wattage: 1200, tier: 9, amazonUrl: "https://www.amazon.com/Seasonic-Flagship-SSR-1200PD-Platinum-Modular/dp/B01N7P5MBZ" },
];

export const cases: Case[] = [
  { id: "case-matx-budget", category: "case", name: "Budget Micro-ATX Case", brand: "Cooler Master", price: 55, amazonUrl: "https://www.amazon.com/Cooler-Master-Transparent-Adjustable-Ventilated/dp/B0785GRMPG" },
  { id: "case-atx-mid", category: "case", name: "Mid-Tower ATX Case", brand: "NZXT", price: 85, amazonUrl: "https://www.amazon.com/NZXT-H510-Management-Water-Cooling-Construction/dp/B07SGWLD2C" },
  { id: "case-atx-airflow", category: "case", name: "Airflow ATX Case", brand: "Lian Li", price: 115, amazonUrl: "https://www.amazon.com/Lian-Li-LANCOOL-215-Gaming/dp/B08JM1M9YG" },
  { id: "case-atx-premium", category: "case", name: "Premium Tempered-Glass ATX Case", brand: "Fractal Design", price: 170, amazonUrl: "https://www.amazon.com/Fractal-Design-North-Slate-Light/dp/B09V8HNWW9" },
];

export const allParts: Part[] = [
  ...gpus,
  ...cpus,
  ...motherboards,
  ...rams,
  ...storages,
  ...psus,
  ...cases,
];
