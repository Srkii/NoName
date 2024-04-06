import { Component } from '@angular/core';

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.css'
})
export class ProjectCardComponent {
  
  cities = [
    { name: 'New York', code: 'NY' },
    { name: 'Los Angeles', code: 'LA' },
    { name: 'Chicago', code: 'CH' },
    { name: 'Houston', code: 'HO' },
    { name: 'Phoenix', code: 'PH' }
  ]

  selectedCities: any[];

  constructor() {
    this.selectedCities = [];
  }
}
