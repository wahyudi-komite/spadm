import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { environment } from 'environments/environment';
import { DialogFeedbackService } from 'app/shared/dialog-feedback/dialog-feedback.service';

@Component({
  selector: 'admin-user-roles',
  templateUrl: './user-roles.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule, MatTableModule],
})
export class AdminUserRolesComponent implements OnInit {
  userId: number;
  userRoles: any[] = [];
  allRoles: any[] = [];
  selectedRoleId: number;
  history: any[] = [];
  displayedColumns = ['role', 'assignedAt', 'revokedAt', 'actions'];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private feedback: DialogFeedbackService,
    public location: Location,
  ) {}

  ngOnInit() {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadRoles();
    this.loadUserRoles();
  }

  loadRoles() {
    this.http.get(`${environment.apiUrl}/roles`).subscribe((res: any) => {
      this.allRoles = res;
    });
  }

  loadUserRoles() {
    this.http.get(`${environment.apiUrl}/roles/users/${this.userId}/roles`).subscribe((res: any) => {
      this.userRoles = res;
    });
    this.http.get(`${environment.apiUrl}/roles/users/${this.userId}/roles/history`).subscribe((res: any) => {
      this.history = res;
    });
  }

  assignRole() {
    if (!this.selectedRoleId) return;
    this.http.post(`${environment.apiUrl}/roles/users/${this.userId}/roles`, { roleId: this.selectedRoleId })
      .subscribe(() => {
        this.selectedRoleId = null;
        this.loadUserRoles();
      });
  }

  revokeRole(roleId: number) {
    this.feedback.confirm({
      title: 'Revoke role',
      message: 'Revoke role ini?',
      confirmText: 'Revoke',
      tone: 'warn',
    }).subscribe((confirmed) => {
      if (!confirmed) return;

      this.http.delete(`${environment.apiUrl}/roles/users/${this.userId}/roles/${roleId}`)
        .subscribe(() => this.loadUserRoles());
    });
  }
}
