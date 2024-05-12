// $antlr-format useTab false, maxEmptyLinesToKeep 1, minEmptyLines 1
// $antlr-format allowShortRulesOnASingleLine false, allowShortBlocksOnASingleLine true, alignSemicolons hanging, alignColons hanging

parser grammar vztxtParser;

options {
    tokenVocab = vztxtLexer;
}

start
    : program
    ;

program
    : (topLevelElement NL*)* EOF
    ;

topLevelElement
    : directive
    | varDeclaration
    | Comment
    | blockStatement
    ;

directive
    : HASH name = Identifier value = String? NL
    ;

varDeclaration
    : type = (VAR | LIST) id = identifierDeclaration NL
    ;

blockStatement
    : eventBlock
    | defExpressionBlock
    | defBlock
    | block
    ;

memberIdentifier
    : Identifier
    | VAR
    | LIST
    | THIS
    | LOCAL
    | ON
    | DEF
    | EXPRESSION
    | WAIT
    | UNTIL
    | IF
    | THEN
    | ELSE
    | WHILE
    | FOR
    | TO
    | STEP
    | REPEAT
    | AND
    | OR
    | NOT
    | TRUE
    | FALSE
    ;

identifier
    : scope = (VAR | THIS | LOCAL) DOT str = String
    | scope = (VAR | THIS | LOCAL) DOT id = memberIdentifier
    | idHead = Identifier (DOT idPart += memberIdentifier)*
    ;

identifierDeclaration
    : Identifier
    | String
    ;

block
    : NL* LBRACE NL* statements += statement (
        NL+ statements += statement
    )* NL* RBRACE
    | NL* LBRACE NL* RBRACE
    ;

statement
    : ifStatement
    | whileStatement
    | forStatement
    | repeatStatement
    | waitStatement
    | assignStatement
    | instruction
    | breakStatement
    | Comment
    ;

ifStatement
    : IF condition = expression consequent = block alternative = ifStatementAlternative?
    ;

ifStatementAlternative
    : NL* ELSE elseif = ifStatement
    | NL* ELSE else = block
    ;

whileStatement
    : WHILE condition = expression body = block
    ;

forStatement
    : FOR indexVar = identifierDeclaration EQUAL from = expression TO to = expression (
        STEP step = expression
    )? body = block
    ;

breakStatement
    : BREAK
    ;

repeatStatement
    : REPEAT count = expression body = block
    ;

waitStatement
    : WAIT (UNTIL | FOR?) condition = expression?
    ;

assignStatement
    : LPAR idExpression = expression RPAR op = (EQUAL | PLUSEQ) value = expression
    | id = identifier op = (EQUAL | PLUSEQ) value = expression
    ;

eventBlock
    : ON event = Identifier pars = parameters? body = block
    | ON message = String pars = parameters? body = block
    ;

defBlock
    : DEF id = identifierDeclaration pars = parameters? body = block
    ;

defExpressionBlock
    : DEF EXPRESSION id = identifierDeclaration pars = parameters? COLON value = expression
    ;

expressionList
    : args += expression (COMMA args += expression)*
    ;

expression
    : <assoc = right> expression op = POWER expression
    | expression op = (MULTIPLY | DIVIDE | MOD) expression
    | expression op = (PLUS | MINUS) expression
    | expression op = (EQEQUAL | GT | GTEQ | LT | LTEQ) expression
    | op = NOT expression
    | expression op = AND expression
    | expression op = OR expression
    | <assoc = right> op = IF expression THEN expression ELSE expression
    | lit = literal
    | id = identifier arg = arguments?
    | LPAR inner = expression RPAR
    ;

instruction
    : id = identifier args = arguments
    | id = identifier arg = expression?
    ;

arguments
    : LPAR items = expressionList RPAR
    | LPAR RPAR
    ;

parameters
    : LPAR ids += identifierDeclaration (
        COMMA ids += identifierDeclaration
    )* RPAR
    | LPAR RPAR
    ;

boolean
    : TRUE
    | FALSE
    ;

literal
    : MINUS? Number
    | String
    | boolean
    ;
