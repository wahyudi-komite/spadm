import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogEKComponent } from './employee-kaos/dialog-ek/dialog-ek.component';
import { PrintLabelComponent } from './employee-kaos/print-label/print-label.component';
import { ScanDataComponent } from './scan-data/scan-data.component';
import { ServerSideComponent } from './server-side/server-side.component';
import { RoleComponent } from './app/admin/role/role.component';
import { ScanVendorComponent } from './scan-vendor/scan-vendor.component';
import { ScanPlantComponent } from './scan-plant/scan-plant.component';
import { RejectComponent } from './reject/reject.component';



@NgModule({
  declarations: [
    DialogEKComponent,
    PrintLabelComponent,
    ScanDataComponent,
    ServerSideComponent,
    RoleComponent,
    ScanVendorComponent,
    ScanPlantComponent,
    RejectComponent
  ],
  imports: [
    CommonModule
  ]
})
export class PagesModule { }
