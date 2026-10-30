import type { Highlight } from "./types";

/* "Hardware & troubleshooting": /skills/hardware-and-troubleshooting */
export const hardwareAndTroubleshooting: Highlight[] = [
  {
    title: "My PC build",
    context: "Personal build",
    summary: "My own desktop, built from parts and kept running through more rounds of troubleshooting than I can count.",
    /* Read from the machine itself. The case, power supply and cooler
       can't be, so add those rows by hand. */
    specs: [
      { label: "CPU", value: "AMD Ryzen 7 7800X3D, 8 cores / 16 threads" },
      { label: "GPU", value: "AMD Radeon RX 7900 XTX" },
      { label: "Motherboard", value: "Gigabyte B650 AORUS ELITE AX" },
      { label: "Memory", value: "32 GB Corsair Vengeance DDR5 (2 × 16 GB)" },
      { label: "Storage", value: "3 TB NVMe: Samsung 990 EVO Plus 2 TB + 990 EVO 1 TB" },
      { label: "OS", value: "Windows 11" },
    ],
    points: [
      "Chose every part and assembled it myself.",
      "Troubleshot it countless times and kept it running.",
    ],
    tags: ["PC build", "AMD", "DDR5", "NVMe"],
    /* Photos go here, in order, e.g.
       { src: "/images/highlights/pc-build-1.jpg", alt: "…" }. */
    images: [],
  },
  {
    title: "Creality K1C 3D printer",
    context: "Personal project",
    summary: "An enclosed, high-speed 3D printer that turns my own 3D models into real objects.",
    specs: [
      { label: "Type", value: "Enclosed CoreXY, FDM" },
      { label: "Build volume", value: "220 × 220 × 250 mm" },
      { label: "Top speed", value: "600 mm/s" },
    ],
    points: [
      "Set up and run my own Creality K1C.",
      "Model my own designs in 3D, then print them.",
    ],
    tags: ["3D printing", "3D modelling", "Creality K1C"],
    images: [
      {
        src: "/images/highlights/k1c.webp",
        alt: "The Creality K1C with its door open and a printed teapot sitting on top.",
        fit: "contain",
      },
      {
        src: "/images/highlights/k1c-teapot.webp",
        alt: "A black teapot printed on the K1C.",
      },
      {
        src: "/images/highlights/k1c-teapot-open.webp",
        alt: "Contains a bunch of fortunes. You could pour out some knowledge and good luck when needed.",
      },
    ],
  },
  {
    title: "Access Point installation",
    context: "Personal project",
    summary: "Installed and configured a Ubiquity wireless access point for home use.",
    specs: [
      { label: "Type", value: "Wireless Access Point" },
      { label: "Coverage", value: "Up to 100 feet indoors" },
      { label: "Top speed", value: "600 mm/s" },
    ],
    points: [
      "Installed and configured a wireless access point for home use.",
      "Optimized the network coverage and performance.",
    ],
    tags: ["Networking", "Wireless", "Home Automation"],
    images: [
      {
        src: "/images/highlights/access-point.webp",
        alt: "The wireless access point installed in the living room.",
        fit: "contain",
      },
    ],
  },
];
