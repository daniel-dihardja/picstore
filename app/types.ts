export interface User {
  email: string;
}

export interface Usage {
  serviceName: string;
  requestStartTime: number;
  requestEndTime: number;
  totalTime: number;
}

export interface UserUsage {
  userId: string;
  history: Usage[];
}
