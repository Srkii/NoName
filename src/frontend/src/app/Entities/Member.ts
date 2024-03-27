export interface Member {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    token: string;
    role: UserRole;
    archived:boolean;
}
export enum UserRole {
    Admin,
    Member,
    ProjectManager
  }