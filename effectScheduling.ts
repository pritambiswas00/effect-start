
//Basic syntax for policy

import { Effect, Console, Schedule, Equal } from "effect";
import { MyType } from "./effectEqual";

// Effect.repeat(action, policy);

const action= Console.log("Success");
const policy = Schedule.addDelay(
    Schedule.recurs(1),
    ()=>"1000 millis"
);

//One time it will print and then another one time case i have specified in the schedule recurs
const mainProgram = Effect.repeat(action, policy);

// Effect.runPromise(mainProgram).then((c)=>console.log(`Repeatitions${c}`))


//Effect Composition of schedule

let start = new Date().getTime()
 
const log = Effect.sync(() => {
  const now = new Date().getTime()
  console.log(`delay: ${now - start}`)
  start = now
})  //This is out schedule function

//Union Type

const schedule = Schedule.union(
    Schedule.exponential("100 millis"),
    Schedule.spaced("1 seconds")
);

// Effect.runPromise(Effect.repeat(log, schedule));

//Check new implemented data type for value based check for an object as well as instance level

const type1 = new MyType("type1", 30);
const type2 = new MyType("type2", 30);

console.log(Equal.equals(type1,type2));


