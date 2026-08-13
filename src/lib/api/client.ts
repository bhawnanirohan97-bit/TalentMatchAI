export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function delay(ms = 350): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function notFound(message = "Resource not found"): never {
  throw new ApiError(404, message, "NOT_FOUND");
}

export function forbidden(message = "You do not have permission to do this"): never {
  throw new ApiError(403, message, "FORBIDDEN");
}

export function unauthorized(message = "You must be signed in"): never {
  throw new ApiError(401, message, "UNAUTHORIZED");
}

export function conflict(message: string): never {
  throw new ApiError(409, message, "CONFLICT");
}

export function validationError(message: string): never {
  throw new ApiError(400, message, "VALIDATION_ERROR");
}

export function ok<T>(data: T, ms = 350): Promise<T> {
  return delay(ms).then(() => data);
}

export function paginate<T>(items: T[], page = 1, pageSize = 10) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}
