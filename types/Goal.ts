export type Goal = {
    id: string;
    title: string;
    description?: string;
    status: "not started" | "in progress" | "completed";
    created_at: string;
  };