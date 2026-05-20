# Script examples

> Note: All comments using // are for javascript syntax highlighting
>> Comments must use hashtags (#)

## Glossary
- [Comments](#comments)
- [Classes](#classes)
- [Functions](#functions)
	- [Parameters](#function-parameters)
	- [Return](#function-return)
- [Core Plugins (redirect)](./lib/plugin//core-plugins.ts)

## Comments
```py
# Hello this is a comment!
```

## Classes
```js
class Point {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  add(n) {
    return this.x + n
  }
}

p = Point(2, 3)
print(p.add(5))
```

## Functions

### Function Parameters
Syntax: ```fn <name> (<identifier>, ...<identifier>)```
```js
// any type can be passed to <name>
fn getA(name){
	name // Type:any or Type:string or Type:number etc.
}

// <name>: <type> automatically casts to type no matter what
fn getB (name: string){
	name // Type:string
}

// Using <name>:! <type> will throw an error if the argument type does not match
fn getC (name:! string){
	name // Type:string
}
```

### Function Return
Syntax: ``return <value>``
```js
// any type can be passed to <name>
fn getA(name){
	return name + " " + "is cool" // Type:any or Type:string or Type:number etc.
}

getA("Art") // "Art is cool"
getA("Creating") // "Creating is cool"
```

### Function Early Return
Syntax: ``return <value> if <condition>``
> Note: Conditions must resolve to boolean

```js
fn getRank (name: string){
	return 1 if name == "michael"
	return 2 if name == "orago"
	return 3 if name == "john"
	return 4 if name == "dave"
	return 5 if name == "terry"
	return -1
}

print(getRank("orago")) // 2
print(getRank("dave")) // 4
```

## For-Loops
Syntax: ``for <identifier> = (<number>, <number>) {}``
```js
for i = (1, 3) {
	print("loop", i);
}

// console:/
// > ["loop", 1]
// > ["loop", 2]
// > ["loop", 3]
```