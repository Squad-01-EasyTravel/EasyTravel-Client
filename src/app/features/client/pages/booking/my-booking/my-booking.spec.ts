import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyBooking } from './my-booking';

describe('MyBooking', () => {
  let component: MyBooking;
  let fixture: ComponentFixture<MyBooking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyBooking]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyBooking);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
