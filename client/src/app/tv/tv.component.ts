import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tv',
  templateUrl: './tv.component.html',
  styleUrls: ['./tv.component.css']
})
export class TvComponent implements OnInit {


  tvs_list = [];
  files_list = [];
  disp_arr = {};
  
  message = "";
  result;

  constructor(private auth: AuthenticationService, private router: Router)
  {
    this.get_tvs();
  }

  ngOnInit() {
    this.message = "";
    this.result = true;
  }
  
  private get_tvs()
  {
    this.auth.get_tvs().subscribe
    (
      (data) =>
      {
        console.log(`data=${data}`);
        this.tvs_list = data.tvs;
        this.files_list = data.files;
        for(let tv of this.tvs_list)
        {
          let tv_name = tv.name;
          this.disp_arr[tv_name] = {};
          for(let file of this.files_list)
          {
            this.disp_arr[tv_name][file._id] = tv.files.includes(file._id);
          }
        }
        console.log(this.disp_arr)
      },
      (err) => {console.log(`err = ${err}`); if(err.status == 404){this.router.navigateByUrl('/notfound');}}
    );
  }
  
  private changeDisp(tv_name, fileId)
  {
    this.disp_arr[tv_name][fileId] = !this.disp_arr[tv_name][fileId];
  }

  private saveDispMatrix()
  {
    this.auth.save_disp_matrix(this.disp_arr).subscribe
    (
      (data) =>
      {
        this.message = data.message;
        this.result = true;
      },
      (err) =>
      {
        this.message = err.error.message;
        this.result = false;
      }
    );
  }
}
