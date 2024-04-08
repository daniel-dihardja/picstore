export interface Usage {
  userId: string;
  serviceName: string;
  requestStartTime: number;
  requestEndTime: number;
  totalTime: number;
}

export interface UserBalance {
  userId: string;
  prevTotalAmount: number;
  newAmount: number;
  totalAmount: number;
  ref: string;
  createdAt: number;
}

export interface User {
  id: string;
  email: string;
  picture: string;
}
