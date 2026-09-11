export type LearningLevel = 'starter' | 'basic' | 'intermediate' | 'advanced';

export type LearningCycleStep = 'listen' | 'understand' | 'speak' | 'feedback' | 'repeat';

export interface LearningSession {
  id: string;
  level: LearningLevel;
  steps: LearningCycleStep[];
  targetMinutes: number;
}
