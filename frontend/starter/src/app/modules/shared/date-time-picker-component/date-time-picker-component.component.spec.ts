import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateTimePickerComponentComponent } from './date-time-picker-component.component';

describe('DateTimePickerComponentComponent', () => {
  let component: DateTimePickerComponentComponent;
  let fixture: ComponentFixture<DateTimePickerComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateTimePickerComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateTimePickerComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
