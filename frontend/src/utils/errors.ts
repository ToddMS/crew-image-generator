export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public originalError?: Error | unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error | unknown) {
    super(message, 500, originalError);
  }
}
