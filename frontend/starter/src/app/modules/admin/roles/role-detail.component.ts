import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'environments/environment';

@Component({
  selector: 'admin-role-detail',
  templateUrl: './role-detail.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule, MatButtonModule, MatCheckboxModule, MatIconModule, MatFormFieldModule, MatInputModule],
})
export class AdminRoleDetailComponent implements OnInit {
  role: any = { name: '', description: '', permissions: [] };
  allPermissions: any = {};
  isNew = false;

  constructor(private http: HttpClient, private route: ActivatedRoute, public router: Router) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id === 'new') {
      this.isNew = true;
    } else {
      this.http.get(`${environment.apiUrl}/roles/${id}`).subscribe((res: any) => {
        this.role = res;
      });
    }
    this.http.get(`${environment.apiUrl}/permissions`).subscribe((res: any) => {
      this.allPermissions = res.grouped;
    });
  }

  getGroups(): string[] {
    return Object.keys(this.allPermissions);
  }

  hasPermission(permissionId: number): boolean {
    return this.role.permissions?.some((p: any) => p.id === permissionId);
  }

  togglePermission(permissionId: number) {
    if (this.hasPermission(permissionId)) {
      this.http.delete(`${environment.apiUrl}/roles/${this.role.id}/permissions/${permissionId}`)
        .subscribe(() => this.loadRole());
    } else {
      this.http.post(`${environment.apiUrl}/roles/${this.role.id}/permissions`, { permissionIds: [permissionId] })
        .subscribe(() => this.loadRole());
    }
  }

  save() {
    if (this.isNew) {
      this.http.post(`${environment.apiUrl}/roles`, this.role).subscribe(() => {
        this.router.navigate(['/admin/roles']);
      });
    } else {
      this.http.patch(`${environment.apiUrl}/roles/${this.role.id}`, this.role).subscribe(() => {
        this.router.navigate(['/admin/roles']);
      });
    }
  }

  private loadRole() {
    this.http.get(`${environment.apiUrl}/roles/${this.role.id}`).subscribe((res: any) => {
      this.role = res;
    });
  }
}
