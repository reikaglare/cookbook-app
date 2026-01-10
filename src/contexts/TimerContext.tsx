import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Timer {
    id: string;
    label: string;
    duration: number; // Total duration in seconds
    remaining: number; // Remaining seconds
    status: 'running' | 'paused' | 'finished';
}

interface TimerContextType {
    timers: Timer[];
    addTimer: (label: string, minutes: number) => void;
    removeTimer: (id: string) => void;
    toggleTimer: (id: string) => void;
    resetTimer: (id: string) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
    const [timers, setTimers] = useState<Timer[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimers(prevTimers =>
                prevTimers.map(timer => {
                    if (timer.status === 'running') {
                        if (timer.remaining <= 0) {
                            return { ...timer, status: 'finished', remaining: 0 };
                        }
                        return { ...timer, remaining: timer.remaining - 1 };
                    }
                    return timer;
                })
            );
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const addTimer = (label: string, minutes: number) => {
        const newTimer: Timer = {
            id: crypto.randomUUID(),
            label,
            duration: minutes * 60,
            remaining: minutes * 60,
            status: 'running'
        };
        setTimers(prev => [...prev, newTimer]);
    };

    const removeTimer = (id: string) => {
        setTimers(prev => prev.filter(t => t.id !== id));
    };

    const toggleTimer = (id: string) => {
        setTimers(prev => prev.map(t => {
            if (t.id === id) {
                if (t.status === 'finished') return t; // Can't toggle finished
                return { ...t, status: t.status === 'running' ? 'paused' : 'running' };
            }
            return t;
        }));
    };

    const resetTimer = (id: string) => {
        setTimers(prev => prev.map(t => {
            if (t.id === id) {
                return { ...t, remaining: t.duration, status: 'paused' };
            }
            return t;
        }));
    };

    return (
        <TimerContext.Provider value={{ timers, addTimer, removeTimer, toggleTimer, resetTimer }}>
            {children}
        </TimerContext.Provider>
    );
}

export function useTimer() {
    const context = useContext(TimerContext);
    if (context === undefined) {
        throw new Error('useTimer must be used within a TimerProvider');
    }
    return context;
}
