import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoJsPlayerComponent } from './video-js-player.component';

describe('VideoJsPlayerComponent', () => {
  let component: VideoJsPlayerComponent;
  let fixture: ComponentFixture<VideoJsPlayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoJsPlayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoJsPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
