import { BrowserModule } from '@angular/platform-browser'
import { Component, OnInit, ViewChildren, ElementRef, QueryList, NgModule, AfterViewInit } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { timer, Subscription } from 'rxjs';
//-------------------------------------------------------------------------------------------------
// initializing the videojs (somehow this invokes videojs script imported in angular.json)
declare var videojs: any;
//-------------------------------------------------------------------------------------------------
@Component({
  selector: 'app-video-js-player',
  templateUrl: './video-js-player.component.html',
  styleUrls: ['./video-js-player.component.css']
})
export class VideoJsPlayerComponent implements OnInit {
  
    videoUrl = "//vjs.zencdn.net/v/oceans.mp4";
    defaultVideoUrl = "//vjs.zencdn.net/v/oceans.mp4";
    showVideo = false;
    image = null;
    videoJSplayer: any;
    @ViewChildren('videoPlayer') video: QueryList<any>;
    
    loaded = false;
    urls = [];
    currentIndex : number = -1;
    
    tvId: string;
    url_prefix : string = "https://angular-dev-rama4.c9users.io/api/download/";
    
    // selectedIndex : number = 0;
    imageSubscription: Subscription = null;
    
    
    constructor(private route: ActivatedRoute, private auth: AuthenticationService){}

    ngOnInit()
    {
      console.log("on init")
      
      this.tvId = this.route.snapshot.paramMap.get('tvId');
      let Obj = this;
      
      this.auth.get_tv_details(this.tvId).subscribe
      (
        (tv) => 
        {
          console.log(tv);
          // get urls and initialize array of urls
          Obj.urls = tv.data.files.map((f)=>
          {
            f.url = Obj.url_prefix+f._id; 
            // f.done = false;
            return f;
          });
          console.log(Obj.urls);
          
          Obj.currentIndex = 0;
          Obj.loaded = true;
          // start the timer
          let x = Obj.isVideoFile(Obj.urls[Obj.currentIndex].name) ? 1 : 0;
          
          Obj.imageSubscription = timer(1000, 5000).subscribe(()=>
          {
            
            // console.log("done arr=");
            // console.log(Obj.get_done_arr());
            
            // if current url is video
            if(Obj.isVideoFile(Obj.urls[Obj.currentIndex].name))
            { 
              console.log("current item is video");
              console.log(`index = ${Obj.currentIndex}`);
            
              if(x)
              {
                Obj.image = null;
                Obj.showVideo = true;
                // Obj.videoUrl = Obj.defaultVideoUrl;
                
                // Obj.get_video_player( (playerNana) =>
                // {
                //     console.log(playerNana);
                //     if(playerNana)
                //     {
                //       console.log("setting src and playing");
                //       Obj.videoUrl = Obj.urls[Obj.currentIndex].url;
                //       Obj.videoJSplayer.src(
                //       {
                //         type: "video/mp4",
                //         src: Obj.urls[Obj.currentIndex].url
                //       });
                //       // Todo: sync issue fix here (synchronous)
                //       Obj.videoJSplayer.load();
                //       Obj.videoJSplayer.play();
                //     }
                // });                
                
          
                Obj.set_video_player_src( (playerNana) =>
                {
                    // playerNana.load();
                    console.log("playng()")
                    playerNana.play();
                    console.log(Obj.videoUrl)
                    x=0;
                    playerNana.on('end',()=>
                    {
                      console.log("endeddedded")
                    })
                    
                });
              }
              
              if(Obj.videoJSplayer)
              { 
                console.log("videoJSplayer exists")
                if(!Obj.videoJSplayer.ended())
                  console.log("video still playing")
              }
              if(Obj.videoJSplayer && Obj.videoJSplayer.ended())
              {
                console.log("video ended");
                // Obj.urls[Obj.currentIndex].done = true;
                Obj.currentIndex = (Obj.currentIndex + 1) % Obj.urls.length;
                // console.log(Obj.get_done_arr());
                
                
                if(Obj.isImageFile(Obj.urls[Obj.currentIndex].name))
                {
                  console.log("next is image")
                  x = 0;
                  Obj.showVideo = false;
                  Obj.image = "";
                }
                else if(Obj.isVideoFile(Obj.urls[Obj.currentIndex].name))
                {
                  x = 1;
                  console.log("next is video")
                  Obj.image = null;
                }
              }
            }
            else if(Obj.isImageFile(Obj.urls[Obj.currentIndex].name))
            { // if current item is image
              console.log("current item is image");
              console.log(`index = ${Obj.currentIndex}`);
                
              // display current image
              Obj.image = Obj.urls[Obj.currentIndex].url;
              // Obj.videoUrl = null;
              console.log(`image src = ${Obj.image}`)
              // move on to next url
              Obj.currentIndex = (Obj.currentIndex + 1) % Obj.urls.length;
              // if next is video, play it
              if(Obj.isVideoFile(Obj.urls[Obj.currentIndex].name))
              {
                console.log("next is video")
                x = 1;
                
              }
            }
          });
        },
        (err) => {console.log(err);}
      );
    }
    
    // get_video_player(callback)
    // {
    //   console.log("get_video_player()");
      
    //   if(!this.videoJSplayer)
    //   {
    //     // this.loaded = true;
    //     let Obj = this;
    //     console.log(`loaded = ${this.loaded}`)
        
    //     setTimeout(() =>
    //     {
    //       console.log(`video=`)
    //       console.log(Obj.video.toArray())
    //       Obj.videoJSplayer = videojs(Obj.video.toArray()[0].nativeElement);
    //       Obj.videoJSplayer
    //       return callback(Obj.videoJSplayer)
    //     })
        
    //   }
    //   callback(this.videoJSplayer);
    // }    
    
    set_video_player_src(callback)
    {
      console.log("get_video_player()");
      
      if(!this.videoJSplayer)
      {
        this.loaded = true;
        let Obj = this;
        console.log(`loaded = ${this.loaded}`)
        
        setTimeout(() =>
        {
          console.log(`video=`)
          console.log(Obj.video.toArray())
          Obj.videoJSplayer = videojs(Obj.video.toArray()[0].nativeElement);
          console.log("setting src if");
          Obj.videoUrl = Obj.urls[Obj.currentIndex].url;
          Obj.videoJSplayer.src(
          {
            type: "video/mp4",
            src: Obj.urls[Obj.currentIndex].url
          });
          return callback(Obj.videoJSplayer)
        });
        
      }
      else
      {
        setTimeout(() =>
        {
          this.videoJSplayer = videojs(this.video.toArray()[0].nativeElement);
          console.log("setting src else");
          this.videoUrl = this.urls[this.currentIndex].url;
          this.videoJSplayer.src(
          {
            type: "video/mp4",
            src: this.urls[this.currentIndex].url
          });
          callback(this.videoJSplayer);
        });
      } 
    }
  
    isImageFile(path : string) : boolean
    {
      return path.match(/.(jpg|jpeg|png|gif)$/i) != null;
    }
    
    isVideoFile(path : string) : boolean
    {
      return path.match(/.(mp4|wmv|webm|flv|avi|3gp|ogg)$/i) != null;
    }

    ngOnDestroy()
    {
      console.log("on destroy")
      if(this.videoJSplayer)
      {
        console.log("videoJSplayer disposed");
        this.videoJSplayer.dispose();
      }
      if(this.imageSubscription)
      {
        console.log("imageSubscription disposed");
        this.imageSubscription.unsubscribe();
      }
    }
    
    // set_video_player_src(callback)
    // {
    //   Obj.get_video_player( (playerNana) =>
    //   {
    //       console.log(playerNana);
    //       if(playerNana)
    //       {
            
    //       }
    //   }
    
  // ngOnInit()
    // {
    //   console.log("on init")
    //   this.tvId = this.route.snapshot.paramMap.get('tvId');
    //   this.image = null;
    //   let Obj = this;
    //   this.auth.get_tv_details(this.tvId).subscribe
    //     (
    //       (tv) => 
    //       {
    //         console.log(tv);
    //         // get urls and initialize array of urls
    //         Obj.urls = tv.data.files.map((f)=>
    //         {
    //           f.url = Obj.url_prefix+f._id; 
    //           f.done = false;
    //           return f;
    //         });
    //         console.log(Obj.urls);
            
    //         Obj.currentIndex = 0;
    //         Obj.loaded = true;
    //         console.log("loaded")
    //         // start the timer
    //         Obj.imageSubscription = timer(1000, 3000).subscribe(()=>
    //         {
    //           // if current url is video
    //           if(Obj.isVideoFile(Obj.urls[Obj.currentIndex].name))
    //           { 
    //             // if( window.innerHeight != screen.height) {
    //             //   // browser is fullscreen
    //             //   console.log("fullscreen da");
    //             //   Obj.toFullScreen();
    //             // }
                
    //             console.log("current item is video");
    //             console.log(`currentIndex = ${Obj.currentIndex}`)
    //             // if video is not yet over, don't do anything
    //             if(!Obj.urls[Obj.currentIndex].done)
    //             {
    //               Obj.image = null; // optional
    //               console.log("video not yet done");
    //             }
    //             else
    //             {
    //               console.log("video done");
    //               // mark current url as not done (so it can play again in next cycle)
    //               Obj.urls[Obj.currentIndex].done = false
    //               // go to next url
    //               Obj.currentIndex = (Obj.currentIndex + 1) % Obj.urls.length;
    //               console.log(`currentIndex = ${Obj.currentIndex}`)
    //             }
    //           }
    //           else
    //           {
    //             console.log("current item is image");
    //             console.log(`currentIndex = ${Obj.currentIndex}`)
    //             // display current image
    //             Obj.image = Obj.urls[Obj.currentIndex].url;
    //             // move on to next url
    //             Obj.currentIndex = (Obj.currentIndex + 1) % Obj.urls.length;
    //             console.log(`currentIndex = ${Obj.currentIndex}`)
    //           }
    //         });
            
    //         setTimeout(()=>
    //         {
    //           console.log("time over.");
    //           this.image = 
    //         });
            
    //       },
    //       (err) => {console.log(err);}
    //     );
    // }
        
    
}
