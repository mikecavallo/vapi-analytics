export function auditLog(action: string, userId: string | undefined, details: Record<string, any> = {}) {
  console.log(JSON.stringify({ type: 'AUDIT', timestamp: new Date().toISOString(), action, userId, ...details }));
}

export const MAX_PROMPT_LENGTH = 5000;
export const MAX_ANALYSIS_CALLS_FLOW = 50;
export const MAX_ERROR_BODY_LOG_LENGTH = 500;
