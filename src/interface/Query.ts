export type Where<T> =
  | {
      [key in keyof T]: {
        $eq?: T[key];
        $in?: T[key][];
        $like?: T[key];
      };
    }
  | object;
