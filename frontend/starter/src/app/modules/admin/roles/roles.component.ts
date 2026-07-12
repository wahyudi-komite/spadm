import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { environment } from 'environments/environment';

@Component({
  selector: 'admin-roles',
  templateUrl: './roles.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatTooltipModule, RouterLink],
})
export class AdminRolesComponent implements OnInit {
  roles: any[] = [];
  displayedColumns = ['name', 'description', 'permissionsCount', 'isSystem', 'actions'];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.http.get(`${environment.apiUrl}/roles`).subscribe((res: any) => {
      this.roles = res;
    });
  }

  deleteRole(id: number) {
    if (confirm('Hapus role ini?')) {
      this.http.delete(`${environment.apiUrl}/roles/${id}`).subscribe(() => this.loadRoles());
    }
  }
}
