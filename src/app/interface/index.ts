// Fix TicketStatus - should be a const object or enum
export const TicketStatus = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  REVIEW: 'REVIEW',
  DONE: 'DONE',
} as const;

export type TicketStatus = keyof typeof TicketStatus;
export type Priority = 'High' | 'Medium' | 'Low';
export type FormType = keyof  FormData;
export interface FormData {
  title: string;
  description: string;
  priority: number;
  type: string;
  status: TicketStatus;
  assignToId: string;
}
export interface Ticket {
  taskId: string;
  ticketId: string;
  title: string;
  description: string;
  priority: Priority;

  aiSummary: string[];
  type: string;
  status: TicketStatus;

  allowedMembers: string[];
  createdAt: string;
  updatedAt: string;

  assignedUser?: {
    id: string;
    avatar: string;
    username: string;
  };

  reportedUser: {
    id: string;
    avatar: string;
    username: string;
  };
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  email: string;
  role: string;
}

export interface Comment {
  id: string;
  content: string;
  edited: boolean;
  ticketId: string;

  createdAt: string;
  updatedAt: string;

  user: {
    id: string;
    avatar: string;
    username: string;
  };
}

export type PromptGenerator = (script: string, dynamicPayload: string) => string;
