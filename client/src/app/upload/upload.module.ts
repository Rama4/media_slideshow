import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadComponent } from './upload.component';
import { UploadService } from './upload.service';
import { HttpClientModule } from '@angular/common/http';
import { NgDragDropModule } from 'ng-drag-drop';


@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    NgDragDropModule.forRoot()
  ],
  declarations: [UploadComponent],
  exports: [UploadComponent],
  // entryComponents: [UploadComponent],
  providers: [UploadService]
})
export class UploadModule { }
