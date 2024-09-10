import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NomorperlombaanComponent } from './nomorperlombaan.component';

describe('NomorperlombaanComponent', () => {
  let component: NomorperlombaanComponent;
  let fixture: ComponentFixture<NomorperlombaanComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NomorperlombaanComponent]
    });
    fixture = TestBed.createComponent(NomorperlombaanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
