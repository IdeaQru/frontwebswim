import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BukuAcaraComponent } from './buku-acara.component';

describe('BukuAcaraComponent', () => {
  let component: BukuAcaraComponent;
  let fixture: ComponentFixture<BukuAcaraComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BukuAcaraComponent]
    });
    fixture = TestBed.createComponent(BukuAcaraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
