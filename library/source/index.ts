import { useEffect } from 'react';

type IAnyFunction = (...args: Array<any>) => any;

interface IUseOnEveryUpdateOptions<TSideEffect extends IAnyFunction = VoidFunction> {
  sideEffect: TSideEffect;
  cleanup?: (sideEffectResult: ReturnType<TSideEffect>) => void;
}

function useOnEveryUpdate<TSideEffect extends IAnyFunction = VoidFunction>(
  opts: IUseOnEveryUpdateOptions<TSideEffect>
): void {
  useEffect(() => {
    const sideEffectResult: ReturnType<TSideEffect> = opts.sideEffect();

    return () => {
      if (!!opts.cleanup) {
        opts.cleanup(sideEffectResult);
      }
    };
  });
}

export default useOnEveryUpdate;
