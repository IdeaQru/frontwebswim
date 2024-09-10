import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputhasilComponent } from './inputhasil.component';

describe('InputhasilComponent', () => {
  let component: InputhasilComponent;
  let fixture: ComponentFixture<InputhasilComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InputhasilComponent]
    });
    fixture = TestBed.createComponent(InputhasilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
