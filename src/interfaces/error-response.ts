import type MessageResponse from "./message-response.js";

type ErrorResponse = {
  stack?: string;
  details?: any;
} & MessageResponse;
export default ErrorResponse;
