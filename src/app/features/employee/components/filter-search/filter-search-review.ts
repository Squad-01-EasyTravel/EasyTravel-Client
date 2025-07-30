import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter-search-review',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-search-review.html',
  styleUrl: './filter-search.css'
})
export class FilterSearchReview {
  isFilterModalOpen = false;

  toggleFilterModal() {
    this.isFilterModalOpen = !this.isFilterModalOpen;
  }

  closeFilterModal() {
    this.isFilterModalOpen = false;
  }
}
