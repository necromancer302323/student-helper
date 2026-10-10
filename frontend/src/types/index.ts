
export interface Task {
  id: number;
  title: string;
  description: string | null;
  subject: string;
  due_date: string;
  due_time: string | null;
  priority: "Low" | "Medium" | "High";
  completed: number;
}

export interface StudyEvent {
  id: number;
  title: string;
  subject: string;
  category: "Exam" | "Test" | "Assignment" | "Other";
  event_date: string;
  event_time: string | null;
  description: string | null;
}

export interface StudySession {
  id: number;
  subject: string;
  study_date: string;
  duration_minutes: number;
  description: string | null;
  source: string | null;
}

export interface DashboardData {
  todayTasks: {
    total: number;
    completed: number;
    pending: number;
  };
  todayStudyMinutes: number;
  totalStudyMinutes: number;
  overallStudyHours: number;
  todayTasksPreview: Task[];
  upcomingEvents: StudyEvent[];
  weeklyStudyHours: { date: string; hours: number }[];
}
