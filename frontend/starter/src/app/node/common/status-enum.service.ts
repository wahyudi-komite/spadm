import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class StatusEnumService {
    readonly selectStatus = [
        { id: 0, value: 'Active' },
        { id: 1, value: 'Disable' },
        { id: 2, value: 'Delete' },
    ];

    getStatus(status: number): { text: string; color: string } {
        switch (status) {
            case 0:
                return { text: 'Active', color: 'bg-green-600' };
            case 1:
                return { text: 'DISABLE', color: 'bg-yellow-500' };
            case 2:
                return { text: 'DELETE', color: 'bg-red-500' };
            default:
                return { text: 'Unknown', color: 'bg-gray-500' };
        }
    }
    getselectStatus() {
        return this.selectStatus;
    }
}
