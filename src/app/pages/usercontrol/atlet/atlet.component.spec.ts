import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtletComponent } from './atlet.component';

describe('AtletComponent', () => {
  let component: AtletComponent;
  let fixture: ComponentFixture<AtletComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AtletComponent]
    });
    fixture = TestBed.createComponent(AtletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
