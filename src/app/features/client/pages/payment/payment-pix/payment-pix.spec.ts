import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentPix } from './payment-pix';

describe('PaymentPix', () => {
  let component: PaymentPix;
  let fixture: ComponentFixture<PaymentPix>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentPix]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentPix);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
