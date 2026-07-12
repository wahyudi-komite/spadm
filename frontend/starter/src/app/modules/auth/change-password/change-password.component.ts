import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'auth-change-password',
    templateUrl: './change-password.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        MessageModule, FormsModule, ReactiveFormsModule,
        MatFormFieldModule, MatInputModule, MatButtonModule,
        MatIconModule, MatProgressSpinnerModule,
    ],
})
export class AuthChangePasswordComponent implements OnInit {
    @ViewChild('changePasswordNgForm') changePasswordNgForm: NgForm;

    alert: { type: 'success' | 'error' | 'info' | 'warn'; message: string } = {
        type: 'success', message: '',
    };
    changePasswordForm: UntypedFormGroup;
    showAlert: boolean = false;

    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router
    ) {}

    ngOnInit(): void {
        this.changePasswordForm = this._formBuilder.group({
            currentPassword: ['', Validators.required],
            newPassword: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', Validators.required],
        });
    }

    changePassword(): void {
        if (this.changePasswordForm.invalid) return;

        const { currentPassword, newPassword, confirmPassword } = this.changePasswordForm.value;
        if (newPassword !== confirmPassword) {
            this.alert = { type: 'error', message: 'Konfirmasi password tidak sesuai' };
            this.showAlert = true;
            return;
        }

        this.changePasswordForm.disable();
        this.showAlert = false;

        this._authService.changePassword(currentPassword, newPassword).subscribe({
            next: () => {
                this._router.navigateByUrl('dashboard');
            },
            error: (response: any) => {
                this.changePasswordForm.enable();
                this.alert = {
                    type: 'error',
                    message: response.error?.message || 'Gagal mengubah password',
                };
                this.showAlert = true;
            },
        });
    }
}
