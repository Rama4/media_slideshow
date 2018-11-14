import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';

export interface TV {
  // id:number;
  name: string;
}

@Component({
  selector: 'app-tv-create',
  templateUrl: './tv-create.component.html',
  styleUrls: ['./tv-create.component.css']
})
export class TvCreateComponent implements OnInit {
submitted = false;

  


  constructor(private auth: AuthenticationService, private router: Router) { }

  ngOnInit() {
  }

  onSubmit(data)
  {
    this.submitted = true;
    console.log(`form submitted!: `)
    console.log(data)
    this.create_tv(data);
  }

  private create_tv(tv)
  {
    this.auth.create_tv(tv).subscribe
    (
      () => {
        console.log("tv created successfully")
        this.router.navigateByUrl('/tvs');
      },
      (err) => {console.log(err)}
    );
  }


}
