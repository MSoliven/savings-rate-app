import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MillionaireNextDoorComponent } from './millionaire-next-door.component';

describe('MillionaireNextDoorComponent', () => {
  let component: MillionaireNextDoorComponent;
  let fixture: ComponentFixture<MillionaireNextDoorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MillionaireNextDoorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MillionaireNextDoorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
