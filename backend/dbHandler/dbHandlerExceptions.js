class IncorrectPasswordLengthException extends Error {}
class PasswordsNotEqualsException extends Error {}
class IncorrectLoginException extends Error {}
class UsernameAlreadyExistException extends Error {}
class RouteNotFoundException extends Error {}
class AlreadySavedRouteException extends Error {}
class AlreadyExistingFilterException extends Error {}
class NotExistingFilterException extends Error {}
class FailedDatabaseQueryException extends Error {}
class EmptyDatabaseException extends Error {}

module.exports = {
  IncorrectPasswordLengthException: IncorrectPasswordLengthException,
  PasswordsNotEqualsException: PasswordsNotEqualsException,
  UsernameAlreadyExistException: UsernameAlreadyExistException,
  IncorrectLoginException: IncorrectLoginException,
  RouteNotFoundException: RouteNotFoundException,
  AlreadySavedRouteException: AlreadySavedRouteException,
  AlreadyExistingFilterException: AlreadyExistingFilterException,
  NotExistingFilterException: NotExistingFilterException,
  FailedDatabaseQueryException: FailedDatabaseQueryException,
  EmptyDatabaseException: EmptyDatabaseException
}
