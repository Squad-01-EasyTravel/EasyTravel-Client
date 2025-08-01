import { Sidebar } from '@/app/features/employee/components/sidebar/sidebar';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  imports: [Sidebar, RouterOutlet],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard {

}
