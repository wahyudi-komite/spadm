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

@Component({
  selector: 'admin-member-detail',
  templateUrl: './member-detail.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, RouterLink],
})
export class AdminMemberDetailComponent implements OnInit {
  member: any = { npk: '', name: '', email: '', phone: '', workUnit: '', organizationalPosition: '', plant: '', status: 'active' };
  loading = false;
  @ViewChild('memberForm') memberForm!: NgForm;

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {}

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
    this.http.patch(`${environment.apiUrl}/members/${this.member.id}`, this.member).subscribe(() => {
      this.loading = false;
      this.router.navigate(['/admin/members']);
    });
  }
}
