import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeServiceService {
  private isDarkTheme = false;

  constructor(@Inject(DOCUMENT) private document: Document) { }

  private isLightTheme = true;

  switchTheme() {
    let themeLink = this.document.getElementById('app-theme') as HTMLLinkElement;

    this.isDarkTheme = !this.isDarkTheme;
    this.document.body.setAttribute('data-theme', this.isDarkTheme ? 'dark' : 'light');
    
    if (themeLink) {
      themeLink.href = this.isLightTheme ? 'lara-dark-purple.css' : 'tihomir-light-purple.css';
      this.isLightTheme = !this.isLightTheme;
    }
  }

  isDarkMode(): boolean {
    return this.isDarkTheme;
  }

}
