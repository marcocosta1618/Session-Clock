import { useMachine } from '@xstate/react';
import sessionClockMachine from './sessionClockMachine.js';
import { useState, useEffect, useRef } from 'react';
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

  // play sound on session/break end:
  useEffect(() => {
    if ((state.context.session_time === 0) || (state.context.break_time === 0)) {
      playSound();
    }
  }, [state.context.session_time, state.context.break_time])

  // AUDIO
  const audioEl = useRef(null);

  function playSound() {
    // play sound (and prevent promise errors when running
    // FCC test suite in Chrome):
    const sound = audioEl.current;
    sound.currentTime = 0;
    let playPromise = sound.play();
    if (playPromise !== undefined) {
      playPromise.then(_ => { })
        .catch(error => {
          console.log(error);
        })
    }
  }
  // stop sound on reset
  function onReset() {
    const sound = audioEl.current;
    sound.pause();
    sound.currentTime = 0;
    // send RESET to machine
    send({ type: 'RESET'});
  }

  return (
    <div>
      {/* send decrement/increment session_length to machine */}
      <button id='session-decrement' onClick={() => send({ type: 'DEC_SESSION' })}>decrement session</button>
      <div id='session-label'>session length:
        <span id='session-length'>{(state.context.session_length)}</span>
      </div>
      <button id='session-increment' onClick={() => send({ type: 'INC_SESSION' })}>increment session</button>
      {/* send decrement/increment break_length to machine */}
      <button id='break-decrement' onClick={() => send({ type: 'DEC_BREAK' })}>decrement break</button>
      <div id='break-label'>break length:
        <span id='break-length'>{(state.context.break_length)}</span>
      </div>
      <button id='break-increment' onClick={() => send({ type: 'INC_BREAK' })}>increment break</button>
      <span id='timer-label'> {/* displaying current state */}
        {!(state.value.hasOwnProperty('counting'))
          ? 'PAUSED'
          : state.value.counting === 'session'
            ? 'SESSION'
            : 'BREAK'}
      </span>
      <ClockDisplay state={state} ></ClockDisplay>
      <button id='start_stop' onClick={() => clockStartStop()}> {isOn ? 'PAUSE' : 'START'}</button>
      <button id='reset' onClick={onReset}> RESET</button>
      <audio id='beep' ref={audioEl} src='./sounds/gongCsharp7.wav'>
      </audio>
    </div>
  );
}

export default SessionClock;