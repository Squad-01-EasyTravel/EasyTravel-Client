import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewManagement } from './review-management';

describe('ReviewManagement', () => {
  let component: ReviewManagement;
  let fixture: ComponentFixture<ReviewManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
