import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { environment } from 'environments/environment';
import { DialogFeedbackService } from 'app/shared/dialog-feedback/dialog-feedback.service';

@Component({
  selector: 'admin-bazaar-distribution',
  templateUrl: './distribution.component.html',
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatInputModule, MatCardModule],
  standalone: true
})
export class AdminBazaarDistributionComponent {
  tokenCode: string = '';
  scannedToken: any = null;
  loading = false;
  submitting = false;
  error: string | null = null;

  constructor(
    private http: HttpClient,
    private feedback: DialogFeedbackService
  ) {}

  scanToken() {
    if (!this.tokenCode.trim()) return;

    this.loading = true;
    this.error = null;
    this.scannedToken = null;

    this.http.get(`${environment.apiUrl}/bazaar/distributions/validate/${this.tokenCode.trim()}`).subscribe({
      next: (res: any) => {
        this.scannedToken = res;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Token tidak valid atau sudah digunakan.';
        this.loading = false;
      }
    });
  }

  confirmDistribution() {
    if (!this.scannedToken) return;
    
    this.feedback.confirm({
      title: 'Konfirmasi penyerahan',
      message: 'Apakah Anda yakin barang sudah diserahkan ke anggota yang bersangkutan?',
      confirmText: 'Konfirmasi',
    }).subscribe((confirmed) => {
      if (!confirmed) return;

      this.submitting = true;
      this.http.post(`${environment.apiUrl}/bazaar/distributions/confirm`, {
        tokenCode: this.scannedToken.tokenCode
      }).subscribe({
        next: () => {
          this.submitting = false;
          this.feedback.success('Barang berhasil diserahkan!');
          this.tokenCode = '';
          this.scannedToken = null;
        },
        error: (err) => {
          this.submitting = false;
          this.feedback.error('Gagal konfirmasi: ' + (err.error?.message || err.message));
        }
      });
    });
  }
}
