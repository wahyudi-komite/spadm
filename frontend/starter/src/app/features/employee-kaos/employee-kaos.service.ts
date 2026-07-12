import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AbstractService } from '../../node/common/abstract.service';

@Injectable({
    providedIn: 'root',
})
export class EmployeeKaosService extends AbstractService {
    url = `${environment.apiUrl}/employee-kaos`;
}
