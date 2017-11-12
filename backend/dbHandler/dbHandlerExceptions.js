class IncorrectPasswordLengthException extends Error {}
class PasswordsNotEqualsException extends Error {}
class IncorrectLoginException extends Error {}
class UsernameAlreadyExistException extends Error {}

module.exports = {
  IncorrectPasswordLengthException: IncorrectPasswordLengthException,
  PasswordsNotEqualsException: PasswordsNotEqualsException,
  UsernameAlreadyExistException: UsernameAlreadyExistException,
  IncorrectLoginException: IncorrectLoginException
}
