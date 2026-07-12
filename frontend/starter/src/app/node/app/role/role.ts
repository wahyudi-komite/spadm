import { Permission } from '../permission/permission';

export interface Role {
    id: number;
    name: string;
    permissions?: Permission[];
}
