import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripCarousel } from './trip-carousel';

describe('TripCarousel', () => {
  let component: TripCarousel;
  let fixture: ComponentFixture<TripCarousel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripCarousel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripCarousel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
