import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcaraperlombaanComponent } from './acaraperlombaan.component';

describe('AcaraperlombaanComponent', () => {
  let component: AcaraperlombaanComponent;
  let fixture: ComponentFixture<AcaraperlombaanComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AcaraperlombaanComponent]
    });
    fixture = TestBed.createComponent(AcaraperlombaanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
