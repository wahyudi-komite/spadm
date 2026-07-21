import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { environment } from 'environments/environment';
import { DialogFeedbackService } from 'app/shared/dialog-feedback/dialog-feedback.service';

@Component({
  selector: 'admin-member-detail',
  templateUrl: './member-detail.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, RouterLink],
})
export class AdminMemberDetailComponent implements OnInit {
  member: any = { npk: '', name: '', email: '', phone: '', workUnit: '', organizationalPosition: '', plant: '', status: 'active' };
  readonly workUnits = ['P1', 'P2', 'P3', 'P4', 'P5', 'PC', 'HO'];
  readonly plants = [
    { value: 'P1', label: 'Plant 1' },
    { value: 'P2', label: 'Plant 2' },
    { value: 'P3', label: 'Plant 3' },
    { value: 'P4', label: 'Plant 4' },
    { value: 'P5', label: 'Plant 5' },
    { value: 'PC', label: 'Part Center' },
    { value: 'HO', label: 'Head Office' },
  ];
  loading = false;
  @ViewChild('memberForm') memberForm!: NgForm;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private feedback: DialogFeedbackService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.loading = true;
      this.http.get(`${environment.apiUrl}/members/${id}`).subscribe((res: any) => {
        this.member = res;
        this.loading = false;
      });
    }
  }

  save(event?: Event) {
    event?.preventDefault();
    if (!this.memberForm.valid) return;
    this.loading = true;
    
    const isNew = this.route.snapshot.paramMap.get('id') === 'new';
    const request$ = isNew 
        ? this.http.post(`${environment.apiUrl}/members`, this.member)
        : this.http.patch(`${environment.apiUrl}/members/${this.member.id}`, this.member);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.feedback.success(`Data anggota berhasil ${isNew ? 'ditambahkan' : 'diperbarui'}.`);
        this.router.navigate(['/admin/members']);
      },
      error: (error) => {
        this.loading = false;
        this.feedback.error(error.error?.message || `Data anggota gagal ${isNew ? 'ditambahkan' : 'diperbarui'}. Silakan coba lagi.`);
      },
    });
  }
}
