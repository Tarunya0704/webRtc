export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export type MeetingType = "instant" | "scheduled";
export type MeetingStatus = "scheduled" | "active" | "ended";

export interface Meeting {
  id: number;
  code: string;
  title: string;
  description: string | null;
  meeting_type: MeetingType;
  status: MeetingStatus;
  host_id: number;
  host_name: string | null;
  scheduled_at: string | null;
  duration_minutes: number | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  invite_link: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export type ParticipantRole = "host" | "participant";

export interface Participant {
  id: number;
  display_name: string;
  role: ParticipantRole;
  is_muted: boolean;
}

export interface JoinMeetingResponse {
  meeting: Meeting;
  participant: Participant;
}
