import PropTypes from 'prop-types';

export default function ClockDisplay({ state }) {
    // on 'paused' state, displays sesssion or break time depending on state.historyValue 
    // (i.e., what was the previous state)
    function display() {
        let display = state.context.session_time;
        if (state.value === 'paused') {
            if (state.historyValue) {
                state.historyValue.states.counting.current === 'break' 
                ? display = state.context.break_time
                : display = state.context.session_time
            }
        }
        if (state.value.counting === 'break') {
            display = state.context.break_time
        }
        return display
    }

    return (
            <span id="time-left">{formatTime(display())}</span> // DISPLAY TIME REMAINING
    )
}

ClockDisplay.propTypes = {
    state: PropTypes.object.isRequired
}

// helper function, convert number of seconds in mm:ss format:
function formatTime(seconds) {
    let sec = (seconds % 60).toString();
    let min = seconds === 3600
        ? 60 // display 60 min if sec === 3600
        : Math.floor((seconds / 60) % 60).toString();
    if (sec.length === 1) { sec = '0' + sec }
    if (min.length === 1) { min = '0' + min }
    return (min + ':' + sec).replace(/-1:-1/, '00:00')
}