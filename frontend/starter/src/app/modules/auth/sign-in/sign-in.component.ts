import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        MessageModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
    ],
})
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: 'success' | 'error' | 'info' | 'warn'; message: string } = {
        type: 'success',
        message: '',
    };
    signInForm: UntypedFormGroup;
    showAlert: boolean = false;

    quickUsers = [
        { npk: '23893', label: 'SUPER_ADMIN', color: 'warn' },
        { npk: '15012', label: 'SUPER_ADMIN', color: 'warn' },
        { npk: '10001', label: 'BAZAAR_ADMIN', color: 'primary' },
        { npk: '10002', label: 'FINANCE_ADMIN', color: 'primary' },
        { npk: '10003', label: 'AREA_PIC', color: 'accent' },
        { npk: '10004', label: 'LEADERSHIP', color: 'accent' },
        { npk: '10005', label: 'MEMBER', color: '' },
    ];

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router
    ) {}

    ngOnInit(): void {
        this.signInForm = this._formBuilder.group({
            npk: ['', [Validators.required]],
            password: ['', Validators.required],
        });
    }

    quickLogin(npk: string): void {
        this.signInForm.setValue({ npk, password: 'SmartCare' });
        this.signIn();
    }

    signIn(): void {
        if (this.signInForm.invalid) {
            return;
        }

        this.signInForm.disable();
        this.showAlert = false;

        this._authService.signIn(this.signInForm.value).subscribe({
            next: (response: any) => {
                if (response.mustChangePassword) {
                    this._router.navigateByUrl('/change-password');
                    return;
                }
                this._router.navigateByUrl('dashboard');
            },
            error: (response: any) => {
                this.signInForm.enable();
                this.signInNgForm.resetForm();
                this.alert = {
                    type: 'error',
                    message: response.error?.message || 'NPK atau password salah',
                };
                this.showAlert = true;
            },
        });
    }
}
