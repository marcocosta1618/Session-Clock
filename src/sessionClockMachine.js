import { createMachine, assign } from "xstate";

const sessionClockMachine = createMachine({
    id: 'sessionClock',
    initial: 'paused',
    context: {
        // time in seconds
        session_length: 7,
        break_length: 3,
        current_session: 7,
        current_break: 3
    },
    states: {
        paused: {
            id: 'paused',
            on: {
                // set session/break times:
                INC_SESSION: {
                    actions: [ assign({ current_session: (ctx) => ctx.session_length }), 'inc_session' ]
                },
                DEC_SESSION: {
                    internal: true,
                    cond: (ctx) => ctx.session_length > 1,
                    actions: [ assign({ current_session: (ctx) => ctx.session_length }), 'dec_session' ]
                },
                INC_BREAK: {
                    actions: [ assign({ current_break: (ctx) => ctx.break_length }), 'inc_break' ] 
                },
                DEC_BREAK: {
                    internal: true,
                    cond: (ctx) => ctx.break_length > 1,
                    actions: [ assign({ current_break: (ctx) => ctx.break_length }), 'dec_break' ]
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
                        cond: (ctx) => ctx.current_session < 0
                    },
                    exit: 'rewind_break'
                },
                break: {
                    invoke: { src: 'break_timer' },
                    always: {
                        target: 'session',
                        cond: (ctx) => ctx.current_break < 0
                    },
                    exit: 'rewind_session'
                },
                hist: {
                    type: 'history'
                }
            },
            on: {
                PAUSE: 'paused',
                DEC_SESS: { actions: 'dec_current_session' },
                DEC_BREAK: { actions: 'dec_current_break' }
            }
        }
    }
}, {
    actions: {
        // reset to default time values:
        reset: assign({
            session_length: 7,
            break_length: 3,
            current_session: 7,
            current_break: 3
        }),
        // set session and break lengths: 
        inc_session: assign({
            session_length: (ctx) => ctx.session_length + 1,
            current_session: (ctx) => ctx.current_session + 1
        }),
        dec_session: assign({
            session_length: (ctx) => ctx.session_length - 1,
            current_session: (ctx) => ctx.current_session - 1
        }),
        inc_break: assign({
            break_length: (ctx) => ctx.break_length + 1,
            current_break: (ctx) => ctx.current_break + 1
        }),
        dec_break: assign({
            break_length: (ctx) => ctx.break_length - 1,
            current_break: (ctx) => ctx.current_break - 1
        }),
        // rewind session time (on break exit) 
        rewind_session: assign({
            current_session: (ctx) => ctx.session_length
        }),
        // rewind break time (on session exit)
        rewind_break: assign({
            current_break: (ctx) => ctx.break_length
        }),
        // decrement session/break times by 1 sec 
        // (actions called repeatedly by session_timer and break_timer):
        dec_current_session: assign({
            current_session: (ctx) => ctx.current_session -= 1
        }),
        dec_current_break: assign({
            current_break: (ctx) => ctx.current_break -= 1
        })
    },
    services: {
        session_timer: (ctx, event) => (callback, onReceive) => {
            const id = setInterval(() => callback('DEC_SESS'), 1000);
            return () => clearInterval(id)
        },
        break_timer: (ctx, event) => (callback, onReceive) => {
            const id = setInterval(() => callback('DEC_BREAK'), 1000);
            return () => clearInterval(id)
        }
    }
})

export default sessionClockMachine;