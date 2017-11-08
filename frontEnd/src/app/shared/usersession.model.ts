// questa classe contiene alcune informazioni sulla login utente corrente
export class UserSession {
  constructor(public username: string,
    public loginToken: string) {
  }
}
