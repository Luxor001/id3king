import { Component } from '@angular/core';
import { MODALTYPE } from './login/login.component'
import { SessionService, UserSession } from '@shared/session.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})

export class HeaderComponent {
  displayModal = false;
  modalType: MODALTYPE;
  userSession: UserSession;

  constructor(public sessionService: SessionService) { }
  signIn() {
    this.displayModal = true;
    this.modalType = MODALTYPE.LOGIN;
  }
  signUp() {
    this.displayModal = true;
    this.modalType = MODALTYPE.REGISTRATION;
  }
  logout() {
    this.sessionService.logout();
    this.userSession = null;
  }
  modalClosed(userSession: UserSession) {
    this.userSession = userSession;
    this.displayModal = false;
  }
}
