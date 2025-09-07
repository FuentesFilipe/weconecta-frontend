export enum UserRole {
    ADMIN = 'ADMIN',
    COLLABORATOR = 'COLLABORATOR',
}

export interface UserProfileDto {
    userId: number;
    role: UserRole;
    accountType: string;
    friendlyName: string;
}
