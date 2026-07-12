import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'app-date-time-picker-component',
    imports: [
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatButtonModule,
    ],
    templateUrl: './date-time-picker-component.component.html',
    styleUrl: './date-time-picker-component.component.scss'
})
export class DateTimePickerComponentComponent {
    startDate!: Date;
    endDate!: Date;
    startTime: string = '';
    endTime: string = '';

    getCombinedDateTime(): void {
        if (this.startDate && this.startTime && this.endDate && this.endTime) {
            const startDateTime = new Date(this.startDate);
            const endDateTime = new Date(this.endDate);

            // Set time
            const [startHours, startMinutes] = this.startTime.split(':');
            startDateTime.setHours(+startHours, +startMinutes);

            const [endHours, endMinutes] = this.endTime.split(':');
            endDateTime.setHours(+endHours, +endMinutes);

            console.log('Start DateTime:', startDateTime);
            console.log('End DateTime:', endDateTime);
        }
    }
}
