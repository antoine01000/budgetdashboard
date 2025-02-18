export interface Notepad {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNotepadInput {
  title: string;
  content: string;
}
