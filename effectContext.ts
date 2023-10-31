import { Effect, Context, Console, Option, Layer, Tracer, Exit } from "effect";
//Service//

interface Random {
    readonly next:Effect.Effect<never,never,number>;
}

export const Random = Context.Tag<Random>("@app/random");

const program = Random.pipe(
    Effect.flatMap((random)=>random.next),
    Effect.flatMap((randomNumber)=>Console.log(`Random Number :: ${randomNumber}`))
)

const runProgram = Effect.provideService(
    program,
    Random,
    Random.of({
         next: Effect.sync(()=>Math.random())
    })
)
//Effect.provideService(effect, tag, implementation)

Effect.runPromise(runProgram).then(console.log);

//Managing multiple services //

interface Logger {
    readonly log:(msg:string)=>Effect.Effect<never,never, void>;
}
const Logger = Context.Tag<Logger>("@app/logger");

const program2 = Effect.all([Random, Logger]).pipe(
    Effect.flatMap(([random,logger])=>
         random.next.pipe(
             Effect.flatMap((rn)=>logger.log(`Some Random Number ${rn}`))
         )
    )
)

const runnableContext = Context.empty().pipe(
     Context.add(Random, Random.of({ next:Effect.sync(()=>Math.random()) })),
     Context.add(
        Logger,
        Logger.of({ log: Console.log })
     )
);

const runProgram2 = Effect.provideContext(program2, runnableContext);

Effect.runPromise(runProgram2);

//Managing Optional Service//

const optionalProgram = Effect.serviceOption(Random).pipe(
      Effect.flatMap((rn)=>
           Option.match(rn, {
               onNone:()=>Effect.succeed(-1),
               onSome:(rn)=>rn.next
           })
      ),
      Effect.flatMap((x)=>Console.log(`${x}`))
);

Effect.runPromise(optionalProgram); //OP --> -1;//
//Suppose If we provide the implementation

Effect.runPromise(
    Effect.provideService(
         optionalProgram,
         Random,
         Random.of({
             next: Effect.sync(()=>Math.random())
         })
    )
).then(console.log);

//Managing Service Dependencies//

//--> Instead of directly implemented the service we have to create the layer
//so we can abstract out those layers.
//So now we are creating Recipe. 

//         Measuring Cup

//  Flour                Suger

//             Recipe

interface MeasuringCup{
    readonly measure:(amount:number,unit:string)=>Effect.Effect<never, never, string>;
}

const MeasuringCup = Context.Tag<MeasuringCup>();
const MeasuringCupLive = Layer.succeed(
    MeasuringCup,
    MeasuringCup.of({
        measure:(amount,unit)=>Effect.succeed(`Measured ${amount} :: ${unit} (s)`)
    })
)

interface Sugar {
     readonly grams:(amount:number)=>Effect.Effect<never,never,string>;
}
const Sugar = Context.Tag<Sugar>();
const SugarLive = Layer.effect(
    Sugar,
    Effect.map(MeasuringCup, (measuring_cup)=>
            Sugar.of({
                 grams:(amount)=>measuring_cup.measure(amount, "gram")
            })
    )
)

interface Flour {
    readonly cups:(amount:number)=>Effect.Effect<never, never,string>;
}

const Flour = Context.Tag<Flour>();
const FlourLive = Layer.effect(
     Flour,
     Effect.map(MeasuringCup, (measuringCup)=>
         Flour.of({
             cups:(amount)=>measuringCup.measure(amount, "cups")
         })
     )
)

//creating recipe

interface Recipe {
    readonly steps:Effect.Effect<never,never, ReadonlyArray<string>>;
}

const Recipe = Context.Tag<Recipe>();
const RecipeLive = Layer.effect(
    Recipe,
    Effect.all([Sugar, Flour]).pipe(
        Effect.map(([suger, flour])=>
           Recipe.of({
               steps:Effect.all([suger.grams(300), flour.cups(2)])
           })
        
        )
    )
)

//We can also merge two or more layers
//Lets say merging suger and flour layer

const IngredientsLive = Layer.merge(FlourLive,SugarLive);


//Another way to merge called compose 

//firstLayer.pipe(Layer.provide(second))

const MainLive = MeasuringCupLive.pipe(
    Layer.provide(IngredientsLive),
    Layer.provide(RecipeLive)
)

const program3 = Recipe.pipe(
    Effect.flatMap((x)=>x.steps),
    Effect.flatMap((y)=>
          Effect.forEach(y, (step)=>Console.log(`${step}`),{
            concurrency:"unbounded",
            discard:true
          })
    )
)

const runnable = Effect.provideLayer(program3, MainLive);
Effect.runPromise(runnable);


///Service Management//




