import { PROJECTS } from '@/mock/lift-planning/projects';
import { delay } from '@/mock/utils';

export interface LiftProject {
  id: string;
  name: string;
  /** YYYY-MM-DD HH:mm:ss */
  time: string;
}

/** 吊装规划 › 最近项目 */
export async function listRecentProjects(): Promise<LiftProject[]> {
  await delay(0);
  return PROJECTS;
}
