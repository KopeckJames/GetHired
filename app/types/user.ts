export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  createdAt: Date;
}

export interface SerializedUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  createdAt: string;
}

export interface CreateUserData {
  email: string;
  name: string;
  picture?: string;
}

export function deserializeUser(user: SerializedUser): User {
  return {
    ...user,
    createdAt: new Date(user.createdAt),
  };
}

export function serializeUser(user: User): SerializedUser {
  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
  };
}
