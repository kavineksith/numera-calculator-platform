// engine/tokenizer/token.ts
// Token types for the calculator mathematical expression engine.

export type TokenType =
  | "NUMBER"
  | "IDENTIFIER" // function names, constants
  | "OPERATOR" // + - * / ^ % etc
  | "LPAREN"
  | "RPAREN"
  | "COMMA"
  | "EOF";

export interface Token {
  type: TokenType;
  value: string;
  position: number; // index in source
}

export const TOKEN_TYPE_LABELS: Record<TokenType, string> = {
  NUMBER: "number",
  IDENTIFIER: "identifier",
  OPERATOR: "operator",
  LPAREN: "left paren",
  RPAREN: "right paren",
  COMMA: "comma",
  EOF: "end of input",
};

export function tokenLabel(t: Token): string {
  return `${TOKEN_TYPE_LABELS[t.type]} '${t.value}'`;
}
