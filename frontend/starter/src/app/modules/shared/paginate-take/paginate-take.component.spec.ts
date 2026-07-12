import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginateTakeComponent } from './paginate-take.component';

describe('PaginateTakeComponent', () => {
  let component: PaginateTakeComponent;
  let fixture: ComponentFixture<PaginateTakeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginateTakeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginateTakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
