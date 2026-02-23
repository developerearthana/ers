"use client";

import { useState, useEffect } from 'react';
import { Mic, Square, Loader2, Play, CheckCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CardWrapper } from '@/components/ui/page-wrapper';

export function VoiceInput({ onTranscript }: { onTranscript?: (text: string) => void }) {
    const [state, setState] = useState<'idle' | 'recording' | 'processing' | 'done'>('idle');
    const [duration, setDuration] = useState(0);
    const [transcript, setTranscript] = useState("");

    // Mock Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (state === 'recording') {
            interval = setInterval(() => setDuration(p => p + 1), 1000);
        } else {
            setDuration(0);
        }
        return () => clearInterval(interval);
    }, [state]);

    const handleStart = () => {
        setState('recording');
        setTranscript("");
    };

    const handleStop = () => {
        setState('processing');
        // Simulate transcription delay
        setTimeout(() => {
            const mockText = "Met with the client today. They are very interested in the Premium Plan but want a 10% discount for an annual commitment. Need to check with the manager.";
            setTranscript(mockText);
            setState('done');
            if (onTranscript) onTranscript(mockText);
        }, 1500);
    };

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <CardWrapper className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Voice Note</h4>

            <div className="flex items-center gap-4">
                {/* Record Button */}
                <button
                    onClick={state === 'recording' ? handleStop : handleStart}
                    disabled={state === 'processing'}
                    className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg",
                        state === 'idle' || state === 'done' ? "bg-primary text-white hover:bg-primary/90 hover:scale-105" :
                            state === 'recording' ? "bg-red-500 text-white animate-pulse" :
                                "bg-white text-gray-400 cursor-not-allowed"
                    )}
                >
                    {state === 'processing' ? <Loader2 className="w-5 h-5 animate-spin" /> :
                        state === 'recording' ? <Square className="w-4 h-4 fill-current" /> :
                            <Mic className="w-5 h-5" />}
                </button>

                {/* Status / Visualizer */}
                <div className="flex-1">
                    {state === 'idle' && <p className="text-sm text-gray-500">Click microphone to start recording...</p>}

                    {state === 'recording' && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 h-6">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <motion.div
                                        key={i}
                                        className="w-1 bg-red-400 rounded-full"
                                        animate={{ height: [4, 16, 4] }}
                                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                    />
                                ))}
                            </div>
                            <span className="text-sm font-mono text-red-500 font-bold">{formatTime(duration)}</span>
                        </div>
                    )}

                    {state === 'processing' && (
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                            Transcribing audio...
                        </p>
                    )}

                    {state === 'done' && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="bg-background p-3 rounded-lg border border-gray-100 mb-2">
                                <p className="text-sm text-gray-800 leading-relaxed">"{transcript}"</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                                    <Play className="w-3 h-3" /> Play Audio
                                </button>
                                <button onClick={() => setState('idle')} className="text-xs font-bold text-red-500 flex items-center gap-1 hover:underline ml-auto">
                                    <Trash2 className="w-3 h-3" /> Delete
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </CardWrapper>
    );
}

