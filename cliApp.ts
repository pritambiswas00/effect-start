import { Console, Context, Effect, Option, pipe } from 'effect';
import * as Http from '@effect/platform-bun/HttpClient'
import * as Bun from '@effect/platform-bun/Runtime';
import * as Command from '@effect/cli/Command'
import * as Cli from '@effect/cli/CliApp'
import * as Options from '@effect/cli/Options'
import * as Args from '@effect/cli/Args'
import * as Schema from '@effect/schema/Schema';
import * as Server from "@effect/platform-bun/HttpServer";

const WeatherSchema = Schema.struct({
  date: Schema.Date,
  avgtempC: Schema.NumberFromString,
  avgtempF: Schema.NumberFromString,
  maxtempC: Schema.NumberFromString,
  maxtempF: Schema.NumberFromString,
  mintempC: Schema.NumberFromString,
  mintempF: Schema.NumberFromString,
  sunHour: Schema.NumberFromString,
  uvIndex: Schema.NumberFromString,
});

const WeatherResponseSchema = Schema.struct({ weather: Schema.array(WeatherSchema) });

const mainApp = Cli.make({
  name: "Test Weather",
  version: "1.0",
  command: Command.make('weather', {
    args: Args.between(Args.text({ name: "location" }), 0, 1).pipe(Args.map(Option.fromIterable)),
    options: Options.all({
      URL: Options.withDefault(Options.text("URL"), "https://wttr.in"),
    })
  })
});


const wttrRequest = (args: Option.Option<string>)=>Option.match(args, {
    onNone: () => Http.request.get('/'),
    onSome: (_) => Http.request.get(`/${encodeURIComponent(_)}`),
});

interface RequestService {
    readonly next:Effect.Effect<never,never, (args: Option.Option<string>) => Http.request.ClientRequest>
}

type options = Readonly<{
    URL: string;
}>

type args=Option.Option<string>;

interface ClientService {
    readonly options: options,
    // readonly request: Effect.Effect<never,never, (args: Option.Option<string>) => Http.request.ClientRequest>,
    readonly args: args;
    

}

// const RequestServiceContext = Context.Tag<RequestService>();
const ClientServiceContext = Context.Tag<ClientService>();
// const request = RequestServiceContext.pipe(
//     Effect.flatMap((c)=>)
// )

const client = ClientServiceContext.pipe(
    Effect.flatMap((c)=>
    
))

const runApplication  = Cli.run(mainApp, process.argv.slice(2), ( { options, args })=>Effect.provideService(
    client, 
    ClientServiceContext, 
    ClientServiceContext.of({
        args: args,
        options: options
})))


// const runProgram = Effect.provideService(
//     program,
//     Random,
//     Random.of({
//          next: Effect.sync(()=>Math.random())
//     })
// )

// const main = Cli.run(mainApp, process.argv.slice(2), ({ options, args }) =>
//   // Based on the given options and arguments, you could invoke different (sub)commands here or
//   // pass different parameters to your command function. In this example, we only have a single
//   // command, so we just invoke it directly.
//   Effect.gen(function* ($) {
//     const httpClient = yield* $(Http.client.Client)

//     // We're preparing a custom http client that will be used to send the request to the wttr.in service.
//     const wttrClient = httpClient.pipe(
//       // Always prepend the service url to all requests. This makes it more convenient to use the client.
//       Http.client.mapRequest(Http.request.prependUrl(options.url)),
//       // Tell the wttr.in service to return json.
//       Http.client.mapRequest(Http.request.appendUrlParam('format', 'j1')),
//       // Only accept responses with a `2xx` status code. Fail otherwise.
//       Http.client.filterStatusOk,
//       // Decode all responses using the `WttrResponseSchema` schema.
//       Http.client.mapEffect(Http.response.schemaBodyJson(WttrResponseSchema)),
//     )

//     // Create the weather request for the provided location or the current location if none was provided.
//     const wttrRequest = Option.match(args, {
//       onNone: () => Http.request.get('/'),
//       onSome: (_) => Http.request.get(`/${encodeURIComponent(_)}`),
//     })

//     // Send the request and wait for the response
//     const wttrResponse = yield* $(wttrClient(wttrRequest))

//     // TODO: Pretty print the weather.
//     yield* $(Effect.log(wttrResponse.weather))
//   }),
// )



// Effect.gen(function* ($) {
//     const httpClient = yield* $(Http.client.Client)

//     // We're preparing a custom http client that will be used to send the request to the wttr.in service.
//     const wttrClient = httpClient.pipe(
//       // Always prepend the service url to all requests. This makes it more convenient to use the client.
//       Http.client.mapRequest(Http.request.prependUrl(options.url)),
//       // Tell the wttr.in service to return json.
//       Http.client.mapRequest(Http.request.appendUrlParam('format', 'j1')),
//       // Only accept responses with a `2xx` status code. Fail otherwise.
//       Http.client.filterStatusOk,
//       // Decode all responses using the `WttrResponseSchema` schema.
//       Http.client.mapEffect(Http.response.schemaBodyJson(WttrResponseSchema)),
//     )






