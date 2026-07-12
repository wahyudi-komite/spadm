import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxTrimDirectiveModule } from 'ngx-trim-directive';
import { PaginateTakeComponent } from '../../modules/shared/paginate-take/paginate-take.component';
import { PaginateComponent } from '../../modules/shared/paginate/paginate.component';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        MatSortModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        PaginateComponent,
        PaginateTakeComponent,
        MatSelectModule,
        NgxTrimDirectiveModule,
    ],
    exports: [
        CommonModule,
        MatSortModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        PaginateComponent,
        PaginateTakeComponent,
        MatSelectModule,
        DatePipe,
        NgxTrimDirectiveModule,
    ],
    providers: [DatePipe],
})
export class SharedModule {}
