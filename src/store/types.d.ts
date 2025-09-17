import { StateCreator } from "zustand";

export type ImmerStateCreator<T, S> = StateCreator<
  S,
  [["zustand/immer", never], never],
  [],
  T
>;
