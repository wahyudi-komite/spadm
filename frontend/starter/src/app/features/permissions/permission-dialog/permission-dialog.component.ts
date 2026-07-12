import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    OnInit,
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialogActions,
    MatDialogContent,
    MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Permission } from '../../../node/app/permission/permission';
import { ExistingValidator } from '../../../node/common/existing.validator';

@Component({
    selector: 'app-permission-dialog',
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatDialogContent,
        MatDialogActions,
        MatIconModule,
    ],
    templateUrl: './permission-dialog.component.html',
    styleUrl: './permission-dialog.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionDialogComponent implements OnInit {
    form!: FormGroup;
    action?: string;
    local_data: any;
    permissions: Permission[] = [];

    readonly dialogRef = inject(MatDialogRef<PermissionDialogComponent>);
    readonly data = inject<Permission>(MAT_DIALOG_DATA);
    private fb = inject(FormBuilder);
    private existingValidator = inject(ExistingValidator);

    ngOnInit(): void {
        this.local_data = { ...this.data };
        this.action = this.local_data.action;

        const asyncValidator = this.existingValidator.IsUnique(
            'permissions',
            this.local_data.action,
            this.local_data.id
        );

        this.form = this.fb.group({
            name: [
                '',
                {
                    validators: [Validators.required, Validators.minLength(4)],
                    asyncValidators: asyncValidator ? asyncValidator : [],
                },
            ],
        });

        if (this.action != 'Add') {
            this.form.patchValue(this.local_data);
        }

        this.dialogRef.keydownEvents().subscribe((event) => {
            if (event.key === 'Escape') {
                this.closeDialog();
            }
        });

        this.dialogRef.backdropClick().subscribe((event) => {
            this.closeDialog();
        });
    }

    get f() {
        return this.form.controls;
    }

    doAction() {
        if (this.form.invalid) {
            return;
        }

        this.dialogRef.close({
            event: this.action,
            data: this.local_data,
            formValue: this.form.value,
        });
    }

    closeDialog() {
        this.action = 'Cancel';
        this.dialogRef.close({ event: 'Cancel' });
    }
}
