import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiconfiguratorComponent } from './uiconfigurator.component';

describe('UiconfiguratorComponent', () => {
  let component: UiconfiguratorComponent;
  let fixture: ComponentFixture<UiconfiguratorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UiconfiguratorComponent]
    });
    fixture = TestBed.createComponent(UiconfiguratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
