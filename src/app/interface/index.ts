// Fix TicketStatus - should be a const object or enum
export const TicketStatus = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  REVIEW: 'REVIEW',
  DONE: 'DONE',
} as const;

export type TicketStatus = keyof typeof TicketStatus;
export type Priority = 'High' | 'Medium' | 'Low';
export type FormType = keyof FormData;
export interface FormData {
  taskId: string;
  ticketId: number | null;
  title: string;
  description: string;
  priority: number;
  type: string;
  status: TicketStatus;
  assignToId: string;
  reportedById: string;
}
export interface Ticket {
  taskId: string;
  ticketId: string;
  title: string;
  description: string;
  priority: Priority | string;

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

interface FieldChange {
  fromVal: string;
  toVal: string;
}

interface UpdateInfo {
  summary: string;
  changes: Partial<Record<ChangeKey, FieldChange>>;
}

export interface Updates {
  title?: string;
  status?: string;
  description?: string;
  userId: string;
  changeType: string;
  info: UpdateInfo;
}

export type ChangeKey =
  | 'STATUS'
  | 'PRIORITY'
  | 'TYPE'
  | 'ASSIGNEE'
  | 'TITLE'
  | 'DESCRIPTION'
  | 'CREATION'
  | 'DELETION';

export type PromptGenerator = (script: string, dynamicPayload: string) => string;
