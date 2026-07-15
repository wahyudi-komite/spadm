import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideNativeDateAdapter } from '@angular/material/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DateTimePickerComponentComponent } from './date-time-picker-component.component';

describe('DateTimePickerComponentComponent', () => {
    let component: DateTimePickerComponentComponent;
    let fixture: ComponentFixture<DateTimePickerComponentComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DateTimePickerComponentComponent],
            providers: [provideNativeDateAdapter(), provideNoopAnimations()],
        }).compileComponents();

        fixture = TestBed.createComponent(DateTimePickerComponentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
