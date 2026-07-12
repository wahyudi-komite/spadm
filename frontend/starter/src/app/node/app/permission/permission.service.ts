import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AbstractService } from '../../common/abstract.service';

@Injectable({
    providedIn: 'root',
})
export class PermissionService extends AbstractService {
    url = `${environment.apiUrl}/permissions`;
}
