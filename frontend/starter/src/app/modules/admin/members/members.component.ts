import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { environment } from 'environments/environment';

@Component({
  selector: 'admin-members',
  templateUrl: './members.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatTooltipModule, RouterLink],
})
export class AdminMembersComponent implements OnInit {
  members: any[] = [];
  displayedColumns = ['npk', 'name', 'plant', 'workUnit', 'status', 'phone', 'actions'];
  search = '';
  statusFilter = '';
  plantFilter = '';
  plants: string[] = [];
  page = 1;
  limit = 20;
  total = 0;
  totalPages = 0;
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    this.loading = true;
    const params: any = { page: this.page, limit: this.limit };
    if (this.search) params.search = this.search;
    if (this.statusFilter) params.status = this.statusFilter;
    if (this.plantFilter) params.plant = this.plantFilter;

    this.http.get(`${environment.apiUrl}/members`, { params }).subscribe((res: any) => {
      this.members = res.data;
      this.total = res.meta.total;
      this.totalPages = res.meta.totalPages;
      this.loading = false;
      this.extractPlants();
    });
  }

  searchMembers() {
    this.page = 1;
    this.loadMembers();
  }

  prevPage() {
    if (this.page > 1) { this.page--; this.loadMembers(); }
  }

  nextPage() {
    if (this.page < this.totalPages) { this.page++; this.loadMembers(); }
  }

  private extractPlants() {
    const unique = new Set<string>();
    this.members.forEach(m => { if (m.plant) unique.add(m.plant); });
    this.plants = Array.from(unique).sort();
  }
}
