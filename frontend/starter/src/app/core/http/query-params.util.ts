import { HttpParams } from '@angular/common/http';

export function buildHttpParams(
    page?: number,
    limit?: number,
    direction?: string,
    sort?: string,
    find?: string,
    filterParams?: Record<string, unknown>
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
