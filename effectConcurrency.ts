import { Effect, Duration, Schedule, Console, pipe, Fiber } from "effect";

const micro_task = (n:number, delay:Duration.DurationInput)=>Effect.promise(()=>new Promise<void>((resolve)=> {
      console.log(`Start Task ${n}`)
      setTimeout(()=>{
           console.log(`Task ${n} done`);
           resolve();
      }, Duration.toMillis(delay))
}));

const task1 = micro_task(23, "2000 millis");
const task2 = micro_task(33, "2000 millis");
const task3 = micro_task(34, "2000 millis");
const task4 = micro_task(35, "2000 millis");
const task5 = micro_task(36, "2000 millis");
const task6 = micro_task(37, "2000 millis");

const runProgram = Effect.all([task1, task2, task3, task4, task5, task6]); // default sequential task1 --> task2
// Effect.runPromise(runProgram);

const runProgram2 = Effect.all([task1, task2, task3, task4, task5, task6], { concurrency: 3 }); //3 at a time concurrently

// Effect.runPromise(runProgram2);

const runProgram3 = Effect.all([task1, task2, task3, task4, task5, task6], { concurrency: "unbounded" }); //as many effects as needed will run concurrently

// Effect.runPromise(runProgram3); 

const runProgram4 = Effect.all([task1, task2, task3, task4, task5, task6], { concurrency: "inherit" }); //option adapts based on context, controlled by Effect.withConcurrency(number | "unbounded")

// Effect.runPromise(runProgram4);


///Fibers///

const repeatative_tasks = Effect.repeat(
     Console.log("repeatative_tasks Running"),
     Schedule.fixed("1 seconds")
);

const mainProgram = Effect.gen(function* (_) {
    console.log("repeatative_tasks: started!")
    yield* _(Effect.fork(repeatative_tasks))
    yield* _(Effect.sleep("5 seconds"))
    console.log("repeatative_tasks : finished!")
  });

 // Effect.runPromise(mainProgram);  //Fork with Automatic Supervision


 const mainProgram2 = Effect.gen(function* (_){
       console.log("Start task");
       yield* _(Effect.forkDaemon(repeatative_tasks));
       yield* _(Effect.sleep("8 seconds"));
       console.log(`Task is finished`) 
 });

//  Effect.runPromise(mainProgram2);  //Fork in Daemon

//Even if we interrupt the mainProgram3 the repeatative_tasks will still execute

const mainProgram3 = Effect.gen(function* (_){
    console.log("Start task");
    yield* _(Effect.forkDaemon(repeatative_tasks));
    yield* _(Effect.sleep("8 seconds"));
    console.log(`Task is finished`) 
}).pipe(Effect.onInterrupt(()=>Console.log("Main 3 interrupted")));


const runProgram5 = Effect.gen(function* (_){
     const context = yield* _(Effect.fork(mainProgram3));
     yield* _(Effect.sleep("3 seconds"));
     yield* _(Fiber.interrupt(context))
});

Effect.runPromise(runProgram5);






  





