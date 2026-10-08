export const ApiStatus = {
  success: 200,
  error: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  methodNotAllowed: 405,
  requestTimeout: 408,
  internalServerError: 500,
  notImplemented: 501,
  badGateway: 502,
  serviceUnavailable: 503,
  gatewayTimeout: 504,
  httpVersionNotSupported: 505,
};

export const ResultEnum = {
  SUCCESS: 0,
  ERROR: 1,
  EXCEPTION: -1,
  UNAUTHORIZED: 10403,
  TOKEN_EXPIRED: 10401,
};
