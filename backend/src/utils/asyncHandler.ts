import { RequestHandler, Request, Response, NextFunction } from 'express';

const asyncHandler = <T extends RequestHandler>(requestHandler: T): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) => {
      console.log(error)
      // return next(error)
      return res.status(error.statusCode).json({
        statusCode: error.statusCode,
        message: error.message,
        success: false,
        errors: error.errors
      })
    }
    );
  };
};

export { asyncHandler };