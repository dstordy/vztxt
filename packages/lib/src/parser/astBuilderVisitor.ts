import { unescapeString } from "@vztxt/utils/string";
import { ParserRuleContext } from "antlr4ng";
import * as astNode from "../ast/astNode";
import { nodeFactory } from "../ast/nodeFactory";
import { eventDefinitions } from "../definitions/event";
import { vztxtLexer } from "./generated/vztxtLexer";
import * as vztxtParser from "./generated/vztxtParser";
import { vztxtParserVisitor } from "./generated/vztxtParserVisitor";
import { opMap } from "./opMap";
import { VisitorReturnType } from "./parse";

export class AstBuilderVisitor extends vztxtParserVisitor<VisitorReturnType> {
  #directives = new Map<string, string>();

  useDirective = (name: string): string | undefined => {
    const value = this.#directives.get(name);
    this.#directives.delete(name);
    return value;
  };

  stringInner = (val: string | undefined) => {
    if (val == undefined) return val;
    return unescapeString(val.slice(1, -1));
  };

  identifierType = (
    ctx: vztxtParser.IdentifierContext | undefined,
  ): astNode.IdentifierType => {
    if (ctx?.THIS()) return "expression";
    if (ctx?.VAR()) return "global";
    if (ctx?.LOCAL()) return "local";
    return "unknown";
  };

  getSrcInfo = (
    ctx: ParserRuleContext | undefined,
  ): astNode.SrcRange | undefined => {
    if (!ctx) return undefined;
    return {
      start: {
        line: ctx.start?.line ?? 0,
        col: (ctx.start?.column ?? 0) + 1,
      },
      end: {
        line: ctx.stop?.line ?? 0,
        col: (ctx.stop?.column ?? 0) + (ctx.stop?.text?.length ?? 0) + 1,
      },
    };
  };

  identifierValue = (ctx: vztxtParser.IdentifierContext | undefined) => {
    if (!ctx) return "";
    if (ctx._str) {
      return this.stringInner(ctx._str.text) ?? "";
    } else if (ctx._id) {
      return ctx._id.getText() ?? "";
    } else {
      return [ctx._idHead?.text, ...ctx._idPart.map((p) => p.getText())].join(
        ".",
      );
    }
  };

  identifierDeclarationValue = (
    ctx: vztxtParser.IdentifierDeclarationContext | undefined,
  ) => {
    if (!ctx) return "";
    return (
      ctx.Identifier()?.getText() ??
      this.stringInner(ctx.String()?.getText()) ??
      ""
    );
  };

  parametersValue = (
    ctx: vztxtParser.ParametersContext | undefined,
  ): string[] => {
    return ctx?._ids.map(this.identifierDeclarationValue) ?? [];
  };

  blockStatements = (
    ctx: vztxtParser.BlockContext | undefined,
  ): astNode.AstNode[] => {
    const body: astNode.AstNode[] = [];

    for (const statement of ctx?._statements ?? []) {
      const comment = statement.Comment();
      if (comment) {
        body.push(
          nodeFactory.comment({
            comment: comment.getText().slice(2).trimStart(),
          }),
        );
      } else {
        const node = this.visit(statement);
        if (node != null) body.push(node);
      }
    }

    return body;
  };

  visitProgram = (ctx: vztxtParser.ProgramContext) => {
    const globals: astNode.VariableDeclarationNode[] = [];
    const body: astNode.AstNode[] = [];
    let programName = "program";

    for (const el of ctx.topLevelElement()) {
      // Directive
      const directive = el.directive();
      if (directive?._name?.text != undefined) {
        const name = directive._name.text;
        const value = this.stringInner(directive._value?.text);

        if (name == "program") {
          programName = value ?? name;
        } else if (value) {
          this.#directives.set(name, value);
        } else {
          this.#directives.delete(name);
        }
      }
      // VarDeclaration
      const varDeclaration = el.varDeclaration();
      if (varDeclaration) {
        const node = this.visitVarDeclaration(varDeclaration);
        if (node != null) globals.push(node);
        continue;
      }

      // BlockStatement
      const blockStatement = el.blockStatement();
      if (blockStatement) {
        const node = this.visit(blockStatement);
        if (node != null) body.push(node);
        continue;
      }
    }

    return nodeFactory.program({
      name: programName,
      globals,
      body,
    });
  };

  visitVarDeclaration = (ctx: vztxtParser.VarDeclarationContext) => {
    const isList = ctx._type_?.type == vztxtLexer.LIST;
    const identifier = this.identifierDeclarationValue(ctx._id);
    return nodeFactory.variableDeclaration({
      identifier: identifier,
      identifierLoc: this.getSrcInfo(ctx._id),
      variableType: isList ? "list" : "value",
    });
  };

  visitEventBlock = (ctx: vztxtParser.EventBlockContext) => {
    const event = ctx._event?.text ?? "";
    const parameters = this.parametersValue(ctx._pars);
    if (event && event in eventDefinitions) {
      return nodeFactory.event({
        pos: this.useDirective("pos"),
        event,
        parametersLoc: this.getSrcInfo(ctx._pars),
        parameters,
        body: this.blockStatements(ctx._body),
      });
    }
    const message =
      ctx._event?.text ?? this.stringInner(ctx._message?.text) ?? "";
    return nodeFactory.event({
      pos: this.useDirective("pos"),
      event: "ReceiveMessage",
      eventFilter: message,
      parameters,
      body: this.blockStatements(ctx._body),
    });
  };

  visitDefBlock = (ctx: vztxtParser.DefBlockContext) => {
    const identifier = this.identifierDeclarationValue(ctx._id);
    const parameters = this.parametersValue(ctx._pars);
    return nodeFactory.instructionDeclaration({
      pos: this.useDirective("pos"),
      identifier: identifier ?? "",
      identifierLoc: this.getSrcInfo(ctx._id),
      callFormat: this.useDirective("fmt"),
      parameters,
      body: this.blockStatements(ctx._body),
    });
  };

  visitBlock = (ctx: vztxtParser.BlockContext) => {
    return nodeFactory.detached({
      pos: this.useDirective("pos"),
      body: this.blockStatements(ctx),
    });
  };

  visitDefExpressionBlock = (ctx: vztxtParser.DefExpressionBlockContext) => {
    const identifier = this.identifierDeclarationValue(ctx._id);
    const parameters = this.parametersValue(ctx._pars);
    const expression = ctx._value ? this.visit(ctx._value) : null;
    return nodeFactory.expressionDeclaration({
      pos: this.useDirective("pos"),
      identifier: identifier ?? "",
      identifierLoc: this.getSrcInfo(ctx._id),
      callFormat: this.useDirective("fmt"),
      parameters,
      expression: expression ?? nodeFactory.error({}),
    });
  };

  visitIfStatement = (ctx: vztxtParser.IfStatementContext) => {
    const alternative: astNode.AstNode[] = [];
    if (ctx._alternative) {
      if (ctx._alternative._elseif) {
        const node = this.visit(ctx._alternative._elseif);
        if (node) alternative.push(node);
      } else if (ctx._alternative._else_) {
        alternative.push(...this.blockStatements(ctx._alternative._else_));
      }
    }
    const condition = ctx._condition ? this.visit(ctx._condition) : null;
    return nodeFactory.if({
      condition: condition ?? nodeFactory.error({}),
      consequent: this.blockStatements(ctx._consequent),
      ...(alternative.length > 0 ? { alternative } : {}),
    });
  };

  visitWhileStatement = (ctx: vztxtParser.WhileStatementContext) => {
    const condition = ctx._condition ? this.visit(ctx._condition) : null;
    const body = this.blockStatements(ctx._body);
    return nodeFactory.while({
      condition: condition ?? nodeFactory.error({}),
      body,
    });
  };

  visitForStatement = (ctx: vztxtParser.ForStatementContext) => {
    const indexVar = ctx._indexVar
      ? this.identifierDeclarationValue(ctx._indexVar)
      : null;
    const from = ctx._from_ ? this.visit(ctx._from_) : null;
    const to = ctx._to ? this.visit(ctx._to) : null;
    const step = ctx._step ? this.visit(ctx._step) : null;
    const body = this.blockStatements(ctx._body);
    return nodeFactory.for({
      var: indexVar ?? "",
      start: from ?? nodeFactory.error({}),
      end: to ?? nodeFactory.error({}),
      step: step ?? nodeFactory.literal({ valueType: "number", value: "1" }),
      body,
    });
  };

  visitBreakStatement = () => {
    return nodeFactory.break({});
  };

  visitRepeatStatement = (ctx: vztxtParser.RepeatStatementContext) => {
    const count = ctx._count ? this.visit(ctx._count) : null;
    const body = this.blockStatements(ctx._body);
    return nodeFactory.repeat({
      count: count ?? nodeFactory.error({}),
      body,
    });
  };

  visitWaitStatement = (ctx: vztxtParser.WaitStatementContext) => {
    const condition = ctx._condition ? this.visit(ctx._condition) : null;
    return nodeFactory.wait({
      waitType: ctx.UNTIL() ? "condition" : "seconds",
      condition:
        condition ?? nodeFactory.literal({ valueType: "number", value: "0" }),
    });
  };

  visitAssignStatement = (ctx: vztxtParser.AssignStatementContext) => {
    const op = (ctx._op ? opMap[ctx._op.type] : undefined) ?? "=";
    const identifier =
      (ctx._idExpression ? this.visit(ctx._idExpression) : null) ??
      nodeFactory.identifier({
        loc: this.getSrcInfo(ctx._id),
        identifier: this.identifierValue(ctx._id),
        identifierLoc: this.getSrcInfo(ctx._id),
        identifierType: this.identifierType(ctx._id),
      });
    const value = ctx._value ? this.visit(ctx._value) : null;
    return nodeFactory.assignment({
      identifier,
      operator: op,
      value: value ?? nodeFactory.error({}),
    });
  };

  visitInstruction = (ctx: vztxtParser.InstructionContext) => {
    const identifier = this.identifierValue(ctx._id) ?? "";
    const args: astNode.AstNode[] = [];
    if (ctx._args) {
      for (const arg of ctx._args._items?._args ?? []) {
        const node = this.visit(arg);
        if (node) args.push(node);
      }
    } else if (ctx._arg) {
      const node = this.visit(ctx._arg);
      if (node) args.push(node);
    }
    return nodeFactory.instruction({
      loc: this.getSrcInfo(ctx),
      identifier,
      identifierLoc: this.getSrcInfo(ctx._id),
      instructionType: ctx._id?.THIS() ? "global" : "unknown",
      arguments: args,
    });
  };

  visitLiteral = (ctx: vztxtParser.LiteralContext) => {
    const number = ctx.Number();
    if (number != null) {
      return nodeFactory.literal({
        loc: this.getSrcInfo(ctx),
        valueType: "number",
        value: (ctx.MINUS() ? "-" : "") + number.getText(),
      });
    }
    const string = this.stringInner(ctx.String()?.getText());
    if (string != null) {
      return nodeFactory.literal({
        valueType: "string",
        value: string,
      });
    }
    const boolean = ctx.boolean();
    if (boolean != null) {
      return this.visit(boolean);
    }
    return nodeFactory.error({});
  };

  visitBoolean = (ctx: vztxtParser.BooleanContext) => {
    return nodeFactory.literal({
      valueType: "bool",
      value: ctx.TRUE() ? "true" : "false",
    });
  };

  visitExpression = (ctx: vztxtParser.ExpressionContext): VisitorReturnType => {
    if (ctx._inner) return this.visitExpression(ctx._inner);
    // Handle operations
    if (ctx._op) {
      const op = opMap[ctx._op.type];
      const [e1, e2, e3] = ctx.expression();
      switch (ctx._op.type) {
        // Binary ops
        // Arithmetic
        case vztxtLexer.POWER:
        case vztxtLexer.MULTIPLY:
        case vztxtLexer.DIVIDE:
        case vztxtLexer.MOD:
        case vztxtLexer.PLUS:
        case vztxtLexer.MINUS:
        // Comparison
        case vztxtLexer.EQEQUAL:
        case vztxtLexer.GT:
        case vztxtLexer.GTEQ:
        case vztxtLexer.LT:
        case vztxtLexer.LTEQ:
        // Logic
        case vztxtLexer.AND:
        case vztxtLexer.OR:
          if (e1 && e2 && op) {
            const nodeLhs = this.visit(e1);
            const nodeRhs = this.visit(e2);
            if (nodeLhs && nodeRhs) {
              return nodeFactory.binaryOp({
                op: op,
                lhs: nodeLhs,
                rhs: nodeRhs,
              });
            }
          }
          // Error?
          return nodeFactory.error({});
        // Unary Ops
        case vztxtLexer.NOT:
          if (e1) {
            const operand = this.visit(e1);
            if (operand) {
              return nodeFactory.unaryOp({
                op: op,
                operand,
              });
            }
          }
          // Error?
          return nodeFactory.error({});
        // Conditional
        case vztxtLexer.IF:
          if (e1 && e2 && e3) {
            const condition = this.visit(e1);
            const consequent = this.visit(e2);
            const alternative = this.visit(e3);
            if (condition && consequent && alternative) {
              return nodeFactory.conditional({
                condition,
                consequent,
                alternative,
              });
            }
          }
          // Error?
          return nodeFactory.error({});
      }
    }
    if (ctx._lit) return this.visit(ctx._lit);
    if (ctx._id) {
      const identifier = this.identifierValue(ctx._id) ?? "";
      const args = (ctx._arg?._items?._args ?? [])
        .map((a) => this.visit(a))
        .filter((a): a is astNode.AstNode => a != null);
      return nodeFactory.identifier({
        identifier,
        identifierType: this.identifierType(ctx._id),
        identifierLoc: this.getSrcInfo(ctx._id),
        ...(ctx._arg ? { arguments: args } : {}),
        loc: this.getSrcInfo(ctx),
      });
    }
    return nodeFactory.error({});
  };
}
