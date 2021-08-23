import { useMachine } from '@xstate/react';
import sessionClockMachine from './sessionClockMachine.js';
import { useState, useEffect } from 'react';
import ClockDisplay from './ClockDisplay.js';
import './style/SessionClock.css';

function SessionClock() {
  const [state, send] = useMachine(sessionClockMachine); // state-machine

  const [isOn, setIsOn] = useState(false); // timer START/STOP button state

  function clockStartStop() {
    if (isOn) {
      send({ type: 'PAUSE' })
      setIsOn(false)
    } else {
      send({ type: 'START' })
      setIsOn(true)
    }
  }

  // if 'RESET' button is pressed, set (timer START/STOP) button to 'START' 
  useEffect(() => {
    if (state.value === 'paused' && isOn) {
      setIsOn(false)
    }
  }, [state.value, isOn])


  return (
    <div>
      {/* decrement/increment session_length in machine */}
      <button onClick={() => send({ type: 'DEC_SESSION' })}>decrement session</button>
      <span>session length: {state.context.session_length}</span>
      <button onClick={() => send({ type: 'INC_SESSION' })}>increment session</button>

      {/* decrement/increment break_length in machine */}
      <button onClick={() => send({ type: 'DEC_BREAK' })}>decrement break</button>
      <span>break length: {state.context.break_length}</span>
      <button onClick={() => send({ type: 'INC_BREAK' })}>increment break</button>

      <ClockDisplay state={state} ></ClockDisplay>

      <button onClick={() => clockStartStop()}> {isOn ? 'PAUSE' : 'START'}</button>
      <button onClick={() => send({ type: 'RESET' })}> RESET</button>
    </div>
  );
}

export default SessionClock;
