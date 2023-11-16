import { Effect, pipe } from "effect";
import * as Schema from "@effect/schema/Schema";

//This is Schema for respone
const pokemonSchema = Schema.struct({
    name: Schema.string,
    weight: Schema.number,
});

type Pokemon = Schema.Schema.To<typeof pokemonSchema>;

//type for response
// type Pokemon = {
//     name :string,
//     weight:number
// }

//Error Handling///
class FetchError {
    readonly _tag = "FetchError";
}

class JSONError {
    readonly _tag = "JSONError";
}

class SameWeightError {
     readonly _tag = "SameWeightError";
     constructor(readonly weight:number){}
}




//Response parser
const parsePokemon = Schema.parse(pokemonSchema);

//Network call
const getPokemon = (id:number)=>pipe(
        Effect.tryPromise({
            try:()=> fetch(`https://pokeapi.co/api/v2/pokemo/${id}`),
            catch:()=>new FetchError()
         }),
         Effect.flatMap((response)=>
               Effect.tryPromise({
                   try: ()=>response.json(),
                   catch: ()=> new JSONError()
               })
         ),
         Effect.flatMap((x)=>parsePokemon(x)),
         Effect.catchAll(()=>Effect.fail({ name : "default", weight: 0 }))
         )

//Random number generators//
const getRandomNumberArray = Effect.all(
    Array.from({ length: 10 }, ()=> Effect.sync(()=>Math.floor(Math.random()*100)+1))
);

const formatPokemon = (pokemon:Pokemon)=> `${pokemon.name} weighs ${pokemon.weight} hehehehe`;

//Fetch Data and serialize json response
const program = pipe(
    getRandomNumberArray,
    Effect.flatMap((arr)=>Effect.all(arr.map(getPokemon))),
    Effect.tap((pokemon)=>Effect.log("\n"+ pokemon.map(formatPokemon).join("\n"))),
    Effect.flatMap((pokemons)=>calculateHeaviestPokemon(pokemons)), 
    Effect.catchTag("SameWeightError", (e)=>Effect.log("Two Pokemon are the same"+e.weight)),
    Effect.flatMap((heaviest)=>Effect.log(`The heaviest pokemon ${heaviest} pokemon`))
);

const calculateHeaviestPokemon = (pokemons: Pokemon[])=> Effect.reduce(pokemons,0, (highest, pokemon)=>pokemon.weight===highest ? Effect.fail(new SameWeightError(pokemon.weight)) : Effect.succeed(pokemon.weight>highest ? pokemon.weight : highest))


//Run the promise function
Effect.runPromise(program).then(console.log);