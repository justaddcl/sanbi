export type None<Type> = {
  [Property in keyof Type]?: never;
};
