import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { AppNavigationService } from '../navigation.service';
import { AppVerticalNavigationComponent } from './vertical-navigation.component';

describe('AppVerticalNavigationComponent', () => {
    let fixture: ComponentFixture<AppVerticalNavigationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppVerticalNavigationComponent],
            providers: [
                AppNavigationService,
                { provide: Router, useValue: { events: EMPTY } },
            ],
        })
            .overrideComponent(AppVerticalNavigationComponent, {
                set: { template: '' },
            })
            .compileComponents();

        fixture = TestBed.createComponent(AppVerticalNavigationComponent);
        fixture.componentRef.setInput('name', 'mainNavigation');
    });

    afterEach(() => {
        fixture.destroy();
        document.body.style.overflow = '';
    });

    it('locks body scrolling only while an overlay navigation is open', () => {
        fixture.componentRef.setInput('mode', 'over');
        fixture.componentRef.setInput('opened', true);
        fixture.detectChanges();

        expect(document.body.style.overflow).toBe('hidden');

        fixture.componentRef.setInput('opened', false);
        fixture.detectChanges();

        expect(document.body.style.overflow).toBe('');
    });

    it('releases body scrolling when the navigation switches to side mode', () => {
        fixture.componentRef.setInput('mode', 'over');
        fixture.componentRef.setInput('opened', true);
        fixture.detectChanges();
        expect(document.body.style.overflow).toBe('hidden');

        fixture.componentRef.setInput('mode', 'side');
        fixture.detectChanges();

        expect(document.body.style.overflow).toBe('');
    });
});
