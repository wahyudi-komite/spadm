import { Role } from '../../node/app/role/role';

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    status?: string;
    role: Role;
    plant: string;
}
