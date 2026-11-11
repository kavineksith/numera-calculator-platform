// engine/parser/ast.ts
// Abstract Syntax Tree node types and a visitor helper.

export type AstNode =
  | NumberNode
  | ConstantNode
  | VariableNode
  | UnaryOpNode
  | BinaryOpNode
  | FunctionCallNode
  | PostfixOpNode;

export interface NumberNode {
  type: "Number";
  value: string; // raw string, parsed by evaluator for precision
}

export interface ConstantNode {
  type: "Constant";
  name: string;
}

export interface VariableNode {
  type: "Variable";
  name: string;
}

export interface UnaryOpNode {
  type: "UnaryOp";
  op: "-" | "+" | "not";
  operand: AstNode;
}

export interface BinaryOpNode {
  type: "BinaryOp";
  op: string; // + - * / ^ % mod and or xor << >>
  left: AstNode;
  right: AstNode;
}

export interface FunctionCallNode {
  type: "FunctionCall";
  name: string;
  args: AstNode[];
}

export interface PostfixOpNode {
  type: "PostfixOp";
  op: "!"; // factorial
  operand: AstNode;
}

/** Generic visitor pattern for AST traversal. */
export function visitAst(node: AstNode, fn: (n: AstNode) => void): void {
  fn(node);
  switch (node.type) {
    case "UnaryOp":
      visitAst(node.operand, fn);
      break;
    case "BinaryOp":
      visitAst(node.left, fn);
      visitAst(node.right, fn);
      break;
    case "FunctionCall":
      node.args.forEach((a) => visitAst(a, fn));
      break;
    case "PostfixOp":
      visitAst(node.operand, fn);
      break;
    default:
      break;
  }
}

export function astToString(node: AstNode): string {
  switch (node.type) {
    case "Number":
      return node.value;
    case "Constant":
      return node.name;
    case "Variable":
      return node.name;
    case "UnaryOp":
      return `(${node.op}${astToString(node.operand)})`;
    case "BinaryOp":
      return `(${astToString(node.left)} ${node.op} ${astToString(node.right)})`;
    case "FunctionCall":
      return `${node.name}(${node.args.map(astToString).join(", ")})`;
    case "PostfixOp":
      return `(${astToString(node.operand)}${node.op})`;
  }
}
