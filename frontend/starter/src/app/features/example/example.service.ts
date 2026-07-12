import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../core/http/api-client.service';
import { Paginate } from '../../shared/types/paginate.model';

@Injectable({
    providedIn: 'root',
})
export class ExampleService extends ApiClient {
    override url = '/example-items';

    getList(query?: Record<string, unknown>): Observable<HttpResponse<Paginate>> {
        return this.http.get<Paginate>(this.url, {
            params: query as any,
            observe: 'response',
        });
    }

    getById(id: string): Observable<HttpResponse<any>> {
        return this.http.get<any>(`${this.url}/${id}`, { observe: 'response' });
    }

    create(data: any): Observable<HttpResponse<any>> {
        return this.http.post<any>(this.url, data, { observe: 'response' });
    }

    updateItem(id: string, data: any): Observable<HttpResponse<any>> {
        return this.http.put<any>(`${this.url}/${id}`, data, { observe: 'response' });
    }

    remove(id: string): Observable<HttpResponse<void>> {
        return this.http.delete<void>(`${this.url}/${id}`, { observe: 'response' });
    }
}
