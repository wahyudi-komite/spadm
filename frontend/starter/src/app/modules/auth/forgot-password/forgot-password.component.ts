import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { AuthService } from 'app/core/auth/auth.service';
import { finalize } from 'rxjs';

@Component({
    selector: 'auth-forgot-password',
    templateUrl: './forgot-password.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        MessageModule, FormsModule, ReactiveFormsModule,
        MatFormFieldModule, MatInputModule, MatButtonModule,
        MatProgressSpinnerModule, RouterLink,
    ]
})
export class AuthForgotPasswordComponent implements OnInit {
    @ViewChild('forgotPasswordNgForm') forgotPasswordNgForm: NgForm;

    alert: { type: 'success' | 'error' | 'info' | 'warn'; message: string } = {
        type: 'success', message: '',
    };
    forgotPasswordForm: UntypedFormGroup;
    showAlert: boolean = false;

    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder
    ) {}

    ngOnInit(): void {
        this.forgotPasswordForm = this._formBuilder.group({
            npk: ['', [Validators.required]],
        });
    }

    sendResetLink(): void {
        if (this.forgotPasswordForm.invalid) return;

        this.forgotPasswordForm.disable();
        this.showAlert = false;

        this._authService
            .forgotPassword(this.forgotPasswordForm.get('npk').value)
            .pipe(finalize(() => {
                this.forgotPasswordForm.enable();
                this.forgotPasswordNgForm.resetForm();
                this.showAlert = true;
            }))
            .subscribe({
                next: () => {
                    this.alert = {
                        type: 'success',
                        message: 'Jika NPK terdaftar, instruksi reset password akan dikirim.',
                    };
                },
                error: () => {
                    this.alert = {
                        type: 'error',
                        message: 'NPK tidak ditemukan.',
                    };
                },
            });
    }
}
