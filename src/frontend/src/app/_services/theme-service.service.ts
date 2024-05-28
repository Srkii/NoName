import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeServiceService {
  public isDarkTheme = false;

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.isDarkTheme = localStorage.getItem('isDarkTheme') === 'true';
   }

  switchTheme() {
    let themeLink = this.document.getElementById('app-theme') as HTMLLinkElement;
    let ganttLink = this.document.getElementById('gant-theme') as HTMLLinkElement;

    this.isDarkTheme = !this.isDarkTheme;
    localStorage.setItem('isDarkTheme', this.isDarkTheme.toString());
    this.document.body.setAttribute('data-theme', this.isDarkTheme ? 'dark' : 'light');
    
    if (themeLink) {
      themeLink.href = this.isDarkTheme ? 'ng-dark-purple.css' : 'ng-light-purple.css';
      ganttLink.href = this.isDarkTheme ? 'ngx-gantt-dark.scss' : 'ngx-gantt-light.scss';
    }
  }

  applyTheme(isDarkTheme: boolean): void {
    this.isDarkTheme = isDarkTheme;
    this.document.body.setAttribute('data-theme', this.isDarkTheme ? 'dark' : 'light');
    let themeLink = this.document.getElementById('app-theme') as HTMLLinkElement;
    let ganttLink = this.document.getElementById('gant-theme') as HTMLLinkElement;
    if (themeLink) {
      themeLink.href = this.isDarkTheme ? 'ng-dark-purple.css' : 'ng-light-purple.css';
      ganttLink.href = this.isDarkTheme ? 'ngx-gantt-dark.scss' : 'ngx-gantt-light.scss';
    }
  }

  isDarkMode(): boolean {
    return this.isDarkTheme;
  }

}
