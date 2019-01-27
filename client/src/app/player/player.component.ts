import { Component, OnInit } from '@angular/core';
import { VgAPI } from 'videogular2/core';
import { AuthenticationService } from '../authentication.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

enum MediaType {
  IMG,
  VID,
  URL,
  PPT,
  ERR
};

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {
  
    playlist = [];
    currentIndex : number = 0;
    Videogular2api : VgAPI;
    tvId : string;
    url_prefix : string = "https://angular-dev-rama4.c9users.io/api/download/";
    loaded : boolean = false;
    image = null;
    timeOutIDs : number[] = []; // stores all subscriptions that need to be undone during ngOnDestroy
    imageTimeout : number = 3000; // default timeout is 3s
    
    constructor(private route: ActivatedRoute, private auth: AuthenticationService){}
    
    ngOnInit()
    {
      // store 'this' in an object, so we can access it in the subscription
      let Obj = this;
      // get playlist from server
      this.tvId = this.route.snapshot.paramMap.get('tvId');
      this.auth.get_tv_details(this.tvId).subscribe
        (
          (tv) => 
          {
            // get playlist and add another key "url" to each item
            Obj.playlist = tv.data.files.map((f)=>
            {
              f.url = Obj.url_prefix+f._id; 
              return f;
            });
            Obj.print("ngOnInit: playlist=", Obj.playlist);
            Obj.currentIndex = 0;
            Obj.loaded = true;
              
            // start playing afer 1s ( so that img and video are present, afer 'loaded' = true)
            // add subscription for ngOnDestroy    
            Obj.timeOutIDs.push( setTimeout(() =>
            {
              console.log("loaded")
              Obj.dispPlaylistItem(); 
              // if first item is video, play it
              Obj.playVideo();
            }, 1000));
          },
          (err) => {console.log(err);}
        );
    }
    
    // prints a variable name, with its value
    print(str,variable)
    {
      console.log(`${str} ${JSON.stringify(variable, null, 4)}`);
    }
    
    dispPlaylistItem()
    {
        this.print(`dispPlaylistItem: currentIndex=`, this.currentIndex);
        if(this.getMediaType(this.playlist[this.currentIndex].name) == MediaType.VID)
        {
            console.log("dispPlaylistItem: video")
            this.image = null;              
        }
        else if(this.getMediaType(this.playlist[this.currentIndex].name) == MediaType.IMG)
        {
            console.log("dispPlaylistItem: image")
            this.image = this.playlist[this.currentIndex].url;
            // go to next item after 'imageTimeout' seconds
            this.timeOutIDs.push( setTimeout( () =>
            {
              console.log("dispPlaylistItem: img time over. moving to next item");
              this.currentIndex = (this.currentIndex+1)%(this.playlist.length);
              // go to next item
              this.dispPlaylistItem();
            }, this.imageTimeout));
        }
        else
        {
          console.log("dispPlaylistItem: Error: unknown file type!")
        }
    }
    
    getMediaType(path: string) : number
    {
      if(path.match(/.(jpg|jpeg|png|gif)$/i))
        return MediaType.IMG;
      if(path.match(/.(mp4|wmv|webm|flv|avi|3gp|ogg)$/i))
        return MediaType.VID;
      return MediaType.ERR;
    }
    
    //----------------------------------------
    // video player controle
    //----------------------------------------
    onPlayerReady(api: VgAPI)
    {
        console.log("onPlayerReady");
        this.Videogular2api = api;
        this.Videogular2api.getDefaultMedia().subscriptions.loadedMetadata.subscribe(this.playVideo.bind(this));
        this.Videogular2api.getDefaultMedia().subscriptions.ended.subscribe(this.nextVideo.bind(this));
    }
    
    get_current_item()
    {
        if(this.currentIndex < 0)console.log("get_current_item: Error! index cannot be negative");
        return this.playlist[this.currentIndex].url;
    }

    nextVideo()
    {   // when current video has ended, move to next item
        this.currentIndex = (this.currentIndex+1)%(this.playlist.length);
        this.print(`nextvideo: currentIndex=`, this.currentIndex)
        
        if(this.getMediaType(this.playlist[this.currentIndex].name) == MediaType.IMG)
        {
          console.log("nextvideo: next is image")
          this.image = "abc";
          this.dispPlaylistItem();
        }
        else if(this.getMediaType(this.playlist[this.currentIndex].name) == MediaType.VID)
        {
          console.log("nextvideo: next is video")
          this.image = null;
          this.dispPlaylistItem();
          // if there is only 1 item in the playlist, and its a video, play() it.
          if(this.playlist.length == 1)
            this.playVideo();
        }
    }

    playVideo()
    {
        console.log("playVideo");
        this.Videogular2api.play();
    }
    
    ngOnDestroy()
    {   // destroy all subscriptions
        this.timeOutIDs.forEach(id =>
        {
          clearTimeout(id);
          this.print(`ngOnDestroy: clearTimeout id=`,id)
        });
    }
    
    
}