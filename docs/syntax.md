# Syntax Info (WIP)

## Directives
Optional directives provide extra information.

```
#program "<program name>"
```
```
#pos "<location of block in graphical editor>"
```
```
#fmt "<definition block call format>"
```
`#fmt`'s format strings take the form of `text _ text _ _` where underscores are slots from arguments. This will be ignored if the number of slots are not equal to the number of parameters.

## Top Level Blocks
```
var <global variable>
list <global list variable>
```
```
on <event name> (<event parameters>)? {
  <body>
}
```
Events are either:
- `FlightStart`
- `Docked` (`craftA`, `craftB`)
- `ChangeSoi` (`planet`)
- `PartExplode` (`part`)
- `PartCollision` (`part`, `other`, `velocity`, `impulse`)
Only the parameters used in the body are required.

Receive message events have a slightly different format, with an optional data parameter. Quotes are not required if the event is a valid identifier and does not collide with existing event names.
```
on "<message name>" (data)? {
  <body>
}
```
```
def <instruction name> (parameters)? {
  <body>
}
```
```
def expression <expression name> (parameters)?: <expression>
```
## Control flow
```
if <condition> {
  <body>
} else if <condition> {
  <body>
} else {
  <body>
}
```
```
while <condition> {
  <body>
}
```
```
repeat <count> {
  <body>
}
```
```
for <iteration variable> = <start> to <end> {
  <body>
  break
}
for <iteration variable> = <start> to <end> step <step> {
  <body>
}
```
```
wait
wait <seconds>
wait until <condition>
```
## Assignment
```
<variable> = <expression>
<variable> += <expression>
(<expression of variable name>) = <expression>
(<expression of variable name>) += <expression>
```
