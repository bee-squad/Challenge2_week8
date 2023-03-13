import { Error } from 'mongoose';

export default class APIError {
  constructor(
    readonly path: string | undefined,
    readonly message: string | undefined
  ) {}

  static fromValidationError(
    validationError: Error.ValidationError
  ): APIError[] {
    return Object.values(validationError.errors).map(
      (error) => new APIError(error.path, error.message)
    );
  }

  static errorMessage = (err: unknown): err is { message: string } => {
    if (err && typeof err === 'object' && 'message' in err) {
      return true;
    } else {
      return false;
    }
  };
}
