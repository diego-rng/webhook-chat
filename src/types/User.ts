export default interface User {
  userId: string;
  username: string;
  name: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  email: string;
}