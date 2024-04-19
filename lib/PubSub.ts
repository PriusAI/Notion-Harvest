// eslint-disable-next-line @typescript-eslint/ban-types
const registry: { [key: string]: Function | null } = {};

// 发布事件
export const pub = (key: string, ...args: any) => {
  //   if (!registry[key]) return;
  const fn = registry[key];
  if (!fn) return;
  // eslint-disable-next-line prefer-spread
  fn.apply(null, args);
};

// 订阅事件
export const sub = (key: string, fn: (...args: any) => void) => {
  if (registry[key]) {
    delete registry[key];
  }
  registry[key] = fn;
};

const PubSub = { pub, sub };

export default PubSub;
