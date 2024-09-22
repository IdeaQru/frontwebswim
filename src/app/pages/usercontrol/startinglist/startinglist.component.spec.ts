import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartingListComponent } from './startinglist.component';

describe('StartinglistComponent', () => {
  let component: StartinglistComponent;
  let fixture: ComponentFixture<StartinglistComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StartinglistComponent]
    });
    fixture = TestBed.createComponent(StartinglistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
