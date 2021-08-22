import { useMachine } from '@xstate/react';
import sessionClockMachine from './sessionClockMachine.js';
import { useState } from 'react';
import './style/SessionClock.css';

function SessionClock() {
  const [ state, send ] = useMachine(sessionClockMachine); // state-machine

  const [ isOn, setIsOn ] = useState(false); // timer on/off button state

  function clockStartStop() {
    if (isOn) {
      send({ type: 'PAUSE' })
      setIsOn(false)
    } else {
      send({ type: 'START' })
      setIsOn(true)
    }
  }
  // console.log(state.value)

  return (
    <div>
      {/* increment/decrement session_length in machine */}
      <button onClick={() => send({ type: 'INC_SESSION' })}>increment session</button>
      <span>session length: {state.context.session_length}</span>
      <button onClick={() => send({ type: 'DEC_SESSION' })}>decrement session</button>

      {/* increment/decrement break_length in machine */}
      <button onClick={() => send({ type: 'INC_BREAK' })}>increment break</button>
      <span>break length: {state.context.break_length}</span>
      <button onClick={() => send({ type: 'DEC_BREAK' })}>decrement break</button>

      <span 
        id="time-left">currently: \\{state.value === 'paused' ? 'paused' : 'counting'}\\
        session time: {state.context.current_session};  
        break time: {state.context.current_break}; 
        DISPLAY: {state.value.counting === 'session' ? state.context.current_session : state.context.current_break}
      </span>
      <button onClick={() => clockStartStop()}> {isOn ? 'PAUSE' : 'START'}</button> 
      <button onClick={() => send({ type: 'RESET' })}> reset</button>
    </div>
  );
}

export default SessionClock;
