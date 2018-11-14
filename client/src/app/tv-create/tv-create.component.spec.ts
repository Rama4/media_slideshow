import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TvCreateComponent } from './tv-create.component';

describe('TvCreateComponent', () => {
  let component: TvCreateComponent;
  let fixture: ComponentFixture<TvCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TvCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TvCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
