import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { buildHttpParams } from './query-params.util';

@Injectable({
    providedIn: 'root',
})
export abstract class ApiClient {
    abstract get url(): string;

    constructor(protected http: HttpClient) {}

    all(
        page?: number,
        limit?: number,
        direction?: string,
        sort?: string,
        find?: string,
        filterParams?: Record<string, unknown>
    ): Observable<any> {
        const params = buildHttpParams(page, limit, direction, sort, find, filterParams);
        return this.http.get(this.url, { params });
    }

    serverside(params: any): Observable<any> {
        let paramsData = new HttpParams()
            .set('first', params.first)
            .set('rows', params.rows)
            .set('sortField', params.sortField)
            .set('sortOrder', params.sortOrder)
            .set('globalFilter', params.globalFilter || '')
            .set('filters', JSON.stringify(params.filters))
            .set('exportData', params.exportData || false);

        return this.http.get(this.url, { params: paramsData });
    }

    create(data: any): Observable<any> {
        return this.http.post(this.url, data);
    }

    get(id: number): Observable<any> {
        return this.http.get(`${this.url}/${id}`);
    }

    update(id: number, data: any): Observable<any> {
        return this.http.put(`${this.url}/${id}`, data);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.url}/${id}`);
    }

    findOne(query: any): Observable<any> {
        return this.http.post(`${this.url}/findName`, query);
    }

    find(query: any): Observable<any> {
        return this.http.post(`${this.url}/findIn`, query);
    }

    getAll(
        direction: string,
        sort: string,
        field?: string,
        keyword?: string | number
    ): Observable<any> {
        let params = new HttpParams();
        params = params.append('sort', String(sort));
        params = params.append('direction', String(direction));

        if (field) params = params.append('field', String(field));
        if (keyword) params = params.append('keyword', keyword);

        return this.http.get(`${this.url}/all`, { params });
    }

    getAllx(): Observable<any> {
        return this.http.get(`${this.url}`);
    }

    getCount(
        plant: string,
        where?: Record<string, any>,
        whereNot?: Record<string, any>
    ): Observable<{ plant: string; count: number }> {
        return this.http.get<{ plant: string; count: number }>(
            `${this.url}/count`,
            {
                params: {
                    plant,
                    ...(where ? { where: JSON.stringify(where) } : {}),
                    ...(whereNot ? { whereNot: JSON.stringify(whereNot) } : {}),
                },
            }
        );
    }
}
