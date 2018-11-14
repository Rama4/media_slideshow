import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { NgDragDropModule } from 'ng-drag-drop';

@Component({
  selector: 'app-tv-content',
  templateUrl: './tv-content.component.html',
  styleUrls: ['./tv-content.component.css']
})
export class TvContentComponent implements OnInit {

  tvId;
  tv;
  files;
  
  new_pos = -1;
  old_pos = -1;
  temp_file;
  rearrange_btn_text = "Rearrange";
  states = ["Rearrange", "Save"];
  
  dragOk = false;
  f = -1;

  old_files;
  old_name;
  server_message = "";
  name;
  submitted = false;


  constructor(private route: ActivatedRoute, private router: Router, private auth: AuthenticationService) {}

  ngOnInit()
  { // while coding the components, inject dependencies into constructor but put all initialization code in ngOnInit.
    this.tvId = this.route.snapshot.paramMap.get('tvId');
    this.name = this.tvId;
    this.get_tv_details(this.tvId);
    this.f = 0;
    this.old_files = [];
    this.old_name = "";
  }

  private get_tv_details(tvId)
  {
    this.auth.get_tv_details(tvId).subscribe(
      (tv) => 
      {
        console.log(tv);
        this.tvId = tv.data.name;
        this.name = this.tvId;
        this.tv = tv.data;
        this.files = tv.data.files;
        this.old_files = this.files;
        this.old_name = this.name;
      },
      (err) => {console.log(err); if(err.status == 404){this.router.navigateByUrl('/notfound');}}
    );
  }
  
  // drag and drop functions

  onFileDrag(e: any)
  {
    this.temp_file = this.files[e];
    this.old_pos = e;
  }

  onFileDrop(e: any)
  { // remove the file from its old position and insert it at its new position
    this.files.splice(this.old_pos, 1);
    this.files.splice(this.new_pos, 0, this.temp_file);
  }
  
  updatePos(e: any)
  {
    this.new_pos = e;
  }
  
  save_files_list()
  {
    let temp = {files: this.files , name: this.name};
    this.auth.save_tv_details(this.tvId, temp).subscribe
    (
      (msg) => 
      {
          this.server_message = msg.message;
          this.files = msg.data.files;
          this.tvId = msg.data.name;
      },
      (err) =>
      {
        this.server_message = err;
        console.log(err)
      }
    );
  }
  
  toggleEdit()
  {
    this.f = (this.f + 1)%2;
    this.old_files = TvContentComponent.deepCopy(this.files);
    if(this.f == 0)
      this.save_files_list();
    else
      this.server_message = "";
    this.rearrange_btn_text = this.states[this.f];
    console.log(`${this.f} , ${this.states}\n ${this.rearrange_btn_text}`);
  }

  cancelEdit()
  {
    this.f = (this.f + 1)%2;
    this.files = this.old_files;
  }
  
  public static deepCopy(oldObj: any)
  {
    var newObj = oldObj;
    if (oldObj && typeof oldObj === "object") {
        newObj = Object.prototype.toString.call(oldObj) === "[object Array]" ? [] : {};
        for (var i in oldObj) {
            newObj[i] = this.deepCopy(oldObj[i]);
        }
    }
    return newObj;
  }
  
}
