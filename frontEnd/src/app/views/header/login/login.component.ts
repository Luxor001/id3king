import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UserLogin } from '@shared/userlogin.model'
import { LoginService } from '@shared/login.service'

@Component({
  selector: 'login-modal',
  templateUrl: './login.component.html'
})

export class LoginComponent {
  @Input() displayModal: boolean;
  @Input() modalType: MODALTYPE;
  @Output() displayModalChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  user = new UserLogin('', '', '');
  MODALTYPEENUM = MODALTYPE;

  erroreCorrente = "";
  const PASSWORD_MIN_LENGTH_ERROR = "La password deve essere di almeno 5 caratteri";
  const PASSWORD_NOT_MATCHING_ERROR = "Le password non corrispondono"
  const USER_ALREADY_EXIST_ERROR = "Nome utente non disponibile"

  constructor(private loginService: LoginService) { }
  signIn(userCredentials: UserLogin) {
    this.loginService.signIn(userCredentials).subscribe(
      (result: any) => {
        if (!result.Return) {
          // TODO: gestione errore...
        }
        // TODO: settare token per utente
      },
      err => console.log(err)
    );
  }

  signUp(userCredentials: UserLogin) {
    erroreCorrente = "";
    this.loginService.signUp(userCredentials).subscribe(
      (result: any) => {
        if (!result.Return) {
          if (result.error == "PASSWORD_MIN_LENGTH")
            this.erroreCorrente = this.PASSWORD_MIN_LENGTH_ERROR;
          if (result.error == "PASSWORD_NOT_MATCHING")
            this.erroreCorrente = this.PASSWORD_NOT_MATCHING_ERROR;
          if (result.error == "USER_ALREADY_EXIST")
            this.erroreCorrente = this.USER_ALREADY_EXIST_ERROR;
        }
        // TODO: settare token per utente
      },
      err => console.log(err)
    );
  }

  closeModal() {
    this.displayModal = false;
    this.displayModalChange.emit(this.displayModal); //rendiamo la variabile nel component "padre" false
  }
}

export enum MODALTYPE {
  LOGIN,
  REGISTRATION
}
