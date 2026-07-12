import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    inject,
    OnInit,
    ViewChild,
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../../core/user/user.service';
import { User } from '../../core/user/user.types';
import { GlobalVariable } from '../../node/common/global-variable';
import { EmployeeKaosService } from '../employee-kaos/employee-kaos.service';

@Component({
    selector: 'app-reject',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ToastrModule],
    templateUrl: './reject.component.html',
    styleUrl: './reject.component.scss',
})
export class RejectComponent implements OnInit {
    user: User;
    form!: FormGroup;
    loading: boolean = true;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    @ViewChild('scan', { static: false }) scan!: ElementRef;

    private fb = inject(FormBuilder);
    private toastr = inject(ToastrService);
    private _service = inject(EmployeeKaosService);
    private _userService = inject(UserService);
    ngOnInit(): void {
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;
            });
        this.form = this.fb.group({
            id: ['', [Validators.required]],
        });
    }

    setFocus() {
        this.scan.nativeElement.focus();
    }

    resetForm() {
        this.form.reset();
        this.form.markAsUntouched();
        this.form.markAsPristine();
        this.setFocus();
    }
    onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        const data = {
            ...this.form.getRawValue(),
            scan_plant: this.user.name,
            ...(this.user.plant ? { plant: this.user.plant } : { plant: null }),
        };
        this._service.updateScanPlant(data).subscribe(
            (res) => {
                this.loading = false;
                if (GlobalVariable.audioSuccess) {
                    GlobalVariable.audioSuccess.pause(); // pastikan berhenti dulu
                    GlobalVariable.audioSuccess.currentTime = 0; // reset ke awal
                    GlobalVariable.audioSuccess.play(); // mainkan ulang
                }
                this.toastr.success('Success', res.id + ' ' + res.name, {
                    timeOut: 2000,
                    positionClass: 'toast-bottom-center',
                });
                this.form.reset();

                this.form.markAsUntouched();
                this.form.markAsPristine();
                this.setFocus();
            },
            (error) => {
                this.errorNotif(error);
            }
        );
    }
    errorNotif(error: any) {
        const message = error?.error?.message || 'Unknown error';

        if (message.toLowerCase().includes('print')) {
            GlobalVariable.audioInfo.play();
            this.toastr.info(message, 'Info', {
                timeOut: 5000,
                positionClass: 'toast-bottom-center',
            });
        } else {
            GlobalVariable.audioFailed.play();
            this.toastr.error(message, 'Failed', {
                timeOut: 5000,
                positionClass: 'toast-bottom-center',
            });
        }
    }
}
