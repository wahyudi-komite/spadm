import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { environment } from 'environments/environment';
import { DialogFeedbackService } from 'app/shared/dialog-feedback/dialog-feedback.service';

@Component({
  selector: 'admin-member-import-dialog',
  template: `
    <h2 mat-dialog-title>Review Import Anggota</h2>
    <mat-dialog-content class="mat-typography py-4 max-h-[70vh]">
      <div class="flex gap-4 mb-4 text-sm">
        <div class="flex items-center gap-1"><span class="font-semibold">Total:</span> {{ data.total }}</div>
        <div class="flex items-center gap-1 text-green-700"><span class="font-semibold">Valid:</span> {{ data.valid }}</div>
        <div class="flex items-center gap-1 text-red-700"><span class="font-semibold">Invalid:</span> {{ data.invalid }}</div>
      </div>

      <table mat-table [dataSource]="data.rows" class="w-full">
        <ng-container matColumnDef="rowNumber">
          <th mat-header-cell *matHeaderCellDef>#</th>
          <td mat-cell *matCellDef="let r">{{ r.rowNumber }}</td>
        </ng-container>

        <ng-container matColumnDef="npk">
          <th mat-header-cell *matHeaderCellDef>NPK</th>
          <td mat-cell *matCellDef="let r">{{ r.npk }}</td>
        </ng-container>

        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Nama</th>
          <td mat-cell *matCellDef="let r">{{ r.normalizedData?.name }}</td>
        </ng-container>

        <ng-container matColumnDef="action">
          <th mat-header-cell *matHeaderCellDef>Aksi</th>
          <td mat-cell *matCellDef="let r">
            <span class="px-2 py-0.5 text-xs font-semibold rounded-full"
              [class.bg-green-100]="r.action === 'CREATE'"
              [class.text-green-800]="r.action === 'CREATE'"
              [class.bg-blue-100]="r.action === 'UPDATE'"
              [class.text-blue-800]="r.action === 'UPDATE'"
              [class.bg-red-100]="r.action === 'INVALID'"
              [class.text-red-800]="r.action === 'INVALID'">
              {{ r.action === 'CREATE' ? 'Buat' : r.action === 'UPDATE' ? 'Update' : 'Invalid' }}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="errors">
          <th mat-header-cell *matHeaderCellDef>Error</th>
          <td mat-cell *matCellDef="let r">
            <span *ngIf="r.errors?.length" class="text-red-600 text-xs">{{ r.errors.join('; ') }}</span>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="importDisplayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: importDisplayedColumns;"></tr>
      </table>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Batal</button>
      <button mat-flat-button color="primary" [disabled]="data.invalid > 0" (click)="confirm()">Konfirmasi Import</button>
    </mat-dialog-actions>
  `,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatTableModule],
  standalone: true
})
export class AdminMemberImportDialogComponent {
  importDisplayedColumns = ['rowNumber', 'npk', 'name', 'action', 'errors'];

  constructor(
    public dialogRef: MatDialogRef<AdminMemberImportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { importId: number; total: number; valid: number; invalid: number; rows: any[] },
  ) {}

  confirm() {
    this.dialogRef.close({ confirmed: true, importId: this.data.importId });
  }
}

@Component({
  selector: 'admin-members',
  templateUrl: './members.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule, MatTableModule, MatSortModule, MatButtonModule, MatIconModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatTooltipModule, MatProgressSpinnerModule, RouterLink],
})
export class AdminMembersComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  members = new MatTableDataSource<any>([]);
  displayedColumns = ['npk', 'name', 'plant', 'workUnit', 'status', 'phone', 'resetPassword', 'actions'];
  search = '';
  statusFilter = '';
  plantFilter = '';
  plants: string[] = [];
  page = 1;
  limit = 20;
  total = 0;
  totalPages = 0;
  loading = false;
  importing = false;
  resettingMemberId: number | null = null;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private feedback: DialogFeedbackService,
  ) {}

  ngOnInit() {
    this.loadMembers();
  }

  ngAfterViewInit() {
    this.members.sort = this.sort;
  }

  loadMembers() {
    this.loading = true;
    const params: any = { page: this.page, limit: this.limit };
    if (this.search) params.search = this.search;
    if (this.statusFilter) params.status = this.statusFilter;
    if (this.plantFilter) params.plant = this.plantFilter;

    this.http.get(`${environment.apiUrl}/members`, { params }).subscribe((res: any) => {
      this.members.data = res.data;
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

  downloadTemplate() {
    this.http.get(`${environment.apiUrl}/members/import/template`, { responseType: 'blob' }).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'template-import-anggota.xlsx';
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
  }

  exportToExcel() {
    this.http.get(`${environment.apiUrl}/members/export`, { responseType: 'blob' }).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'data-anggota.xlsx';
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
  }

  importMembers() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      this.importing = true;
      const formData = new FormData();
      formData.append('file', file);

      this.http.post(`${environment.apiUrl}/members/import/preview`, formData).subscribe({
        next: (res: any) => {
          this.importing = false;
          const dialogRef = this.dialog.open(AdminMemberImportDialogComponent, {
            width: '800px',
            data: { importId: res.importId, total: res.total, valid: res.valid, invalid: res.invalid, rows: res.rows },
          });
          dialogRef.afterClosed().subscribe(result => {
            if (result?.confirmed) {
              this.http.post(`${environment.apiUrl}/members/import`, { importId: result.importId }).subscribe({
                next: () => {
                  this.loadMembers();
                },
              });
            }
          });
        },
        error: (err) => {
          this.importing = false;
        },
      });
    };
    input.click();
  }

  resetPassword(member: any) {
    if (!member.user?.id || this.resettingMemberId !== null) return;

    this.feedback.confirm({
      title: 'Reset password',
      message: `Reset password ${member.name} (${member.npk}) ke password awal? Pengguna wajib mengganti password saat login berikutnya.`,
      confirmText: 'Reset Password',
      tone: 'warn',
    }).subscribe((confirmed) => {
      if (!confirmed) return;

      this.resettingMemberId = member.id;
      this.http.post(`${environment.apiUrl}/members/${member.id}/reset-password`, {}).subscribe({
        next: () => {
          this.resettingMemberId = null;
          this.feedback.success(`Password ${member.name} berhasil direset.`);
        },
        error: (error) => {
          this.resettingMemberId = null;
          this.feedback.error(error.error?.message || 'Password anggota gagal direset.');
        },
      });
    });
  }

  private extractPlants() {
    const unique = new Set<string>();
    this.members.data.forEach(m => { if (m.plant) unique.add(m.plant); });
    this.plants = Array.from(unique).sort();
  }
}
