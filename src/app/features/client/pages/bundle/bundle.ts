import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from './card/card';
import { Filter } from './filter/filter';
import { Navbar } from '../../../../shared/navbar/navbar';
import { Footer } from '../../../../shared/footer/footer';


@Component({
  selector: 'app-bundle',
  imports: [CommonModule, Card, Filter, Navbar, Footer],
  templateUrl: './bundle.html',
  styleUrl: './bundle.css'
})
export class Bundle {

}
