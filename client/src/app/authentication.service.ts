import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';


export interface UserDetails {
  _id: string;
  email: string;
  name: string;
  exp: number;
  iat: number;
}

interface TokenResponse {
  token: string;
}

export interface TokenPayload {
  email: string;
  password: string;
  name?: string;
}


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  
  private token: string;

  constructor(private http: HttpClient, private router: Router) {}

  private saveToken(token: string): void
  {
    localStorage.setItem('mean-token', token);
    this.token = token;
  }

  public getToken(): string
  {
    if (!this.token)
    {
      this.token = localStorage.getItem('mean-token');
    }
    return this.token;
  }

  public getUserDetails(): UserDetails
  {
    const token = this.getToken();
    if (token)
    {
      var payload = token.split('.')[1];
      payload = window.atob(payload);
      return JSON.parse(payload);
    }
    return null;
  }

  public isLoggedIn(): boolean
  {
    const user = this.getUserDetails();
    return (user) ? ( user.exp > (Date.now() / 1000) ) : false;
  }

  private request(method: 'post'|'get', type, data?: any): Observable<any>
  {
    let base;

    if (method === 'post')
    {
      base = this.http.post(`/api/${type}`, data);
    }
    else
    {
      base = this.http.get(`/api/${type}`, { headers: { Authorization: `Bearer ${this.getToken()}` }});
    }
    // for rxkjs 6 and above, we need to import map operator, and use pipe()
    const request = base.pipe(
      map((data: TokenResponse) =>
      {
        if (data.token)
        {
          this.saveToken(data.token);
        }
        return data;
      })
    );
  
    return request;
  }

  public register(user: TokenPayload): Observable<any>
  {
    return this.request('post', 'register', user);
  }

  public login(user: TokenPayload): Observable<any>
  {
    return this.request('post', 'login', user);
  }

  public profile(): Observable<any>
  {
    return this.request('get', 'profile');
  }
  
  public logout(): void
  {
    this.token = '';
    window.localStorage.removeItem('mean-token');
    this.router.navigateByUrl('/');
  }
  
  public get_files(): Observable<any>
  {
    return this.request('get', 'files'); 
  }
  
  public get_tvs(): Observable<any>
  {
    return this.request('get', 'tvs'); 
  }
  
  public get_tv_details(tvName: string): Observable<any>
  {
    return this.request('get',`tvs/${tvName}`)
  }
  
  public create_tv(tv: any): Observable<any>
  {
    return this.request('post','tvs', tv)
  }
 
  public save_tv_details(tvId: any, data: any): Observable<any>
  {
    return this.request('post',`tvs/${tvId}`, data)
  }
  
  public save_disp_matrix(matrix: any): Observable<any>
  {
    return this.request('post',`tvs/save`, matrix)
  }
 
}
