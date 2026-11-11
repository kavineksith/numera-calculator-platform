// engine/parser/errors.ts
// Strongly-typed mathematical errors used throughout the engine.
// Never expose internal stack traces to end users — callers should catch
// these and convert to user-friendly messages.

export type MathErrorCode =
  | "TOKENIZE_ERROR"
  | "PARSE_ERROR"
  | "EVALUATION_ERROR"
  | "DOMAIN_ERROR"
  | "DIVISION_BY_ZERO"
  | "OVERFLOW"
  | "UNDERFLOW"
  | "INVALID_ARGUMENT"
  | "INVALID_EXPRESSION"
  | "PRECISION_LOSS"
  | "UNKNOWN_FUNCTION"
  | "UNKNOWN_CONSTANT"
  | "UNKNOWN_VARIABLE"
  | "ARITY_MISMATCH"
  | "UNDEFINED_RESULT";

export class MathError extends Error {
  readonly code: MathErrorCode;
  readonly position?: number;
  readonly context?: string;

  constructor(
    code: MathErrorCode,
    message: string,
    options?: { position?: number; context?: string; cause?: unknown }
  ) {
    super(message);
    this.name = "MathError";
    this.code = code;
    if (options?.position !== undefined) this.position = options.position;
    if (options?.context !== undefined) this.context = options.context;
    if (options?.cause !== undefined) (this as { cause?: unknown }).cause = options.cause;
  }

  /** Human-friendly message safe to display in the UI. */
  toUserMessage(): string {
    return this.message;
  }
}

export class TokenizeError extends MathError {
  constructor(message: string, position?: number) {
    super("TOKENIZE_ERROR", message, { position });
    this.name = "TokenizeError";
  }
}

export class ParseError extends MathError {
  constructor(message: string, position?: number) {
    super("PARSE_ERROR", message, { position });
    this.name = "ParseError";
  }
}

export class EvaluationError extends MathError {
  constructor(code: MathErrorCode, message: string, context?: string) {
    super(code, message, { context });
    this.name = "EvaluationError";
  }
}

export function isMathError(e: unknown): e is MathError {
  return e instanceof MathError;
}
