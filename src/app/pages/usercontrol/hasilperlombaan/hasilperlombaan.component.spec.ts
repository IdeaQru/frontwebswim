import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HasilperlombaanComponent } from './hasilperlombaan.component';

describe('HasilperlombaanComponent', () => {
  let component: HasilperlombaanComponent;
  let fixture: ComponentFixture<HasilperlombaanComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HasilperlombaanComponent]
    });
    fixture = TestBed.createComponent(HasilperlombaanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
