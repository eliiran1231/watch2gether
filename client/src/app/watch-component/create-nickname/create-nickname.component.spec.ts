import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNicknameComponent } from './create-nickname.component';

describe('CreateNicknameComponent', () => {
  let component: CreateNicknameComponent;
  let fixture: ComponentFixture<CreateNicknameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateNicknameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateNicknameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
