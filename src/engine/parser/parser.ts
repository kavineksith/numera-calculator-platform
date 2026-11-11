// engine/parser/parser.ts
// Recursive-descent parser using precedence climbing.
// Grammar:
//   expression  := additive
//   additive    := multiplicative (('+' | '-' | 'mod' | 'and' | 'or' | 'xor' | '<<' | '>>') multiplicative)*
//   multiplicative := unary (('*' | '/' | '%') unary)*
//   unary       := ('-' | '+' | 'not') unary | power
//   power       := postfix ('^' unary)?         // right-associative
//   postfix     := primary ('!')*
//   primary     := NUMBER | CONSTANT | VARIABLE | funcCall | '(' expression ')'
//   funcCall    := IDENTIFIER '(' [expression (',' expression)*] ')'
//
// Implicit multiplication: 2(3+1) -> 2 * (3+1), 2pi -> 2 * pi, etc.

import { tokenize } from "../tokenizer/tokenizer";
import { Token } from "../tokenizer/token";
import { ParseError } from "./errors";
import { AstNode } from "./ast";

// Binary operator precedence (higher binds tighter).
const BINARY_PRECEDENCE: Record<string, number> = {
  or: 1,
  xor: 2,
  and: 3,
  "<<": 4,
  ">>": 4,
  "+": 5,
  "-": 5,
  mod: 6,
  "*": 7,
  "/": 7,
  "%": 7,
  "^": 9, // right-associative (handled specially)
};

const RIGHT_ASSOCIATIVE = new Set(["^"]);

const IDENTIFIER_AS_BINARY_OP = new Set(["mod", "and", "or", "xor"]);

export class Parser {
  private tokens: Token[];
  private pos = 0;

  constructor(source: string) {
    this.tokens = tokenize(source);
  }

  parse(): AstNode {
    const node = this.parseExpression();
    if (this.peek().type !== "EOF") {
      throw new ParseError(
        `Unexpected token '${this.peek().value}' after expression`,
        this.peek().position
      );
    }
    return node;
  }

  private peek(offset = 0): Token {
    return this.tokens[Math.min(this.pos + offset, this.tokens.length - 1)];
  }

  private consume(): Token {
    const t = this.tokens[this.pos];
    if (this.pos < this.tokens.length - 1) this.pos += 1;
    return t;
  }

  private expect(type: Token["type"]): Token {
    const t = this.peek();
    if (t.type !== type) {
      throw new ParseError(`Expected ${type} but got '${t.value || "EOF"}'`, t.position);
    }
    return this.consume();
  }

  private parseExpression(): AstNode {
    return this.parseBinary(0);
  }

  // precedence climbing
  private parseBinary(minPrec: number): AstNode {
    let left = this.parseUnary();

    while (true) {
      const tok = this.peek();
      let op: string | null = null;
      if (tok.type === "OPERATOR" && tok.value in BINARY_PRECEDENCE) {
        op = tok.value;
      } else if (tok.type === "IDENTIFIER" && IDENTIFIER_AS_BINARY_OP.has(tok.value.toLowerCase())) {
        op = tok.value.toLowerCase();
      }

      if (!op) break;
      const prec = BINARY_PRECEDENCE[op];
      if (prec < minPrec) break;

      this.consume();
      const nextMinPrec = RIGHT_ASSOCIATIVE.has(op) ? prec : prec + 1;
      const right = this.parseBinary(nextMinPrec);
      left = { type: "BinaryOp", op, left, right };
    }

    // implicit multiplication: NUMBER/LPAREN/IDENTIFIER(constant)/funcCall adjacent
    while (this.canImplicitMultiply()) {
      const right = this.parseUnary();
      left = { type: "BinaryOp", op: "*", left, right };
    }

    return left;
  }

  private canImplicitMultiply(): boolean {
    const t = this.peek();
    if (t.type === "LPAREN") return true;
    if (t.type === "NUMBER") return true; // rare: 2 3 -> 2*3
    if (
      t.type === "IDENTIFIER" &&
      !IDENTIFIER_AS_BINARY_OP.has(t.value.toLowerCase())
    ) {
      // Could be a constant or function call
      return true;
    }
    return false;
  }

  private parseUnary(): AstNode {
    const t = this.peek();
    if (t.type === "OPERATOR" && (t.value === "-" || t.value === "+")) {
      this.consume();
      const operand = this.parseUnary();
      return { type: "UnaryOp", op: t.value as "-" | "+", operand };
    }
    if (t.type === "IDENTIFIER" && t.value.toLowerCase() === "not") {
      this.consume();
      const operand = this.parseUnary();
      return { type: "UnaryOp", op: "not", operand };
    }
    return this.parsePower();
  }

  private parsePower(): AstNode {
    const base = this.parsePostfix();
    const t = this.peek();
    if (t.type === "OPERATOR" && t.value === "^") {
      this.consume();
      // right-associative
      const exponent = this.parseUnary();
      return { type: "BinaryOp", op: "^", left: base, right: exponent };
    }
    return base;
  }

  private parsePostfix(): AstNode {
    let node = this.parsePrimary();
    while (true) {
      const t = this.peek();
      if (t.type === "OPERATOR" && t.value === "!") {
        this.consume();
        node = { type: "PostfixOp", op: "!", operand: node };
        continue;
      }
      break;
    }
    return node;
  }

  private parsePrimary(): AstNode {
    const t = this.peek();

    if (t.type === "NUMBER") {
      this.consume();
      return { type: "Number", value: t.value };
    }

    if (t.type === "LPAREN") {
      this.consume();
      const inner = this.parseExpression();
      this.expect("RPAREN");
      return inner;
    }

    if (t.type === "IDENTIFIER") {
      this.consume();
      const name = t.value;
      const lower = name.toLowerCase();

      // function call?
      if (this.peek().type === "LPAREN") {
        this.consume();
        const args: AstNode[] = [];
        if (this.peek().type !== "RPAREN") {
          args.push(this.parseExpression());
          while (this.peek().type === "COMMA") {
            this.consume();
            args.push(this.parseExpression());
          }
        }
        this.expect("RPAREN");
        return { type: "FunctionCall", name: lower, args };
      }

      // constant or variable — distinguish later in evaluator
      // Use simple heuristic: known constants are pi/e/phi/tau/gamma constants
      const KNOWN_CONSTANTS = new Set(["pi", "e", "phi", "tau", "gamma"]);
      if (KNOWN_CONSTANTS.has(lower)) {
        return { type: "Constant", name: lower };
      }
      return { type: "Variable", name: lower };
    }

    throw new ParseError(
      `Unexpected token '${t.value || "EOF"}'`,
      t.position
    );
  }
}

/** Convenience: parse an expression string into an AST. */
export function parseExpression(source: string): AstNode {
  return new Parser(source).parse();
}
