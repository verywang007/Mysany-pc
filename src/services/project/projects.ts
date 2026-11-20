import { readJSON, writeJSON, STORAGE_KEYS } from '@/utils/storage';
export interface Project {
  id: string;
  name: string;
  code: string;
  organization: string;
  manager: string;
  start: string;
  plannedEnd: string;
  actualEnd?: string;
  description: string;
  region: string[];
  address: string;
  longitude: number;
  latitude: number;
  created: string;
}
export const projectStatus = (p: Project) => (p.actualEnd ? '已完成' : '进行中');
export function listProjects(): Project[] {
  return readJSON(STORAGE_KEYS.projects, []);
}
export function saveProjects(projects: Project[]) {
  writeJSON(STORAGE_KEYS.projects, projects);
}
