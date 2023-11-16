import { Effect, Either, Data } from "effect";

class FetchError extends Data.TaggedClass('FetchError')<{
    readonly error:string
}>{};

class Func extends Data.TaggedClass('Func')<{
    readonly id:number;
}>{};

function func(id:number):Either.Either<FetchError, Func>{
      return id>3 ? Either.right(new Func({id})) : Either.left(new FetchError({ error:"SAD ERROR" }))
}

const main = Effect.partition([222,344,1111,44444,2], func);
console.log(Effect.runSync(main));
 