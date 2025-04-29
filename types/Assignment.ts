export type Assignment = {
    id: string;
    course_id: string;
    title: string;
    maxScore: number;
    weight: number;
    due_date?: string;
    created_at: string;
  };