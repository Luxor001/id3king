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

  user = new UserLogin('','','');
  MODALTYPEENUM = MODALTYPE;

  constructor(private loginService: LoginService) {}
  login() {

  }
  signUp(userCredentials: UserLogin) {
    this.loginService.signUp(userCredentials).subscribe(
      (prova: any) => {

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
