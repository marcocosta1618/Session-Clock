import { createMachine, assign, send } from "xstate";

const sessionClockMachine = createMachine({
    id: 'sessionClock',
    initial: 'paused',
    context: {
        // time in seconds
        session_length: 25,
        break_length: 5,
        session_time: 25 * 60,
        break_time: 5 * 60
    },
    states: {
        paused: {
            id: 'paused',
            on: {
                // set session/break times:
                INC_SESSION: {
                    internal: true,  // internal transition to check condition
                    cond: (ctx) => ctx.session_length < 60,
                    actions: 'inc_session_length'
                },
                DEC_SESSION: {
                    internal: true,  
                    cond: (ctx) => ctx.session_length > 1,
                    actions: 'dec_session_length'
                },
                INC_BREAK: {
                    internal: true,
                    cond: (ctx) => ctx.break_length < 60,
                    actions: 'inc_break_length'
                },
                DEC_BREAK: {
                    internal: true,  
                    cond: (ctx) => ctx.break_length > 1,
                    actions: 'dec_break_length'
                },
                RESET: { actions: 'reset' },
                // start clock
                START: 'counting.hist'
            },
        },
        counting: {
            id: 'counting',
            initial: 'session',
            states: {
                session: {
                    invoke: { src: 'session_timer' },
                    always: {
                        target: 'break',
                        cond: (ctx) => ctx.session_time < 0
                    },
                    exit: 'rewind_break'
                },
                break: {
                    invoke: { src: 'break_timer' },
                    always: {
                        target: 'session',
                        cond: (ctx) => ctx.break_time < 0
                    },
                    exit: 'rewind_session'
                },
                hist: { type: 'history' }
            },
            on: {
                PAUSE: 'paused',
                DEC_SESSION_TIME: { actions: 'dec_session_time' },
                DEC_BREAK_TIME: { actions: 'dec_break_time' },
                RESET: {
                    target: ['counting.session'],      // reset machine to counting.session for the next start...
                    actions: [send('PAUSE'), 'reset']  // then pause it and reset times to default
                }
            }
        }
    }
}, {
    actions: {
        // reset to default time values:
        reset: assign({
            session_length: 25,
            break_length: 5,
            session_time: 25 * 60,
            break_time: 5 * 60
        }),
        // set session and break lengths: 
        inc_session_length: assign({
            session_time: (ctx) => (ctx.session_length + 1) * 60,
            session_length: (ctx) => ctx.session_length + 1,
        }),
        dec_session_length: assign({
            session_time: (ctx) => (ctx.session_length - 1) * 60,
            session_length: (ctx) => ctx.session_length - 1,
        }),
        inc_break_length: assign({
            break_time: (ctx) => (ctx.break_time + 1) * 60,
            break_length: (ctx) => ctx.break_length + 1
        }),
        dec_break_length: assign({
            break_time: (ctx) => (ctx.break_time - 1) * 60,
            break_length: (ctx) => ctx.break_length - 1
        }),
        // rewind session time (on break exit) 
        rewind_session: assign({
            session_time: (ctx) => (ctx.session_length) * 60
        }),
        // rewind break time (on session exit)
        rewind_break: assign({
            break_time: (ctx) => (ctx.break_length) * 60
        }),
        // decrement session/break times by 1 sec 
        // (actions called repeatedly by setInterval() in session_timer and break_timer services):
        dec_session_time: assign({
            session_time: (ctx) => ctx.session_time -= 1
        }),
        dec_break_time: assign({
            break_time: (ctx) => ctx.break_time -= 1
        })
    },
    services: {
        session_timer: (_, __) => (callback, _) => {
            const id = setInterval(() => callback('DEC_SESSION_TIME'), 1000);
            return () => clearInterval(id)
        },
        break_timer: (_, __) => (callback, _) => {
            const id = setInterval(() => callback('DEC_BREAK_TIME'), 1000);
            return () => clearInterval(id)
        }
    }
})

export default sessionClockMachine;