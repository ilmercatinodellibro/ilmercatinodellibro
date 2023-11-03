import { PubSub } from "graphql-subscriptions";

// `keyof Record<string, any>` gives `string | number | symbol`
// so we need to filter it to only keep `string`
type NamesOf<T> = Extract<keyof T, string>;

export class TypedPubSub<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TMap extends Record<string, any>,
> extends PubSub {
  async publish<TName extends NamesOf<TMap>>(
    triggerName: TName,
    notification: TMap[TName],
  ): Promise<void> {
    await super.publish(triggerName, notification);
  }

  async subscribe<TName extends NamesOf<TMap>>(
    triggerName: TName,
    onMessage: (payload: TMap[TName]) => void,
  ): Promise<number> {
    return super.subscribe(triggerName, onMessage);
  }

  asyncIterator<TName extends NamesOf<TMap>>(
    triggerName: TName,
  ): AsyncIterator<TMap[TName]>;
  asyncIterator<TNames extends NamesOf<TMap>[]>(
    triggerNames: TNames,
  ): AsyncIterator<TMap[TNames[number]]>;
  asyncIterator<T>(
    triggers: NamesOf<TMap> | NamesOf<TMap>[],
  ): AsyncIterator<T> {
    return super.asyncIterator<T>(triggers);
  }
}
