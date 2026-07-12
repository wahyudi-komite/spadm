import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { environment } from 'environments/environment';

@Component({
  selector: 'bazaar-landing',
  templateUrl: './landing.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  standalone: true
})
export class BazaarLandingComponent implements OnInit {
  activeEvent: any = null;
  activeBatch: any = null;
  products: any[] = [];
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.http.get(`${environment.apiUrl}/bazaar/events`).subscribe({
      next: (events: any) => {
        // Find the active event
        this.activeEvent = events.find(e => e.isActive);
        if (this.activeEvent) {
          this.loadBatchesAndProducts(this.activeEvent.id);
        } else {
          this.loading = false;
        }
      },
      error: () => this.loading = false
    });
  }

  loadBatchesAndProducts(eventId: number) {
    this.http.get(`${environment.apiUrl}/bazaar/batches`).subscribe((batches: any) => {
      // Find active batch for this event
      this.activeBatch = batches.find(b => b.event?.id === eventId && b.status === 'OPEN');
      
      // Load products
      this.http.get(`${environment.apiUrl}/bazaar/products`).subscribe((products: any) => {
        this.products = products; // Ideally, we'd filter by eventId and batch
        this.loading = false;
      });
    });
  }
}
