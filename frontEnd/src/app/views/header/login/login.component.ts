import { Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'login-modal',
  templateUrl: './login.component.html'
})

export class LoginComponent {
  @Input() displayModal: boolean;
  @Output() displayModalChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  closeModal() {
    this.displayModal = false;
    this.displayModalChange.emit(this.displayModal); //rendiamo la variabile nel component "padre" false
  }
}
