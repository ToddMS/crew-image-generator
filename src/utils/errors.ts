export class AppError extends Error {
    constructor(
      message: string,
      public statusCode: number = 500,
      public originalError?: any
    ) {
      super(message);
      this.name = this.constructor.name;
    }
  }
  
  export class DatabaseError extends AppError {
    constructor(message: string, originalError?: any) {
      super(message, 500, originalError);
    }
  }