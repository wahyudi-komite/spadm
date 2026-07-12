import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export abstract class AbstractService {
    abstract get url(): string;

    constructor(protected http: HttpClient) {}

    private buildHttpParams(
        page?: number,
        limit?: number,
        direction?: string,
        sort?: string,
        find?: string,
        filterParams?: any
    ): HttpParams {
        let params = new HttpParams();
        if (page) params = params.append('page', String(page));
        if (limit) params = params.append('limit', String(limit));
        if (sort) params = params.append('sort', String(sort));
        if (direction) params = params.append('direction', String(direction));
        if (find) params = params.append('keyword', String(find));

        if (filterParams) {
            Object.entries(filterParams).forEach(([key, value]) => {
                if (value != null) {
                    params = params.append(key, String(value));
                }
            });
        }

        return params;
    }

    all(
        page?: number,
        limit?: number,
        direction?: string,
        sort?: string,
        find?: string,
        filterParams?: any
    ): Observable<any> {
        const params = this.buildHttpParams(
            page,
            limit,
            direction,
            sort,
            find,
            filterParams
        );
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

    findOne(data: any): Observable<any> {
        return this.http.post(`${this.url}/findName`, data);
    }

    find(data: any): Observable<any> {
        return this.http.post(`${this.url}/findIn`, data);
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

        field ? (params = params.append('field', String(field))) : params;
        keyword ? (params = params.append('keyword', keyword)) : params;

        return this.http.get(`${this.url}/all`, { params });
    }

    getAllx() // direction: string,
    // sort: string,
    // field?: string,
    // keyword?: string | number
    : Observable<any> {
        let params = new HttpParams();
        // params = params.append('sort', String(sort));
        // params = params.append('direction', String(direction));

        // field ? (params = params.append('field', String(field))) : params;
        // keyword ? (params = params.append('keyword', keyword)) : params;

        return this.http.get(`${this.url}`, { params });
    }

    exportExcel(
        page?: number,
        limit?: number,
        direction?: string,
        sort?: string,
        find?: string,
        filterParams?: any
    ): void {
        const params = this.buildHttpParams(
            page,
            limit,
            direction,
            sort,
            find,
            filterParams
        );

        return;
    }

    updateScan(data: any): Observable<any> {
        return this.http.patch(`${this.url}/updateScan`, data);
    }

    updateScanVendor(data: any): Observable<any> {
        return this.http.patch(`${this.url}/updateScanVendor`, data);
    }

    updateScanPlant(data: any): Observable<any> {
        return this.http.patch(`${this.url}/updateScanPlant`, data);
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
