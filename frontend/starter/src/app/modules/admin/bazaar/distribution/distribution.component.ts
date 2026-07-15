import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { environment } from 'environments/environment';
import { DialogFeedbackService } from 'app/shared/dialog-feedback/dialog-feedback.service';
import { finalize } from 'rxjs';

interface PicDashboard {
  areas: Array<{ id: number; code: string; name: string }>;
  stats: { readyForPickup: number; distributedToday: number };
  orders: Array<{
    id: number;
    orderNumber: string;
    member: { npk: string; name: string };
    area: { id: number; code: string; name: string };
    totalItems: number;
    createdAt: string;
  }>;
  recentDistributions: Array<{
    id: number;
    orderNumber: string;
    memberName: string;
    area: { code: string };
    distributedAt: string;
  }>;
}

@Component({
  selector: 'admin-bazaar-distribution',
  templateUrl: './distribution.component.html',
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatInputModule, MatCardModule],
  standalone: true
})
export class AdminBazaarDistributionComponent implements OnInit, OnDestroy {
  @ViewChild('cameraVideo') cameraVideo?: ElementRef<HTMLVideoElement>;

  tokenCode: string = '';
  scannedToken: any = null;
  dashboard: PicDashboard | null = null;
  selectedAreaId: number | null = null;
  loading = false;
  dashboardLoading = false;
  submitting = false;
  error: string | null = null;
  cameraActive = false;
  readonly cameraSupported =
    typeof window !== 'undefined' &&
    'BarcodeDetector' in window &&
    !!navigator.mediaDevices?.getUserMedia;
  private cameraStream: MediaStream | null = null;
  private animationFrame: number | null = null;
  private detecting = false;
  private barcodeDetector: {
    detect(source: CanvasImageSource): Promise<Array<{ rawValue?: string }>>;
  } | null = null;

  constructor(
    private http: HttpClient,
    private feedback: DialogFeedbackService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  loadDashboard(areaId = this.selectedAreaId): void {
    this.selectedAreaId = areaId;
    this.dashboardLoading = true;
    const query = areaId ? `?areaId=${areaId}` : '';
    this.http
      .get<PicDashboard>(
        `${environment.apiUrl}/bazaar/distributions/pic-dashboard${query}`
      )
      .pipe(finalize(() => (this.dashboardLoading = false)))
      .subscribe({
        next: (dashboard) => (this.dashboard = dashboard),
        error: (err) => {
          this.feedback.error(
            err.error?.message || 'Dashboard distribusi gagal dimuat.'
          );
        },
      });
  }

  selectArea(areaId: number | null): void {
    this.loadDashboard(areaId);
  }

  scanToken() {
    if (!this.tokenCode.trim()) return;

    this.loading = true;
    this.error = null;
    this.scannedToken = null;

    const token = encodeURIComponent(this.tokenCode.trim());
    this.http.get(`${environment.apiUrl}/bazaar/distributions/validate/${token}`).subscribe({
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

  async startCamera(): Promise<void> {
    if (!this.cameraSupported || !this.cameraVideo) {
      this.feedback.error('Browser ini belum mendukung scanner QR kamera.');
      return;
    }

    try {
      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      const Detector = (
        window as unknown as {
          BarcodeDetector: new (options: { formats: string[] }) => {
            detect(source: CanvasImageSource): Promise<Array<{ rawValue?: string }>>;
          };
        }
      ).BarcodeDetector;
      this.barcodeDetector = new Detector({ formats: ['qr_code'] });
      this.cameraVideo.nativeElement.srcObject = this.cameraStream;
      await this.cameraVideo.nativeElement.play();
      this.cameraActive = true;
      this.scanCameraFrame();
    } catch {
      this.stopCamera();
      this.feedback.error('Kamera tidak dapat diakses. Periksa izin browser.');
    }
  }

  stopCamera(): void {
    this.cameraActive = false;
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.cameraStream?.getTracks().forEach((track) => track.stop());
    this.cameraStream = null;
    this.barcodeDetector = null;
    if (this.cameraVideo) this.cameraVideo.nativeElement.srcObject = null;
  }

  private scanCameraFrame = async (): Promise<void> => {
    if (!this.cameraActive || !this.cameraVideo || !this.barcodeDetector) return;

    if (!this.detecting && this.cameraVideo.nativeElement.readyState >= 2) {
      this.detecting = true;
      try {
        const results = await this.barcodeDetector.detect(
          this.cameraVideo.nativeElement
        );
        const rawValue = results[0]?.rawValue?.trim();
        if (rawValue) {
          this.tokenCode = rawValue;
          this.stopCamera();
          this.scanToken();
          return;
        }
      } catch {
        this.stopCamera();
        this.feedback.error('Pemindaian kamera terhenti. Silakan buka kamera kembali.');
        return;
      } finally {
        this.detecting = false;
      }
    }
    this.animationFrame = requestAnimationFrame(this.scanCameraFrame);
  };

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
          this.loadDashboard();
        },
        error: (err) => {
          this.submitting = false;
          this.feedback.error('Gagal konfirmasi: ' + (err.error?.message || err.message));
        }
      });
    });
  }
}
