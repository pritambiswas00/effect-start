import { Effect, Ref, Console, Context, Chunk } from "effect";
import { createInterface, clearLine } from "node:readline";


 class Counter {
    public readonly inc: Effect.Effect<never, never, void>;
    public readonly dec: Effect.Effect<never, never, void>;
    public readonly get : Effect.Effect<never, never, number>;
    constructor(private value:Ref.Ref<number>){
        this.inc = Ref.update(this.value, (v)=>v+1);
        this.dec = Ref.update(this.value, (v)=>v-1);
        this.get = Ref.get(this.value);
    }
}

 const someCounterFunction = Effect.map(Ref.make(0), (value)=>new Counter(value));

 const runProgram = someCounterFunction.pipe(
    Effect.flatMap((x)=>
         x.inc.pipe(
            Effect.flatMap(()=>x.inc),
            Effect.flatMap(()=>x.dec),
            Effect.flatMap(()=>x.inc),
            Effect.flatMap(()=>x.get),
            Effect.flatMap((val)=>Console.log(`The counter value will be : ${val}`))
         )
    )
 );

//  Effect.runPromise(runProgram);

 //With Concurrent

 const runProgram2 = someCounterFunction.pipe(
     Effect.flatMap((counter)=>{
         const logger = <R,E,A>(action:Effect.Effect<R,E,A>)=>
           counter.get.pipe(
              Effect.flatMap((x)=>Effect.log(`Get : ${x}`)),
              Effect.flatMap(()=>action)
           )
           return counter.inc.pipe(
               Effect.zip(logger(counter.inc), { concurrent: true }),
               Effect.zip(logger(counter.dec), { concurrent: true }),
               Effect.zip(logger(counter.inc), { concurrent: true }),
               Effect.flatMap(()=>counter.get),
               Effect.flatMap((val)=> Effect.log(`This is the Value ${val}`))
           )
     })
 )

//  Effect.runPromise(runProgram2);


 ///Sharing state between three different program to run one program.

 interface SomeState extends Ref.Ref<number>{}

 const SomeState = Context.Tag<SomeState>();

 const program11 = SomeState.pipe(
    Effect.tap((someState)=>Ref.update(someState, (n)=>n+1)),
    Effect.flatMap((someState)=>Ref.update(someState, (n)=>n+1))
 );

 const program12 = SomeState.pipe(
     Effect.tap((someState)=>Ref.update(someState, (x)=>x-1)),
     Effect.flatMap((someState)=>Ref.update(someState, (x)=>x+1))
 )

 const program13 = SomeState.pipe(
     Effect.flatMap((someState)=>Ref.get(someState)),
     Effect.flatMap((val)=>Console.log(`My State Value : ${val}`))
 )

 const runnableProgram = program11.pipe(
    Effect.flatMap(()=>program12),
    Effect.flatMap(()=>program13),
 )

//  Effect.runPromise(Effect.provideServiceEffect(runnableProgram, SomeState, Ref.make(0)));


//Share states between fibers

const readLine = (message:string):Effect.Effect<never, never,string> =>{
        return Effect.promise(
            ()=>new Promise((resolve)=>{
                  const read1 = createInterface({
                      input: process.stdin,
                      output: process.stdout
                  })
                  read1.question(message, (answer)=>{
                       read1.close();
                       resolve(answer)
                  })
            })
        )
}

const getUserInput = Ref.make(Chunk.empty<string>()).pipe(
    Effect.flatMap((ref)=>
          readLine("Please enter your name or 'q' to exit shell").pipe(
              Effect.repeatWhileEffect((name)=>{
                   if(name==="q") return Effect.succeed(false)
                   return ref.pipe(
                        Ref.update((state)=>Chunk.append(state, name)),
                        Effect.as(true)
                )
              }),
              Effect.flatMap(()=>Ref.get(ref))
          )
     )
)

Effect.runPromise(getUserInput).then(console.log)




