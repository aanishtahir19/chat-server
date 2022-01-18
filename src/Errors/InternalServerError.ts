import httpStatusCodes from 'http-status-codes';
import CustomAPIError from './CustomAPIError';
export default class InternalServerError extends CustomAPIError {
  constructor(message: string) {
    super(message, httpStatusCodes.INTERNAL_SERVER_ERROR);
  }
}