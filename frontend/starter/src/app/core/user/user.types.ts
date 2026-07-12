export interface User {
    id: string;
    name: string;
    email: string;
    npk?: string;
    avatar?: string;
    status?: string;
    role?: {
        id: string;
        name: string;
    };
    roles?: string[];
    plant?: string;
    workUnit?: string;
    distributionArea?: string;
}
