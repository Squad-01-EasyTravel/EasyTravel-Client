import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter-search-package',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-search-package.html',
  styleUrl: './filter-search.css'
})
export class FilterSearchPackage {
  isFilterModalOpen = false;

  toggleFilterModal() {
    this.isFilterModalOpen = !this.isFilterModalOpen;
  }

  closeFilterModal() {
    this.isFilterModalOpen = false;
  }
}
