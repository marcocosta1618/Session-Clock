export default function ClockDisplay({ state }) {

    // on 'paused' state, displays sesssion or break time depending on state.historyValue 
    // (i.e., previous state before 'paused')
    function display() {
        let display = state.context.session_time;
        if (state.value.counting === 'session') {
            return display;
        } else if (state.value.counting === 'break') {
            display = state.context.break_time
        } else if (state.value === 'paused') {
            if (state.historyValue !== undefined) {
                if (state.historyValue.states.counting.current === 'break') {
                    display = state.context.break_time
                } else {
                    display = state.context.session_time
                }
            }
        }
        return display
    }

    return (
        <span id="time-left">
            current state: || {state.value === 'paused' ? 'PAUSED' : 'COUNTING'} ||
            <div> session time: {formatTime(state.context.session_time)}; </div>
            <div> break time: {formatTime(state.context.break_time)}; </div>
            DISPLAY: {formatTime(display())}
        </span>
    )
}

// helper function, convert number of seconds in mm:ss format:
function formatTime(seconds) {
    let sec = (seconds % 60).toString();
    let min = Math.floor((seconds / 60) % 60).toString();
    // let hour = Math.floor((seconds / 3600)).toString();
    if (sec.length === 1) { sec = '0' + sec }
    if (min.length === 1) { min = '0' + min }
    return min + ':' + sec
}