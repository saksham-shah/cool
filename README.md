# Cool

>C.O.O.L. stands for:
>  - Cool
>  - Object
>  - Oriented
>  - Language

*Cool* is an interpreted programming language written in JavaScript. It is class-based and object-oriented. *Cool* is weakly typed and aims to make code incredibly concise.

The syntax and semantics of *Cool*, and even other parts of this repository (such as this README) are inspired by [Blink](https://github.com/ftchirou/blink). *Cool* also shares many similarities with JavaScript.
## Getting started
To start coding in *Cool*, you will need to install [Node.js](https://nodejs.org/en/).

Once you have installed Node, type these commands in a prompt:

1. ```$ git clone https://github.com/saksham-shah/cool.git```
2. ```$ cd cool```
3. ```$ npm install```
### Setting up
Run `npm run setup` to set up the program. A directory called `cool` will be created with some files in it. Read the README file in the directory which explains what each file is for.
### Your first *Cool* program
The setup program will have created a directory called `code` in the previously mentioned `cool` directory. There will be a file called `code.cool` in this directory, with the following code:
```
// Ask the user for their name
Console.print("Enter name:")
name = Console.input()

// Reply with their name
Console.print("Hello, " + name + "! Welcome to Cool!")
```
Run `npm run main` and this code will be run by the *Cool* interpreter.

You can write your own code in this file and the interpreter will execute it. You can also open up `config.json` (also in the `cool` directory) to change which file the interpreter will execute.

```json
{
	"input": "code.cool"
}
```
The `input` property can be changed to a different path, and the interpreter will execute the file found at that path instead.

*NOTE: The path in the `input` property is relative to the `code` directory. All Cool files should be kept in this directory.*
## Learn *Cool*
Check out the [tutorial](https://github.com/saksham-shah/cool/wiki/Tutorial) pages in the Wiki!
## Credits
*Cool* was made by Saksham Shah.