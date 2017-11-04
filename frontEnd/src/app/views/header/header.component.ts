import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})

export class HeaderComponent {
  displayModal = false;
  signIn() {
    this.displayModal = true;
  }
}
