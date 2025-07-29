import { Component } from '@angular/core';
import { Navbar } from '../../../../../shared/navbar/navbar';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [Navbar, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  standalone: true
})
export class Profile {

}
