import type { Team } from './draft';

export const TEAM_STYLES = {
  blue: {
    plate: 'bg-[#2669D0]',
    ban: 'bg-[#112F5E]',
    color: '#2669D0',
  },
  red: {
    plate: 'bg-[#D44241]',
    ban: 'bg-[#5F1E1D]',
    color: '#D44241',
  },
} satisfies Record<Team, { plate: string; ban: string; color: string }>;
