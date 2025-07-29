import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-search.html',
  styleUrl: './filter-search.css'
})
export class FilterSearch {
  isFilterModalOpen = false;

  toggleFilterModal() {
    this.isFilterModalOpen = !this.isFilterModalOpen;
  }

  closeFilterModal() {
    this.isFilterModalOpen = false;
  }
}
