import { ParseError } from "@effect/schema/ParseResult";
import { Context, Effect, pipe, Random } from "effect";
import * as Schema from "@effect/schema/Schema";
import { read } from "fs";

const schema = Schema.struct({
    name: Schema.string,
    weight: Schema.number,
  });
  
  type Model = {
    name :string,
    weight:number
}
  const parsePokemon = Schema.parse(schema);

class FetchError {
    readonly _tag="FetchError";
}

class JSONError {
     readonly _tag = "JSONError";
}

class SameWeightError {
    readonly _tag = "SameWeightError";
    constructor(readonly weight:number){}
}

interface DependenciesClient {
    _tag:"DependenciesClient",
    getById(id:number):Effect.Effect<never, FetchError | JSONError | ParseError, Model>;
}

const DependenciesClient = Context.Tag<DependenciesClient>("@app/DependenciesClient");

const someFunctionAsDependencies = (id:number)=>pipe(
    DependenciesClient,
    Effect.flatMap((dependecy)=>dependecy.getById(id)),
    Effect.catchAll(()=>Effect.succeed({ name:"default", weight:0 }))
);

const formatSchema = (schema:Model)=>{
    return `${schema.name} : weights => ${schema.weight}`
}

const getRandomNumberArray = Effect.all(
    Array.from({ length:10 },()=>Effect.sync(()=>Math.floor(Math.random()*100)+1))
);

const calculate = (schema:Model[])=>Effect.reduce(schema,0,(hight, schema)=>schema.weight===hight ? Effect.fail(new SameWeightError(schema.weight)) : Effect.succeed(schema.weight > hight ? schema.weight : hight));

const mainProgram = pipe(
    getRandomNumberArray,
    Effect.flatMap((arr)=>Effect.all(arr.map(someFunctionAsDependencies))),
    Effect.tap((x)=>Effect.log("\n" + x.map(formatSchema).join("\n"))),
    Effect.flatMap((x)=>calculate(x)),
    Effect.catchTag("SameWeightError", (e)=>Effect.log(`Some error are coming.`)),
    Effect.flatMap((x)=>Effect.log(`Some log after execution`))
);

mainProgram.pipe(
    Effect.provideService(DependenciesClient, {
        _tag: "DependenciesClient",
        getById: (id)=>pipe(
            Effect.tryPromise({
                try : ()=>fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
                catch: ()=> new FetchError()
            }),
            Effect.flatMap((response)=>Effect.tryPromise({
                try:()=>response.json(),
                catch: ()=>new JSONError()
            })),
            Effect.flatMap((x) => parsePokemon(x)),
            Effect.catchAll(() => Effect.succeed({ name: "default", weight: 0 }))
        )
    }),
    Effect.runPromise
);












