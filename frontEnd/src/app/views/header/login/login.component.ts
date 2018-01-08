import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UserLogin } from '@shared/userlogin.model'
import { LoginService } from '@shared/login.service'
import { SessionService, UserSession } from '@shared/session.service';
//import { UserSession } from '@shared/usersession.model'
const PASSWORD_MIN_LENGTH_ERROR = "La password deve essere di almeno 5 caratteri";
const PASSWORD_NOT_MATCHING_ERROR = "Le password non corrispondono"
const USER_ALREADY_EXIST_ERROR = "Nome utente non disponibile"
const INCORRECT_LOGIN_ERROR = "Nome utente o password non corretti"

@Component({
  selector: 'login-modal',
  templateUrl: './login.component.html'
})

export class LoginComponent {
  @Input() displayModal: boolean;
  @Input() modalType: MODALTYPE;
  @Output() modalClosed: EventEmitter<UserSession> = new EventEmitter<UserSession>();

  user = new UserLogin('', '', '');
  MODALTYPEENUM = MODALTYPE;

  erroreCorrente = "";

  constructor(private loginService: LoginService, private sessionService: SessionService) { }
  signIn(userCredentials: UserLogin) {
    this.erroreCorrente = "";
    this.loginService.signIn(userCredentials).subscribe(
      (result: any) => {
        if (!result.Return) {
          if (result.error == "INCORRECT_LOGIN")
            this.erroreCorrente = INCORRECT_LOGIN_ERROR;
          return;
        }
        this.sessionService.login(result.user.username, result.loginToken, result.user.savedRoutes, result.user.savedFilters);
        this.closeModal();
      },
      err => console.log(err)
    );
  }

  signUp(userCredentials: UserLogin) {
    this.erroreCorrente = "";
    this.loginService.signUp(userCredentials).subscribe(
      (result: any) => {
        if (!result.Return) {
          if (result.error == "PASSWORD_MIN_LENGTH")
            this.erroreCorrente = PASSWORD_MIN_LENGTH_ERROR;
          if (result.error == "PASSWORD_NOT_MATCHING")
            this.erroreCorrente = PASSWORD_NOT_MATCHING_ERROR;
          if (result.error == "USER_ALREADY_EXIST")
            this.erroreCorrente = USER_ALREADY_EXIST_ERROR;
          return;
        }
        this.sessionService.login(result.user.username, result.loginToken, result.user.savedRoutes, result.user.savedFilters);
        this.closeModal();
      },
      err => console.log(err)
    );
  }

  closeModal() {
    this.erroreCorrente = "";
    this.displayModal = false;
    this.modalClosed.emit(this.sessionService.getSession());
  }
}

export enum MODALTYPE {
  LOGIN,
  REGISTRATION
}
