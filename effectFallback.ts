import { Effect, Console } from "effect";

class NegativeNumber {
    readonly _tag = "NegativeNumber"
    constructor( readonly age:number ){}
}

class PositiveNumber {
    readonly _tag = "PositiveNumber"
    constructor(readonly age : number){}
}

const program = (age:number):Effect.Effect<never, NegativeNumber|PositiveNumber, number> =>{
     if(age<0) return Effect.fail(new NegativeNumber(age));
     else if (age >5 ) return Effect.fail(new PositiveNumber(age));
     return Effect.succeed(age);
}

//Making the program to run something else if anything fails

const updatedProgram = Effect.orElseFail(program(20), ()=>Effect.fail("Program Failed"));

Console.log(Effect.runSync(updatedProgram));

