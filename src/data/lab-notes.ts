import type { LabPillar } from "./lab-explorations";

export type LabNote = {
  slug: string;
  date: string;
  when: string;
  pillar: LabPillar;
  title: string;
  excerpt: string;
  readTime: string;
  href: string;
};
