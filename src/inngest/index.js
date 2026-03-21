import { aiAnalysisWorkflow } from './functions/aiAnalysisWorkflow.js';
import { escalationWorkflow } from './functions/escalationWorkflow.js';
import { feedbackWorkflow } from './functions/feedbackWorkflow.js';

export const inngestFunctions = [
  aiAnalysisWorkflow,
  escalationWorkflow,
  feedbackWorkflow,
];
