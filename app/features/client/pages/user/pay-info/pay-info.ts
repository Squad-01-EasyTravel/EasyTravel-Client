import { Component } from '@angular/core';
import { Navbar } from '../../../../../shared/navbar/navbar';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pay-info',
  imports: [Navbar, RouterLink],
  templateUrl: './pay-info.html',
  styleUrl: './pay-info.css'
})
export class PayInfo {

}
