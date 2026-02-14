export function apiResponse(success, data = null, message = undefined, errors = undefined) {
  const payload = { success };
  if (data !== undefined) payload.data = data;
  if (message !== undefined) payload.message = message;
  if (errors !== undefined) payload.errors = errors;
  return payload;
}

export function httpError(status, message, errors) {
  const err = new Error(message);
  err.status = status;
  if (errors) err.errors = errors;
  return err;
}

