import { Sidebar } from '@/app/features/employee/components/sidebar/sidebar';
import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  imports: [Sidebar, RouterOutlet],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard {
  @ViewChild('sidebar') sidebar!: Sidebar;

  toggleSidebar() {
    this.sidebar.toggleSidebar();
  }
}
