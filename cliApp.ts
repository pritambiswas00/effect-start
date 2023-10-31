import { Effect, Option } from 'effect';
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

const WeatherResponseSchema  = Schema.struct({ weather: Schema.array(WeatherSchema) });

const mainApp = Cli.make({
    name: "Test Weather",
    version: "1.0",
    command : Command.make('weather', {
         args: Args.between(Args.text({ name: "location" }), 0,1).pipe(Args.map(Option.fromIterable)),
    options: Options.all({
         URL: Options.withDefault(Options.text("URL"), "https://wttr.in"),
    })     
    })
});

const runProgram = Cli.run(mainApp, process.argv.slice(2), ({ options, args })=>
       Effect.gen(function* ($){
             const httpClient = yield* $(Http.client.Client)
             const wttrClient = httpClient.pipe(
                Http.client.mapRequest(Http.request.prependUrl(options.URL)),
                Http.client.mapRequest(Http.request.appendUrlParam("format", 'j1')),
                Http.client.filterStatusOk,
                Http.client.mapEffect(Http.response.schemaBodyJson(WeatherResponseSchema))
             )
             const weatherRequest = Option.match(args, {
                onNone: ()=>Http.request.get("/"),
                onSome : (_)=>Http.request.get(`/${encodeURIComponent(_)}`)
           });
           const wttrResponse = yield* $(wttrClient(weatherRequest))

           // TODO: Pretty print the weather.
           yield* $(Effect.log(wttrResponse.weather))       
       })
);

Bun.runMain(runProgram.pipe(
    Effect.provideLayer(Http.client.layer),
    Effect.tapErrorCause(Effect.logError)
))



