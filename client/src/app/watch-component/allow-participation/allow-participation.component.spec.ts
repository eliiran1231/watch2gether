import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllowParticipationComponent } from './allow-participation.component';

describe('AllowParticipationComponent', () => {
  let component: AllowParticipationComponent;
  let fixture: ComponentFixture<AllowParticipationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllowParticipationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllowParticipationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
