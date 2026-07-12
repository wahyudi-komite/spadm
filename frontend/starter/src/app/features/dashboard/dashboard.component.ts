import { Component } from '@angular/core';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    template: `
        <div class="flex flex-col items-center justify-center h-full p-8">
            <h1 class="text-4xl font-bold text-primary mb-4">SPADM</h1>
            <p class="text-lg text-secondary">Serikat Pekerja Astra Daihatsu Motor</p>
            <p class="text-base text-hint mt-8">Dashboard akan segera hadir</p>
        </div>
    `,
})
export class DashboardComponent {}
