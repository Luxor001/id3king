// Oggetto di scambio credenziali client-->server
export class UserLogin {
  constructor(public username: string,
    public password: string,
    public passwordConfirm: string) { }
}
