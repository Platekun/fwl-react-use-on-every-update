// 💡 https://jestjs.io/docs/api
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import React from 'react';
import useOnEveryUpdate from '../source';

afterEach(cleanup);

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

describe('useOnEveryUpdate', () => {
  it('should exist.', () => {
    expect(useOnEveryUpdate).not.toBeUndefined();
  });

  it('should run the side effect everytime', async () => {
    const ChildComponent: React.FC<{ onClickA: VoidFunction; onClickB: VoidFunction }> = (props) => {
      const handleButtonClickA = () => {
        props.onClickA();
      };

      const handleButtonClickB = () => {
        props.onClickB();
      };

      return (
        <>
          <button type="button" onClick={handleButtonClickA}>
            Update A
          </button>
          <button type="button" onClick={handleButtonClickB}>
            Update B
          </button>
        </>
      );
    };

    const ParentComponent: React.FC<{ whenCountChanges: VoidFunction }> = (props) => {
      const [countA, setCountA] = React.useState(0);
      const [countB, setCountB] = React.useState(0);

      useOnEveryUpdate({
        sideEffect: props.whenCountChanges,
      });

      const updateCountA = () => {
        setCountA(countA + 1);
      };

      const updateCountB = () => {
        setCountB(countB + 1);
      };

      return <ChildComponent onClickA={updateCountA} onClickB={updateCountB} />;
    };

    const sideEffect = jest.fn();

    const { findByText } = render(<ParentComponent whenCountChanges={sideEffect} />);

    expect(sideEffect).toHaveBeenCalledTimes(1);

    const numberOfClicksForButtonA = getRandomInt(50);
    const numberOfClicksForButtonB = getRandomInt(50);

    const buttonA = await findByText(/Update A/i);
    const buttonB = await findByText(/Update A/i);

    for (let i = 0; i < numberOfClicksForButtonA; i++) {
      fireEvent.click(buttonA);
    }

    for (let i = 0; i < numberOfClicksForButtonB; i++) {
      fireEvent.click(buttonB);
    }

    expect(sideEffect).toHaveBeenCalledTimes(1 + numberOfClicksForButtonA + numberOfClicksForButtonB);
  });

  it('should execute the cleanup function when unmounted.', () => {
    const sideEffect = jest.fn();
    const cleanup = jest.fn();

    const { unmount } = renderHook(() =>
      useOnEveryUpdate({
        sideEffect,
        cleanup,
      })
    );

    unmount();

    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('should execute the cleanup function with the correct arguments.', () => {
    const sideEffectResult = {
      unsubscribe: () => true,
    };

    const sideEffect = jest.fn().mockImplementation(() => sideEffectResult);
    const cleanup = jest.fn();

    const { unmount } = renderHook(() =>
      useOnEveryUpdate({
        sideEffect,
        cleanup,
      })
    );

    unmount();

    expect(cleanup).toHaveBeenCalledWith(sideEffectResult);
  });
});
