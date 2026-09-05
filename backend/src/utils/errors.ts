export * from '../core/errors.js';

export class BadRequestError extends Error {
  constructor(public message: string = 'Bad request') {
    super(message);
    this.name = 'BadRequestError';
  }
}
