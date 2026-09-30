export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export const notFound = () => new ApiError(404, "Resource not found.");
