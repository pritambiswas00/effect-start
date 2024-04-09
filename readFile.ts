import {  Effect, pipe } from "effect"
import { readFile } from "fs/promises";

class ReadFileError {
     readonly _tag = "ReadFileError";
}


const read = Effect.tryPromise({
      try: ()=>readFile("./text.txt", { encoding: "utf-8" }),
      catch: ()=>new ReadFileError()
});

const programWithTimer = pipe(
    Effect.sync(() => performance.now()),
    Effect.flatMap((startTime) =>
           read.pipe(
                Effect.tap((x)=>Effect.log(x)),
                Effect.tap((x)=>Effect.log(`${performance.now() - startTime} ms`))
           )
           ),
  )
  .pipe(
     Effect.catchTag("ReadFileError", (error)=>Effect.log(error)))
  
  Effect.runPromise(programWithTimer);


