export default interface User {
  userId: string;
  username: string;
  name?: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  email: string;
}