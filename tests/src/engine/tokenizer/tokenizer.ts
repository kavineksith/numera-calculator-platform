// engine/tokenizer/tokenizer.ts
// Converts an expression string into a stream of tokens.
// Supports:
//   - integers, decimals, scientific notation (1.5E3, 2.5e-2)
//   - identifiers (function names / constants) [a-zA-Z_][a-zA-Z0-9_]*
//   - operators: + - * / ^ % ! (unary ! is factorial postfix)
//   - parentheses, commas
//   - implicit multiplication marker handled by parser (e.g. 2(3+1), 2pi)

import { Token, TokenType } from "./token";
import { TokenizeError } from "../parser/errors";

const OPERATORS = new Set(["+", "-", "*", "/", "^", "%", "!"]);

export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = source.length;

  while (i < n) {
    const ch = source[i];

    // skip whitespace
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }

    // number — integer, decimal, scientific notation
    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(source[i + 1] ?? ""))) {
      let j = i;
      let sawDot = false;
      let sawE = false;
      while (j < n) {
        const c = source[j];
        if (/[0-9]/.test(c)) {
          j += 1;
          continue;
        }
        if (c === "." && !sawDot && !sawE) {
          sawDot = true;
          j += 1;
          continue;
        }
        if ((c === "e" || c === "E") && !sawE) {
          // peek next to ensure it's exponent
          const next = source[j + 1];
          if (/[0-9]/.test(next ?? "") || ((next === "+" || next === "-") && /[0-9]/.test(source[j + 2] ?? ""))) {
            sawE = true;
            j += 1;
            if (next === "+" || next === "-") j += 1;
            continue;
          }
          break;
        }
        break;
      }
      const value = source.slice(i, j);
      // final validation
      if (!/^[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?$/.test(value) && !/^[0-9]+\.?[0-9]*([eE][+-]?[0-9]+)?$/.test(value)) {
        throw new TokenizeError(`Invalid number '${value}'`, i);
      }
      tokens.push({ type: "NUMBER", value, position: i });
      i = j;
      continue;
    }

    // identifier
    if (/[a-zA-Z_]/.test(ch)) {
      let j = i;
      while (j < n && /[a-zA-Z0-9_]/.test(source[j])) j += 1;
      const value = source.slice(i, j);
      tokens.push({ type: "IDENTIFIER", value, position: i });
      i = j;
      continue;
    }

    // operators (single-char). Note: "!" handled here as a postfix operator.
    if (OPERATORS.has(ch)) {
      tokens.push({ type: "OPERATOR", value: ch, position: i });
      i += 1;
      continue;
    }

    // multi-char operators: << >>
    if (ch === "<" && source[i + 1] === "<") {
      tokens.push({ type: "OPERATOR", value: "<<", position: i });
      i += 2;
      continue;
    }
    if (ch === ">" && source[i + 1] === ">") {
      tokens.push({ type: "OPERATOR", value: ">>", position: i });
      i += 2;
      continue;
    }

    if (ch === "(") {
      tokens.push({ type: "LPAREN", value: ch, position: i });
      i += 1;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "RPAREN", value: ch, position: i });
      i += 1;
      continue;
    }
    if (ch === ",") {
      tokens.push({ type: "COMMA", value: ch, position: i });
      i += 1;
      continue;
    }

    throw new TokenizeError(`Unexpected character '${ch}'`, i);
  }

  tokens.push({ type: "EOF", value: "", position: n });
  return tokens;
}
