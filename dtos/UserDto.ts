export enum UserRole {
    ADMIN = 'ADMIN',
    COLLABORATOR = 'COLLABORATOR',
    MEMBER = 'MEMBER', // Backend retorna MEMBER, mapeamos para COLLABORATOR
}

export interface UserProfileDto {
    userId: number;
    role: UserRole;
    accountType: string;
    friendlyName: string;
}
