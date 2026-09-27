export interface HobbySummary {
  visible: string[];
  remaining: number;
}

export function summarizeHobbies(hobbies: readonly string[], max = 2): HobbySummary {
  return { visible: hobbies.slice(0, max), remaining: Math.max(0, hobbies.length - max) };
}
