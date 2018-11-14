import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { UploadService } from './upload.service';
import { AuthenticationService } from '../authentication.service';
import { NgDragDropModule } from 'ng-drag-drop';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  
  
  public filesToUpload: Set<File> = new Set();
  public filesUploadedInSession: Set<string> = new Set();
  uploaded_files = [];
  
  @ViewChild('file') file;
  progress;
  canBeClosed = true; 
  primaryButtonText = 'Upload';
  showCancelButton = true; 
  uploading = false;
  uploadSuccessful = false;
  showModal :  boolean = false;

  fileInfo  = {};

  constructor(public uploadService: UploadService, private auth: AuthenticationService) 
  {
    this.get_files()
  }
  
  private get_files(){
    this.auth.get_files().subscribe(
      (files_list) => {this.uploaded_files = files_list;},
      (err) => {console.log(err)}
    );
  }

  addFiles()
  {
    this.file.nativeElement.click();
  }

  onFilesAdded()
  {
    const files: { [key: string]: File } = this.file.nativeElement.files;
    for (let key in files)
    {
      if (!isNaN(parseInt(key))) 
      {
        this.filesToUpload.add(files[key]);
        this.fileInfo[files[key].name] = {'width':0, 'done':false};
      }
    }
  }

  onUpload()
  {
    // if everything was uploaded already, just close the dialog
    if (this.uploadSuccessful)
    {
      this.showModal = false;
    }
  
    // set the component state to "uploading"
    this.uploading = true;
  
    // start the upload and save the progress map 
    this.progress = this.uploadService.upload(this.filesToUpload);
    for (let key in this.progress)
    {
      this.fileInfo[key] = {'width':0, 'done':false};
    }
    console.log(this.fileInfo)
  
    // convert the progress map into an array
    let allProgressObservables = [];
    for (let key in this.progress)
    {
      allProgressObservables.push(this.progress[key].progress);
      this.progress[key].progress.subscribe((v)=>
      {
        this.fileInfo[key] = {'width':v<100?v:0, 'done':v==100}
      });
      
      
    }
    // Adjust the state variables
  
    // // The OK-button should have the text "Finish" now
    // this.primaryButtonText = 'Finish';
  
    // The dialog should not be closed while uploading
    this.canBeClosed = false;
    
  
    // Hide the cancel-button
    this.showCancelButton = false;
    
    // When all progress-observables are completed...
    forkJoin(allProgressObservables).subscribe(end =>
    {
      // ... the dialog can be closed again...
      this.canBeClosed = true;
  
      // ... the upload was successful...
      this.uploadSuccessful = true;
  
      // ... and the component is no longer uploading
      this.uploading = false;
      
      // get list of files from server
      this.get_files();
      let file_names = this.get_file_names(this.filesToUpload);
      this.filesUploadedInSession = this.union([this.filesUploadedInSession, file_names]);
      
      this.filesToUpload = new Set();
      console.log(this.filesToUpload);
      console.log(this.filesUploadedInSession)
            
    });
    
  }
  
  onClose()
  {
    this.filesToUpload = new Set();
    this.filesUploadedInSession = new Set();
    this.fileInfo  = {};
  }
  
  get_file_names(file_set: Set<File>)
  {
    let temp = new Set();
    this.filesToUpload.forEach((file)=>
    {
      temp.add(file.name);
    });
    return temp;
  }

  union(iterables)
  {
    const set = new Set();
    for (let iterable of iterables)
    {
      iterable.forEach((item)=>
      {
        console.log(item);
        set.add(item);
      });
    }
    return set;
  }

}
