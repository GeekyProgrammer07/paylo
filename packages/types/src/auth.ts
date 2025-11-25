export interface LoginCredentials {
  name?: string;
  phone?: string;
  email?: string;
  password: string;
}

export interface ModifiedUser {
  id: string;
  dbId: number;
  number: string;
}

export interface DBUser {
  id: string;
  dbId: number;
  number: string;
}