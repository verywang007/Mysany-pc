import type { LiftProject } from '@/services/lift-planning/projects';

/** 最近项目，取自原型 lift-planning.js 的 state.projects（写死 1 条） */
export const PROJECTS: LiftProject[] = [{ id: 'p1', name: '测试', time: '2026-10-09 14:00:00' }];
