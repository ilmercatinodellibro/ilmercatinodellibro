import { PubSub } from "graphql-subscriptions";
import type { PubSubAsyncIterableIterator } from "graphql-subscriptions/dist/pubsub-async-iterable-iterator";

// `keyof Record<string, any>` gives `string | number | symbol`
// so we need to filter it to only keep `string`
type NamesOf<T> = Extract<keyof T, string>;

export class TypedPubSub<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TMap extends Record<string, any>,
> extends PubSub<TMap> {
  asyncIterableIterator<TName extends NamesOf<TMap>>(
    triggerName: TName,
  ): PubSubAsyncIterableIterator<TMap[TName]>;
  asyncIterableIterator<TNames extends readonly NamesOf<TMap>[]>(
    triggerNames: TNames,
  ): PubSubAsyncIterableIterator<TMap[TNames[number]]>;
  asyncIterableIterator<T>(
    triggers: NamesOf<TMap> | NamesOf<TMap>[],
  ): PubSubAsyncIterableIterator<T> {
    return super.asyncIterableIterator<T>(triggers);
  }
}
