//Effect system we can define the types that going to 
//allow us to check two object wheather To create custom equality behavior, you can implement the Equal interface in your models. This interface extends the Hash interface from the Hash module.

import { Equal, Hash } from "effect";

//Here's an example of implementing the Equal interface for a Person class:

export class MyType implements Equal.Equal{
      constructor(readonly name:string, readonly age:number){}
    [Equal.symbol](that: Equal.Equal): boolean {
        if (that instanceof MyType) {
            return (
              Equal.equals(this.name, that.name) && Equal.equals(this.age, that.age)
            )
          }
          return false
    }
    [Hash.symbol](): number {
        return this.name.length + this.age;
    }
}


//Now we can use this type check based on value in it. as well as instance level.
//Let go to different page effectScheduling
