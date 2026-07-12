import { inject, Injectable } from '@angular/core';
import {
    AbstractControl,
    AsyncValidatorFn,
    ValidationErrors,
} from '@angular/forms';
import { debounceTime, map, Observable, of, switchMap } from 'rxjs';
import { PermissionService } from '../app/permission/permission.service';
import { RoleService } from '../app/role/role.service';

interface BaseService {
    findOne(query: any): Observable<any>;
}

@Injectable({
    providedIn: 'root',
})
export class ExistingValidator {
    private roleService = inject(RoleService);
    private permissionService = inject(PermissionService);

    private getService(table: string): BaseService | null {
        switch (table.toLowerCase()) {
            case 'permissions':
                return this.permissionService;
            case 'role':
                return this.roleService;
            default:
                throw new Error(`Table ${table} is not supported.`);
        }
    }

    IsUnique(
        table: string,
        method: 'Add' | 'Update',
        id?: number
    ): AsyncValidatorFn {
        return (
            control: AbstractControl
        ): Observable<ValidationErrors | null> => {
            if (!control.dirty || !control.value) return of(null);

            const key = this.getName(control);
            if (!key) return of(null);

            const service = this.getService(table);
            if (!service) return of(null);

            return of(control.value).pipe(
                debounceTime(500), // Mencegah request berulang dalam waktu singkat
                switchMap((value) =>
                    service.findOne({ [key]: value }).pipe(
                        map((res) => {
                            if (!res) return null; // Jika tidak ditemukan, berarti valid

                            // Jika mode update dan ID sama dengan yang sedang diedit, validasi tetap lolos
                            if (method === 'Update' && res.id === id)
                                return null;

                            return { alreadyExists: true }; // Data sudah ada di database
                        })
                    )
                )
            );
        };
    }

    private getName(control: AbstractControl): string | null {
        if (!control.parent) return null;
        return (
            Object.keys(control.parent.controls).find(
                (key) => control.parent?.get(key) === control
            ) || null
        );
    }
}
