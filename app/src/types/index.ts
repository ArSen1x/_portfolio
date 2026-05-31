export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  techStack: string[];
  link: string;
}

export interface Skill {
  name: string;
  color: string;
}

export interface Stat {
  value: string;
  numericValue: number;
  label: string;
}

export interface SocialLink {
  name: string;
  icon: string;
  url: string;
}
