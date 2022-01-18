import httpStatusCodes from 'http-status-codes';
import CustomAPIError from './CustomAPIError';
export default class UnAuthorizedError extends CustomAPIError {
  constructor(message: string) {
    super(message, httpStatusCodes.UNAUTHORIZED);
  }
}