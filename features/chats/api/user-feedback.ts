import { UserFeedbackType } from '@/api/chat-sessions';
import api from '@/lib/api-client';


export interface UserFeedbackPayload {
  chat_id: string;
  feedback_type: UserFeedbackType;
  feedback_text?: string;
  session?: string;
}

export async function sendUserFeedback(payload: UserFeedbackPayload) {
  return api.post('/reggie/api/v1/user-feedback/', payload);
}
