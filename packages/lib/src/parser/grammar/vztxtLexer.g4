// $antlr-format alignTrailingComments true, maxEmptyLinesToKeep 1, reflowComments false, useTab false, columnLimit 150
// $antlr-format allowShortRulesOnASingleLine true, allowShortBlocksOnASingleLine true, minEmptyLines 0, alignSemicolons ownLine
// $antlr-format alignColons trailing, singleLineOverrulesHangingColon true, alignLexerCommands true, alignLabels true, alignTrailers true

lexer grammar vztxtLexer;

@lexer::header {
  import { VztxtLexerBase } from "../vztxtLexerBase";
}

options {
    superClass = VztxtLexerBase;
}

// Symbols
EQUAL    : '=';
PLUSEQ   : '+=';
PLUS     : '+';
MINUS    : '-';
MULTIPLY : '*';
DIVIDE   : '/';
MOD      : '%';
POWER    : '^';
EQEQUAL  : '==';
GT       : '>';
GTEQ     : '>=';
LT       : '<';
LTEQ     : '<=';
LPAR     : '(';
RPAR     : ')';
LBRACE   : '{';
RBRACE   : '}';
COLON    : ':';
COMMA    : ',';
DOT      : '.';
HASH     : '#';

// Keywords
VAR        : 'var';
LIST       : 'list';
THIS       : 'this';
LOCAL      : 'local';
ON         : 'on';
DEF        : 'def';
EXPRESSION : 'expression';
WAIT       : 'wait';
UNTIL      : 'until';
IF         : 'if';
THEN       : 'then';
ELSE       : 'else';
WHILE      : 'while';
FOR        : 'for';
TO         : 'to';
STEP       : 'step';
BREAK      : 'break';
REPEAT     : 'repeat';
AND        : 'and';
OR         : 'or';
NOT        : 'not';
TRUE       : 'true';
FALSE      : 'false';

Identifier : [\p{L}_][\p{L}\p{Mn}\p{Nd}\p{Pc}\u200C\u200D]*;
Comment    : '//' ~[\r\n\u2028\u2029]*;

String : '"' DoubleStringCharacter* '"' | '\'' SingleStringCharacter* '\'';
Number : [0-9]+ DecimalPart? ExponentPart?;

WS : [\p{Zs}] -> channel(HIDDEN);
NL : LineTerminator+;

fragment DoubleStringCharacter : ~["\\\r\n] | '\\' ["\\rn];
fragment SingleStringCharacter : ~['\\\r\n] | '\\' ["\\rn];
fragment DecimalPart           : '.' [0-9]+;
fragment ExponentPart          : [eE][+-]? [0-9]+;
fragment LineTerminator        : [\r\n\u2028\u2029];
