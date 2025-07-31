import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsBundle } from './details-bundle';

describe('DetailsBundle', () => {
  let component: DetailsBundle;
  let fixture: ComponentFixture<DetailsBundle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsBundle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsBundle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
