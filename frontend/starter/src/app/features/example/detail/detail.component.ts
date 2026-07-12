import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-example-detail',
    standalone: true,
    imports: [ButtonModule],
    template: `
        <div class="card p-4">
            <h2 class="text-xl font-bold mb-4">Example Detail</h2>
            <p class="mb-4">Not implemented — viewing item with ID: {{ id }}</p>
            <p-button label="Back" icon="pi pi-arrow-left" (click)="goBack()" severity="secondary" />
        </div>
    `,
})
export class ExampleDetailComponent {
    private route = inject(ActivatedRoute);
    private location = inject(Location);

    id = this.route.snapshot.paramMap.get('id');

    goBack() {
        this.location.back();
    }
}
