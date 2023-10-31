
import { Effect, Config, Console } from "effect";

// const config = Effect.all([
//     Effect.config(Config.string("HOST")),
//     Effect.config(Config.string("PORT")),
// ]).pipe(
//     Effect.flatMap(([host, port])=>Console.log(`Application started: ${host}:${port}`))
// )

// Effect.runSync(config);

//Situation in some cases//evn value not defined.

const program2 = Effect.all([
     Effect.config(Config.string("HOST")),
     Effect.config(Config.withDefault(Config.number("PORT"), 8080))
])



//set new config
export class HostPort {
    constructor(readonly host: string, readonly port: number) {}
   
    get url() {
      return `${this.host}:${this.port}`
    }
  }


  const merge = Config.all([Config.string("HOST"), Config.number("PORT")]);

  const config = Config.map(
     merge,
     (([host, port])=> new HostPort(host, port))
  )

  const runProgram = Effect.config(config).pipe(
     Effect.flatMap((hostPort)=>Console.log(`Application started :: ${hostPort.host}`))
  )

  Effect.runSync(runProgram);

// class MyService {
//     constructor(readonly hostPort:HostPort, readonly timeout:number){

//     }
// }



