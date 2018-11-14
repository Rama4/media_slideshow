import { Component, OnInit, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { VgAPI } from 'videogular2/core';
import { AuthenticationService } from '../authentication.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { timer, Subscription } from 'rxjs';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {
  
    urls = [];
    currentIndex : number = -1;
    currentItem = null;
    api: VgAPI;
    tvId: string;
    url_prefix : string = "https://angular-dev-rama4.c9users.io/api/download/";

    selectedIndex : number = 0;
    imageSubscription: Subscription = null;
    loaded = false;
    
    sliderArray;
    image;
    
    
    @ViewChildren('video') video: QueryList<ElementRef>;

    toFullScreen()
    {
      // if(!this.video || this.video.toArray().length == 0)
        // return;
      // console.log(this.media)
      let elem = this.video.toArray()[0].nativeElement as HTMLVideoElement;
      if (elem.requestFullscreen)
      {
        elem.requestFullscreen();
      } 
      // else if (elem.mozRequestFullScreen) {
      //   elem.mozRequestFullScreen();
      // } else if (elem.webkitRequestFullscreen) {
      //   elem.webkitRequestFullscreen();
      // }
    }
    
      
    constructor(private route: ActivatedRoute, private auth: AuthenticationService){}

    ngOnInit()
    {
      this.tvId = this.route.snapshot.paramMap.get('tvId');
      this.image = null;
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
              f.done = false;
              return f;
            });
            console.log(Obj.urls);
            
            Obj.currentIndex = 0;
            Obj.loaded = true;
            // start the timer
            Obj.imageSubscription = timer(1000, 3000).subscribe(()=>
            {
              // if current url is video
              if(Obj.isVideoFile(Obj.urls[Obj.currentIndex].name))
              { 
                // if( window.innerHeight != screen.height) {
                //   // browser is fullscreen
                //   console.log("fullscreen da");
                //   Obj.toFullScreen();
                // }
                
                console.log("init current item is video");
              
                // if video is not yet over, don't do anything
                if(!Obj.urls[Obj.currentIndex].done)
                {
                  Obj.image = null; // optoinal
                  console.log("init video not yet done");
                }
                else
                { 
                  console.log("init video done");
                  // mark current url as not done (so it can play again in next cycle)
                  Obj.urls[Obj.currentIndex].done = !Obj.urls[Obj.currentIndex].done;
                  // go to next url
                  Obj.currentIndex = (Obj.currentIndex + 1) % Obj.urls.length;
                }
              }
              else
              { 
                console.log("init current item is image");
                // disp;lay current image
                Obj.image = Obj.urls[Obj.currentIndex].url;
                // move on to next url
                Obj.currentIndex = (Obj.currentIndex + 1) % Obj.urls.length;
              }
            }); 
          },
          (err) => {console.log(err);}
        );
    }
    
    
    ngOnDestroy()
    {
        this.imageSubscription.unsubscribe();
    }
    
    isImageFile(path : string) : boolean
    {
      return path.match(/.(jpg|jpeg|png|gif)$/i) != null;
    }
    
    isVideoFile(path : string) : boolean
    {
      return path.match(/.(mp4|wmv|webm|flv|avi|3gp|ogg)$/i) != null;
    }
    
    // video player controle
    onPlayerReady(api: VgAPI)
    {
      console.log("player ready");
      console.log(this.urls.length)
        this.api = api;
        this.api.getDefaultMedia().subscriptions.loadedMetadata.subscribe(this.playVideo.bind(this));
        this.api.getDefaultMedia().subscriptions.ended.subscribe(this.nextVideo.bind(this));
    }
    
    get_current_item()
    {
      console.log("get_current_item")
      if(this.currentIndex < 0)console.log("Error! index cannot be negative");
      return this.urls[this.currentIndex].url;
      
    }

    nextVideo()
    {
        console.log(`nextvideo:`);
        this.urls[this.currentIndex].done = !this.urls[this.currentIndex].done;
        console.log(this.urls);
        this.currentIndex = (this.currentIndex+1)%(this.urls.length); // optional
    }

    playVideo()
    {
      console.log("play video");
        this.api.play();
    }
}
