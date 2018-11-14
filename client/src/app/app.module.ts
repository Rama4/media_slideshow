import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { UploadModule } from './upload/upload.module';
import { VgCoreModule } from 'videogular2/core';
import { VgControlsModule } from 'videogular2/controls';
import { VgOverlayPlayModule } from 'videogular2/overlay-play';
import { VgBufferingModule } from 'videogular2/buffering';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgDragDropModule } from 'ng-drag-drop';
// import { SingleMediaPlayer } from './single-media-player';

import { AppComponent } from './app.component';
import { ProfileComponent } from './profile/profile.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { UploadComponent } from './upload/upload.component';
import { TvComponent } from './tv/tv.component';
import { TvContentComponent } from './tv-content/tv-content.component';
import { TvCreateComponent } from './tv-create/tv-create.component';

import { AuthenticationService } from './authentication.service';
import { AuthGuardService } from './auth-guard.service';
import { PlayerComponent } from './player/player.component';
import { NotFoundComponent } from './not-found/not-found.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuardService] },
  { path: 'upload', component: UploadComponent, canActivate: [AuthGuardService] },
  { path: 'tvs', component: TvComponent },
  { path: 'tvs/create', component: TvCreateComponent, canActivate: [AuthGuardService] },
  { path: 'tvs/:tvId', component: TvContentComponent },
  { path: 'tvs/:tvId/play', component: PlayerComponent },
  { path: 'notfound', component: NotFoundComponent },
  { path: '**', redirectTo: 'notfound'  }
];

@NgModule({
  declarations: [
    AppComponent,
    ProfileComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    HeaderComponent,
    FooterComponent,
    TvComponent,
    TvContentComponent,
    TvCreateComponent,
    PlayerComponent,
    NotFoundComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
    NgDragDropModule.forRoot(),
    UploadModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule
  ],
  providers: [
    AuthenticationService, 
    AuthGuardService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
