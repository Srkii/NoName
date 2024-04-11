import { ProjectRole } from "./ProjectMember";

export interface SelectedUser {
    id:number,
    name: string,
    email: string,
    projectRole: ProjectRole,
    profilePicUrl: string
}