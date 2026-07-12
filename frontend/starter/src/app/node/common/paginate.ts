export interface Paginate {
  data: any[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    last_page: number;
  };
}
