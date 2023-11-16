//Effect Equal Traits//

import { Equal, Hash } from "effect";

export function AutoEqualHash<T extends new (...args: any[]) => {}>(constructor: T) {
    return class extends constructor implements Equal.Equal {
      constructor(...args: any[]) {
        super(...args);
      }
  
      [Equal.symbol](that: Equal.Equal): boolean {
        if (that instanceof constructor) {
          const thisKeys = Object.getOwnPropertyNames(this);
          return thisKeys.every((key) => Equal.equals((this as any)[key], (that as any)[key]));
        }
        return false;
      }
  
      [Hash.symbol](): number {
        const thisKeys = Object.getOwnPropertyNames(this);
        return thisKeys.reduce((hash, key) => {
          const value = (this as any)[key];
          return hash + (typeof value === 'string' ? value.length : value);
        }, 0);
      }
    };
  }


  
@AutoEqualHash
export class EqualEffectExample {
    constructor(public readonly property1: string, public readonly property2: number) { };
}

const example1 = new EqualEffectExample("SS", 2);
const example2 = new EqualEffectExample("SS", 2);

console.log(Equal.equals(example1, example2), example1);





