import { type RequestHandler } from "express";
import { ZodError, type ZodIssue, type ZodTypeAny } from "zod";

type Schemas = {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
};

interface ValidationDetail {
  path: string;
  message: string;
  code: string;
}

interface ValidationException extends Error {
  status?: number;
  details?: ValidationDetail[];
}

const formatIssues = (issues: ZodIssue[]): ValidationDetail[] =>
  issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
    code: issue.code,
  }));

const validateRequest = (schemas: Schemas): RequestHandler =>
  (req, _res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query);
        req.query = parsedQuery as typeof req.query;
      }
      if (schemas.params) {
        const parsedParams = schemas.params.parse(req.params);
        req.params = parsedParams as typeof req.params;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError: ValidationException = new Error("Validation failed");
        validationError.status = 400;
        validationError.details = formatIssues(error.issues);
        next(validationError);
      } else {
        next(error);
      }
    }
  };

export default validateRequest;
