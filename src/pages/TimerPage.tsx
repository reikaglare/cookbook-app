import { useState } from 'react';
import { useTimer, type Timer } from '../contexts/TimerContext';
import { Play, Pause, RotateCcw, X, Plus, Clock, Timer as TimerIcon } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

export default function TimerPage() {
    const { timers, addTimer, removeTimer, toggleTimer, resetTimer } = useTimer();
    const [newLabel, setNewLabel] = useState('');
    const [newMinutes, setNewMinutes] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const mins = parseInt(newMinutes);
        if (!mins || mins <= 0) {
            toast.error('Inserisci una durata valida');
            return;
        }
        addTimer(newLabel || 'Timer Personalizzato', mins);
        setNewLabel('');
        setNewMinutes('');
        toast.success('Timer avviato!');
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const getProgress = (t: Timer) => {
        if (t.duration === 0) return 0;
        return ((t.duration - t.remaining) / t.duration) * 100;
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-20">
            <div className="flex items-center space-x-3 mb-8">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <TimerIcon className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Timer Cucina</h1>
                    <p className="text-[var(--text-secondary)]">Gestisci i tuoi tempi di cottura</p>
                </div>
            </div>

            {/* Add Timer Form */}
            <div className="bg-[var(--bg-surface)] p-6 rounded-2xl shadow-sm border border-[var(--border-color)]">
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Nuovo Timer
                </h2>
                <form onSubmit={handleAdd} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Etichetta (Opzionale)</label>
                        <input
                            type="text"
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            placeholder="Es. Pasta, Forno..."
                            className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <div className="w-32">
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Minuti</label>
                        <input
                            type="number"
                            value={newMinutes}
                            onChange={(e) => setNewMinutes(e.target.value)}
                            placeholder="0"
                            min="1"
                            className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-center"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-primary text-white p-3 rounded-xl hover:bg-primary/90 transition-colors shadow-md transform active:scale-95"
                    >
                        <Play className="w-5 h-5" />
                    </button>
                </form>
            </div>

            {/* Active Timers List */}
            <div className="space-y-4">
                {timers.length === 0 ? (
                    <div className="text-center py-12 text-[var(--text-secondary)]">
                        <Clock className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p>Nessun timer attivo</p>
                    </div>
                ) : (
                    timers.map(timer => (
                        <div
                            key={timer.id}
                            className={clsx(
                                "relative overflow-hidden bg-[var(--bg-surface)] p-6 rounded-2xl shadow-sm border transition-all",
                                timer.status === 'finished'
                                    ? "border-red-500/50 shadow-red-100 dark:shadow-none animate-pulse"
                                    : "border-[var(--border-color)]"
                            )}
                        >
                            {/* Progress Background */}
                            <div
                                className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-1000 ease-linear"
                                style={{ width: `${getProgress(timer)}%` }}
                            />

                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center space-x-4">
                                    <div className={clsx(
                                        "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg",
                                        timer.status === 'finished' ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"
                                    )}>
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[var(--text-primary)] text-lg">{timer.label}</h3>
                                        <div className={clsx(
                                            "font-mono text-2xl font-bold",
                                            timer.status === 'finished' ? "text-red-500" : "text-[var(--text-primary)]"
                                        )}>
                                            {timer.status === 'finished' ? "SCADUTO!" : formatTime(timer.remaining)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => toggleTimer(timer.id)}
                                        disabled={timer.status === 'finished'}
                                        className={clsx(
                                            "p-3 rounded-full transition-colors",
                                            timer.status === 'running'
                                                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                                : "bg-green-100 text-green-700 hover:bg-green-200",
                                            timer.status === 'finished' && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        {timer.status === 'running' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                    </button>

                                    <button
                                        onClick={() => resetTimer(timer.id)}
                                        className="p-3 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <RotateCcw className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={() => removeTimer(timer.id)}
                                        className="p-3 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
