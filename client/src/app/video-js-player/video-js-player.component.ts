import {Component, NgModule,OnInit,AfterViewInit} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'


// initializing the videojs
declare var videojs: any;



@Component({
  selector: 'app-video-js-player',
  templateUrl: './video-js-player.component.html',
  styleUrls: ['./video-js-player.component.css']
})
export class VideoJsPlayerComponent implements OnInit {

  
  ngOnInit() {}
  
  public videoUrl = 'http://vjs.zencdn.net/v/oceans.mp4';
  private videoJSplayer: any;
  
  constructor(){}
      
  ngAfterViewInit()
  {
    this.videoJSplayer = videojs(document.getElementById('video_player_id'), {}, function()
    {
      this.play();
    });
    
  }
  
  ngOnDestroy()
  {
    this.videoJSplayer.dispose();
  }
  
  
  








}
