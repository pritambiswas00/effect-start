import * as Brand from "effect/Brand";

export type Rupees = number & Brand.Brand<"Rup">;
export const Rupees = Brand.nominal<Rupees>();

export type Payed = number & Brand.Brand<"Payed">;
export const Payed = Brand.nominal<Payed>();

const payment = Payed(Rupees(10));
console.log("Rupees: %o", payment);