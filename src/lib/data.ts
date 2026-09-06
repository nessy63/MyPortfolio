/* Central site content — swap these values to make the portfolio yours. */

export const site = {
  name: "Nessy Poudel",
  shortName: "Nessy",
  nickname: "Nessy",
  role: "Fullstack Developer",
  tagline: "Web Engineer | TypeScript & Go | DX Tooling | Jakarta, ID",
  location: "Jakarta, ID",
  email: "hello@nessy.dev",
  cvUrl: "/cv.pdf",
};

export type Social = { label: string; href: string; icon: SocialIcon };
export type SocialIcon = "github" | "linkedin" | "twitter" | "instagram" | "mail";

export const socials: Social[] = [
  { label: "GitHub", href: "https://github.com", icon: "github" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/nessy-poudel", icon: "linkedin" },
  { label: "X / Twitter", href: "https://x.com/nessy_poudel", icon: "twitter" },
  { label: "Instagram", href: "https://www.instagram.com/nessy_poudel", icon: "instagram" },
  { label: "Email", href: "mailto:hello@nessy.dev", icon: "mail" },
];

export const stats = [
  { value: 19, label: "Age", emphasized: false },
  { value: 0, label: "Years of experience", emphasized: true },
  { value: 0, label: "Projects worked on", emphasized: false },
  { value: 0, label: "Projects deployed", emphasized: false },
];

export type Education = {
  title: string;
  period: string;
  score: string;
  note: string;
};

export const education: Education[] = [
  {
    title: "High school",
    period: "Sep 1, 2023 - Jun 15, 2025",
    score: "98.5",
    note: "Jaya Multiple Campus — Honorary graduate",
  },
  {
    title: "Bachelor in Information Technology",
    period: "Sep 1, 2025 - present",
    score: "3.7",
    note: "Lincoln International College — Best Academic Graduate Award",
  },
];

export const bio = {
  professional:
    "I'm a fullstack developer who treats product engineering like a craft: typed end-to-end, measured in production, and obsessed with the small interactions that make software feel alive. Lately I've been building DX tooling and realtime apps with TypeScript, Go, and a lot of Framer Motion.",
  personal:
    "Outside the editor I'm a playlist curator, a street photographer, and a serial hobbyist. I keep a dev journal of half-finished ideas, learn languages badly but enthusiastically, and believe a good README is a love letter.",
};

export const skills = [
  "TypeScript", "React", "Next.js", "Node.js", "Go", "PostgreSQL",
  "Redis", "Tailwind CSS", "Framer Motion", "Docker", "GraphQL",
  "CI/CD", "Playwright", "AWS",
];

export type Project = {
  title: string;
  description: string;
  stack: string[];
  href: string;
  year: string;
};

export const projects: Project[] = [
  {
    title: "Relay — realtime collab canvas",
    description: "Multiplayer whiteboard with CRDT sync, presence cursors, and offline replay.",
    stack: ["Next.js", "Go", "WebSocket", "Postgres"],
    href: "https://github.com",
    year: "2025",
  },
  {
    title: "Shipmate CLI",
    description: "DX tool that scaffolds releases, changelogs, and preview envs from conventional commits.",
    stack: ["Go", "Cobra", "GitHub API"],
    href: "https://github.com",
    year: "2024",
  },
  {
    title: "Tunedex",
    description: "A personal music journal that turns scrobbles into listening stats and year-in-review pages.",
    stack: ["Next.js", "Spotify API", "Redis"],
    href: "https://github.com",
    year: "2024",
  },
];

export type Hobby = {
  title: string;
  copy: string;
  media: "photo" | "video" | "globe";
  badge?: string;
};

export const hobbies: Hobby[] = [
  {
    title: "Learning languages",
    copy: "Working through Japanese and Spanish, one flashcard deck at a time. The globe lights up wherever I've been.",
    media: "globe",
    badge: "+1,100 words learned",
  },
  {
    title: "Music & synths",
    copy: "Weekend bedroom producer. Lo-fi loops, mediocre guitar, great headphones.",
    media: "video",
  },
  {
    title: "Street photography",
    copy: "Chasing golden hour with a 35mm lens. Cities are the best moodboards.",
    media: "photo",
  },
  {
    title: "Travel & food logs",
    copy: "I keep a ranked list of every bowl of noodles I've ever had. It's longer than my commit history.",
    media: "photo",
  },
];

export type LifeCard = { kicker: string; title: string; image: string };

export const lifeCards: LifeCard[] = [
  { kicker: "Books", title: "Sci-fi shelf & dev journals", image: "/life/books.jpg" },
  { kicker: "Music", title: "Playlists for every mood", image: "/life/music.jpg" },
  { kicker: "Places", title: "Cities & mountain air", image: "/life/places.jpg" },
  { kicker: "Code", title: "Side projects at 2am", image: "/life/code.jpg" },
];

/* ── Music player tracks (files live in /public/music) ───────── */

export type Track = { title: string; artist: string; src: string; art: string };

export const tracks: Track[] = [
  {
    title: "Aruarian Dance",
    artist: "Nujabes",
    src: "/music/aruarian_dance.mp3",
    art: "/music/art_ghibli1.svg",
  },
  {
    title: "Christina",
    artist: "Joe Hisaishi",
    src: "/music/christina.mp3",
    art: "/music/art_ghibli2.svg",
  },
  {
    title: "A Town with an Ocean View",
    artist: "Joe Hisaishi",
    src: "/music/town_ocean_view.mp3",
    art: "/music/art_ghibli3.svg",
  },
];

/* ── Language dropdown ───────────────────────────────────────── */

export const languages = [
  { code: "EN", label: "English" },
  { code: "ID", label: "Bahasa Indonesia" },
  { code: "JP", label: "日本語" },
];
