export interface BuildGuide {
  id: string;
  title: string;
  description: string;
  /** Set once the corresponding video is filmed and published. */
  youtubeUrl: string | null;
}

export const buildGuides: BuildGuide[] = [
  {
    id: "prep",
    title: "Before you start",
    description: "Tools you need, anti-static precautions, and unboxing your parts safely.",
    youtubeUrl: null,
  },
  {
    id: "cpu",
    title: "Installing the CPU & cooler",
    description: "Seating the processor and mounting the cooler onto the motherboard before it goes in the case.",
    youtubeUrl: null,
  },
  {
    id: "ram-storage",
    title: "Installing RAM & storage",
    description: "Seating memory sticks in the correct slots and installing M.2/SATA drives.",
    youtubeUrl: null,
  },
  {
    id: "mobo-case",
    title: "Mounting the motherboard",
    description: "Standoffs, the I/O shield, and securing the board in the case.",
    youtubeUrl: null,
  },
  {
    id: "psu-cables",
    title: "Power supply & cable routing",
    description: "Mounting the PSU and routing cables for airflow before final assembly.",
    youtubeUrl: null,
  },
  {
    id: "gpu",
    title: "Installing the graphics card",
    description: "Seating the GPU, securing it to the case, and connecting PCIe power.",
    youtubeUrl: null,
  },
  {
    id: "first-boot",
    title: "First boot & BIOS setup",
    description: "Powering on for the first time, entering the BIOS, and enabling XMP/EXPO for full RAM speed.",
    youtubeUrl: null,
  },
  {
    id: "os-drivers",
    title: "Installing Windows & drivers",
    description: "Getting the OS installed and GPU/chipset drivers up to date.",
    youtubeUrl: null,
  },
];
