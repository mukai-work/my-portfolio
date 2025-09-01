export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface User extends SignupPayload {
  id: number;
}
