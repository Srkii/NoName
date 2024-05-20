import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeServiceService {

  constructor(@Inject(DOCUMENT) private document: Document) { }

  private isLightTheme = true;
  switchTheme() {
    let themeLink = this.document.getElementById('app-theme') as HTMLLinkElement;
    if (themeLink) {
      themeLink.href = this.isLightTheme ? 'lara-dark-purple.css' : 'tihomir-light-purple.css';
      this.isLightTheme = !this.isLightTheme;
    }
  }
}
