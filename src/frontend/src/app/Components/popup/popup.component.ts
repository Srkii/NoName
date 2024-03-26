import { Component, Input } from '@angular/core';
import { ProjectTask } from '../../Entities/ProjectTask';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css'],
})
export class PopupComponent {
  @Input() task: ProjectTask | null = null;

  constructor() {}

  ngOnInit(): void {}
}
