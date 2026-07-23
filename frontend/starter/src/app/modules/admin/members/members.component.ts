import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
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
    <div class="flex items-center justify-between cursor-move select-none pr-6 pt-4" cdkDrag cdkDragRootElement=".cdk-overlay-pane" cdkDragHandle>
      <h2 mat-dialog-title class="!m-0 !p-0 pl-6">Review Import Anggota</h2>
      <mat-icon class="text-gray-400">drag_indicator</mat-icon>
    </div>
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
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatTableModule, MatIconModule, CdkDrag, CdkDragHandle],
  standalone: true
})
export class AdminMemberImportDialogComponent {
  importDisplayedColumns = ['rowNumber', 'npk', 'name', 'action', 'errors'];

  constructor(
    public dialogRef: MatDialogRef<AdminMemberImportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { importId: number; total: number; valid: number; invalid: number; rows: any[] },
  ) { }

  confirm() {
    this.dialogRef.close({ confirmed: true, importId: this.data.importId });
  }
}

@Component({
  selector: 'admin-member-dialog',
  template: `
    <div class="flex items-center justify-between cursor-move select-none pr-6 pt-4 pb-2" cdkDrag cdkDragRootElement=".cdk-overlay-pane" cdkDragHandle>
      <h2 mat-dialog-title class="!text-xl !font-bold !m-0 !p-0 pl-6">{{ isEdit ? 'Edit Data Anggota' : 'Tambah Anggota Baru' }}</h2>
      <mat-icon class="text-gray-400">drag_indicator</mat-icon>
    </div>
    <mat-dialog-content class="mat-typography py-4">
      <form #memberForm="ngForm" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <mat-form-field appearance="outline" floatLabel="always">
          <mat-label>NPK</mat-label>
          <input matInput [(ngModel)]="member.npk" name="npk" (blur)="checkNpk()" (input)="npkExists = false" #npk="ngModel" required [readonly]="isEdit" [class.opacity-60]="isEdit" [class.cursor-not-allowed]="isEdit" placeholder="Masukkan NPK" />
          <mat-hint *ngIf="isEdit">NPK tidak dapat diubah</mat-hint>
          <mat-error *ngIf="npkExists">NPK {{ member.npk }} sudah terdaftar</mat-error>
          <mat-error *ngIf="npk.invalid && npk.touched && !npkExists">NPK wajib diisi</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" floatLabel="always">
          <mat-label>Nama</mat-label>
          <input matInput [(ngModel)]="member.name" name="name" (blur)="formatName()" #name="ngModel" required placeholder="Masukkan Nama" />
          <mat-error *ngIf="name.invalid && name.touched">Nama wajib diisi</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" floatLabel="always">
          <mat-label>Email</mat-label>
          <input matInput [(ngModel)]="member.email" name="email" #email="ngModel" type="email" email placeholder="contoh@email.com" />
          <mat-error *ngIf="email.invalid && email.touched">Format email tidak valid</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" floatLabel="always">
          <mat-label>Telepon</mat-label>
          <input matInput [(ngModel)]="member.phone" name="phone" (blur)="formatPhone()" placeholder="6281234567890" pattern="^62\d{8,13}$" #phone="ngModel" />
          <mat-hint>Format selalu diawali 62</mat-hint>
          <mat-error *ngIf="phone.invalid && phone.touched">Nomor telepon harus diawali 62 (contoh: 6281234567890)</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" floatLabel="always">
          <mat-label>Unit Kerja</mat-label>
          <mat-select [(ngModel)]="member.workUnit" name="workUnit" placeholder="Pilih Unit Kerja">
            <mat-option *ngFor="let u of workUnits" [value]="u">{{ u }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" floatLabel="always">
          <mat-label>Jabatan Organisasi</mat-label>
          <mat-select [(ngModel)]="member.organizationalPosition" name="organizationalPosition" placeholder="Pilih Jabatan Organisasi">
            <mat-option *ngFor="let pos of positions" [value]="pos">{{ pos }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" floatLabel="always">
          <mat-label>Plant</mat-label>
          <mat-select [(ngModel)]="member.plant" name="plant" placeholder="Pilih Plant">
            <mat-option *ngFor="let p of plants" [value]="p.value">{{ p.label }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" floatLabel="always">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="member.status" name="status" #status="ngModel" required placeholder="Pilih Status">
            <mat-option value="active">Aktif</mat-option>
            <mat-option value="inactive">Nonaktif</mat-option>
          </mat-select>
          <mat-error *ngIf="status.invalid && status.touched">Status wajib dipilih</mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions class="flex justify-between items-center w-full">
      <div>
        @if (isEdit) {
          <button mat-button color="warn" type="button" [disabled]="loading" (click)="deleteMember()">
            <mat-icon>delete</mat-icon> Hapus
          </button>
        }
      </div>
      <div class="flex gap-2">
        <button mat-button mat-dialog-close [disabled]="loading">Batal</button>
        <button mat-flat-button color="primary" [disabled]="loading || !memberForm.valid || npkExists" (click)="save()">
          @if (loading) {
            <mat-spinner diameter="18" class="mr-2 inline-block"></mat-spinner>
          }
          Simpan
        </button>
      </div>
    </mat-dialog-actions>
  `,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressSpinnerModule, MatIconModule, CdkDrag, CdkDragHandle],
  standalone: true
})
export class AdminMemberDialogComponent {
  member: any;
  isEdit = false;
  loading = false;
  npkExists = false;
  @ViewChild('memberForm') memberForm!: NgForm;

  readonly workUnits = ['P1', 'P2', 'P3', 'P4', 'P5', 'PC', 'HO'];
  readonly positions = ['ANGGOTA', 'PENGURUS', 'KORLAP', 'KOMISARIS', 'SEKRETARIS', 'BENDAHARA', 'KETUA'];
  readonly plants = [
    { value: 'P1', label: 'Plant 1' },
    { value: 'P2', label: 'Plant 2' },
    { value: 'P3', label: 'Plant 3' },
    { value: 'P4', label: 'Plant 4' },
    { value: 'P5', label: 'Plant 5' },
    { value: 'PC', label: 'Part Center' },
    { value: 'HO', label: 'Head Office' },
  ];

  constructor(
    public dialogRef: MatDialogRef<AdminMemberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private feedback: DialogFeedbackService,
  ) {
    if (data) {
      this.isEdit = true;
      this.member = { ...data };
    } else {
      this.isEdit = false;
      this.member = { npk: '', name: '', email: '', phone: '', workUnit: '', organizationalPosition: '', plant: '', status: 'active' };
    }
  }

  checkNpk() {
    if (this.isEdit || !this.member?.npk?.trim()) {
      this.npkExists = false;
      return;
    }
    this.http.get(`${environment.apiUrl}/members/check-npk/${this.member.npk.trim()}`).subscribe({
      next: (res: any) => {
        this.npkExists = res.exists;
      },
      error: () => {
        this.npkExists = false;
      },
    });
  }

  formatName() {
    if (!this.member?.name) return;
    this.member.name = this.member.name
      .toLowerCase()
      .split(' ')
      .map((word: string) => word ? word.charAt(0).toUpperCase() + word.slice(1) : '')
      .join(' ')
      .trim();
  }

  formatPhone() {
    if (!this.member?.phone) return;
    let digits = String(this.member.phone).trim().replace(/\D/g, '');
    if (digits.startsWith('0')) {
      digits = '62' + digits.substring(1);
    } else if (digits && !digits.startsWith('62')) {
      digits = '62' + digits;
    }
    this.member.phone = digits;
  }

  save() {
    this.formatName();
    this.formatPhone();
    if (!this.memberForm?.valid || this.npkExists) return;
    this.loading = true;

    const request$ = this.isEdit
      ? this.http.patch(`${environment.apiUrl}/members/${this.member.id}`, this.member)
      : this.http.post(`${environment.apiUrl}/members`, this.member);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.feedback.success(`Data anggota berhasil ${this.isEdit ? 'diperbarui' : 'ditambahkan'}.`);
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.loading = false;
        const msg = error.error?.message || '';
        if (msg.toLowerCase().includes('sudah terdaftar')) {
          this.npkExists = true;
        }
        this.feedback.error(msg || `Data anggota gagal ${this.isEdit ? 'diperbarui' : 'ditambahkan'}.`);
      },
    });
  }

  deleteMember() {
    this.feedback.confirm({
      title: 'Hapus Anggota',
      message: `Apakah Anda yakin ingin menghapus anggota ${this.member.name} (${this.member.npk})? Tindakan ini akan menghapus data anggota dan mencabut role terkait.`,
      confirmText: 'Hapus Anggota',
      tone: 'warn',
    }).subscribe((confirmed) => {
      if (!confirmed) return;
      this.loading = true;
      this.http.delete(`${environment.apiUrl}/members/${this.member.id}`).subscribe({
        next: () => {
          this.loading = false;
          this.feedback.success(`Anggota ${this.member.name} berhasil dihapus.`);
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.loading = false;
          this.feedback.error(error.error?.message || 'Gagal menghapus data anggota.');
        },
      });
    });
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
  displayedColumns = ['npk', 'name', 'plant', 'workUnit', 'organizationalPosition', 'roles', 'status', 'phone', 'resetPassword', 'actions'];
  search = '';
  statusFilter = '';
  plantFilter = '';
  workUnitFilter = '';
  roleFilter = '';
  organizationalPositionFilter = '';
  plants: string[] = [];
  workUnits: string[] = [];
  roles: any[] = [];
  organizationalPositions: string[] = [];
  page = 1;
  limit = 10;
  limitOptions = [
    { label: '10', value: 10 },
    { label: '20', value: 20 },
    { label: '50', value: 50 },
    { label: '100', value: 100 },
    { label: 'All', value: 999999 },
  ];
  total = 0;
  totalPages = 0;
  loading = false;
  importing = false;
  resettingMemberId: number | null = null;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private feedback: DialogFeedbackService,
  ) { }

  ngOnInit() {
    this.loadMembers();
    this.loadRoles();
  }

  openMemberDialog(member?: any) {
    const dialogRef = this.dialog.open(AdminMemberDialogComponent, {
      width: '640px',
      data: member ? { ...member } : null,
    });

    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.loadMembers();
      }
    });
  }

  loadRoles() {
    this.http.get(`${environment.apiUrl}/roles`).subscribe((res: any) => {
      this.roles = res;
    });
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
    if (this.workUnitFilter) params.workUnit = this.workUnitFilter;
    if (this.roleFilter) params.role = this.roleFilter;
    if (this.organizationalPositionFilter) params.organizationalPosition = this.organizationalPositionFilter;

    this.http.get(`${environment.apiUrl}/members`, { params }).subscribe((res: any) => {
      this.members.data = res.data;
      this.total = res.meta.total;
      this.totalPages = res.meta.totalPages;
      this.loading = false;
      this.extractFilters();
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
    if (this.resettingMemberId !== null) return;

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

  deleteMember(member: any) {
    this.feedback.confirm({
      title: 'Hapus Anggota',
      message: `Apakah Anda yakin ingin menghapus anggota ${member.name} (${member.npk})? Tindakan ini akan menghapus data anggota dan mencabut role terkait.`,
      confirmText: 'Hapus Anggota',
      tone: 'warn',
    }).subscribe((confirmed) => {
      if (!confirmed) return;

      this.http.delete(`${environment.apiUrl}/members/${member.id}`).subscribe({
        next: () => {
          this.feedback.success(`Anggota ${member.name} berhasil dihapus.`);
          this.loadMembers();
        },
        error: (error) => {
          this.feedback.error(error.error?.message || 'Gagal menghapus data anggota.');
        },
      });
    });
  }

  private extractFilters() {
    const plants = new Set<string>();
    const workUnits = new Set<string>();
    const positions = new Set<string>();
    this.members.data.forEach(m => {
      if (m.plant) plants.add(m.plant);
      if (m.workUnit) workUnits.add(m.workUnit);
      if (m.organizationalPosition) positions.add(m.organizationalPosition);
    });
    this.plants = Array.from(plants).sort();
    this.workUnits = Array.from(workUnits).sort();
    this.organizationalPositions = Array.from(positions).sort();
  }
}
