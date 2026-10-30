import type { Highlight } from "./types";

/* "Cloud & servers": /skills/cloud-and-servers */
export const cloudAndServers: Highlight[] = [
  {
    title: "Raspberry Pi servers",
    context: "Personal project",
    summary: "Two Raspberry Pis, each configured as a server. One was for Minecraft, the other for local hosting web apps.",
    /* Haventry gets a highlight of its own later; mention it here as
       a link once it has one. */
    points: [
      "Configured one Raspberry Pi as a Minecraft server (clear case). Currently out of commission.",
      "Configured the other to host Haventry, a local inventory managementweb application.",
    ],
    tags: ["Raspberry Pi", "Self-hosting", "Minecraft"],
    specs: [
      { label: "Haventry server", value: "Raspberry Pi 4 Model B, 8 GB" },
      { label: "Haventry's stack", value: "Node.js, TypeScript, Vite, nginx" },
      { label: "Minecraft server", value: "Raspberry Pi 2 Model B" },
    ],
    images: [
      {
        src: "/images/highlights/raspberry-pi-4.webp",
        alt: "The Raspberry Pi 4 that hosts Haventry, had to remove the led rgb fans due to friction making too much noise against the heatsink.",
      },
      {
        src: "/images/highlights/raspberry-pi-4-btop.webp",
        alt: "btop results for Haventry Pi (resolution is a little low, but you can see the CPU and RAM usage).",
        fit: "contain",
      },
      {
        src: "/images/highlights/raspberry-pi-2.webp",
        alt: "The Raspberry Pi 2 Model B that ran the Minecraft server.",
      },
    ],
  },
];
