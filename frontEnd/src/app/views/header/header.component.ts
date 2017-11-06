import { Component } from '@angular/core';
import { MODALTYPE } from './login/login.component'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})

export class HeaderComponent {
  displayModal = false;
  public modalType: MODALTYPE;

  signIn() {
    this.displayModal = true;
    this.modalType = MODALTYPE.LOGIN;
  }
  signUp() {
    this.displayModal = true;
    this.modalType = MODALTYPE.REGISTRATION;
  }
}
