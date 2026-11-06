export type RequestType = 'Equipment' | 'Software' | 'Access';
export type RequestStatus = 'Submitted' | 'Approved' | 'Rejected' | 'Cancelled';
export type Priority = 'Low' | 'Normal' | 'High' | 'Urgent';
export type Audience = 'Everyone' | 'Admins' | 'Standard users';

export interface RequestSummary {
  number: string;
  type: RequestType;
  title: string;
  requester_username: string;
  requester_name: string;
  status: RequestStatus;
  priority: Priority;
  needed_by: string | null;
  justification: string;
  details: Record<string, string | number | boolean>;
  created_at: string;
  updated_at: string;
  decided_by: string | null;
  decided_at: string | null;
  decision_note: string;
}

export interface RequestEvent {
  at: string;
  username: string;
  name: string;
  kind: string;
  text: string;
}

export interface RequestDetail extends RequestSummary {
  events: RequestEvent[];
  can_cancel: boolean;
  can_decide: boolean;
  decide_blocked_reason: string | null;
}

export interface Announcement {
  id: number;
  title: string;
  body: string;
  audience: Audience;
  pinned: boolean;
  publish_at: string;
  author_name: string;
  scheduled: boolean;
}

export interface Person {
  username: string;
  name: string;
  email: string;
  role: string;
  title: string;
  department: string;
  location: string;
  phone: string;
}

export interface UserSettings {
  email_on_decision: boolean;
  email_on_comment: boolean;
  weekly_summary: boolean;
  default_priority: Priority;
  page_size: number;
}

export interface Home {
  open_count: number;
  approvals_waiting: number | null;
  recent: RequestSummary[];
  announcements: Announcement[];
}

export interface Count {
  label: string;
  count: number;
}

export interface Reports {
  total: number;
  by_status: Count[];
  by_type: Count[];
  by_priority: Count[];
  average_decision_hours: number | null;
  oldest_waiting: RequestSummary | null;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}
