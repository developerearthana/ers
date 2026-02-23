"use client";

import { useState } from 'react';
import { Search, Plus, Calendar, Mail, Phone, MoreHorizontal, User } from 'lucide-react';

interface Candidate {
    id: number;
    name: string;
    position: string;
    stage: 'Applied' | 'Screening' | 'Interview' | 'Selected' | 'Rejected';
    email: string;
    phone: string;
    interviewDate?: string;
}

export default function RecruitmentPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([
        { id: 1, name: "Rahul Sharma", position: "Frontend Developer", stage: "Interview", email: "rahul.s@example.com", phone: "+91 9876543210", interviewDate: "2026-01-15 10:00 AM" },
        { id: 2, name: "Sneha Patel", position: "UX Designer", stage: "Screening", email: "sneha.p@example.com", phone: "+91 9876543211" },
        { id: 3, name: "Vikram Singh", position: "Backend Lead", stage: "Applied", email: "vikram.s@example.com", phone: "+91 9876543212" },
        { id: 4, name: "Anjali Gupta", position: "HR Executive", stage: "Selected", email: "anjali.g@example.com", phone: "+91 9876543213" },
    ]);

    const stages = ['Applied', 'Screening', 'Interview', 'Selected', 'Rejected'];

    const getStageColor = (stage: string) => {
        switch (stage) {
            case 'Applied': return 'bg-white text-gray-700 border-gray-200';
            case 'Screening': return 'bg-white text-blue-700 border-border';
            case 'Interview': return 'bg-white text-purple-700 border-border';
            case 'Selected': return 'bg-white text-green-700 border-border';
            case 'Rejected': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-white text-gray-700';
        }
    };

    const [showModal, setShowModal] = useState(false);
    const [newCandidate, setNewCandidate] = useState<Partial<Candidate>>({ stage: 'Applied' });

    const handleAddCandidate = () => {
        if (newCandidate.name && newCandidate.position && newCandidate.email) {
            setCandidates([...candidates, {
                id: candidates.length + 1,
                name: newCandidate.name,
                position: newCandidate.position,
                email: newCandidate.email,
                phone: newCandidate.phone || '',
                stage: newCandidate.stage as any || 'Applied',
                interviewDate: newCandidate.interviewDate
            }]);
            setShowModal(false);
            setNewCandidate({ stage: 'Applied' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Recruitment Pipeline</h1>
                    <p className="text-gray-500">Manage candidates and interview schedules.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Candidate
                </button>
            </div>

            <div className="flex overflow-x-auto pb-4 gap-6 scrollbar-hide">
                {stages.map((stage) => (
                    <div key={stage} className="min-w-[300px] flex flex-col gap-4">
                        <div className={`p-3 rounded-lg border flex justify-between items-center ${getStageColor(stage)}`}>
                            <h3 className="font-semibold">{stage}</h3>
                            <span className="bg-white/50 px-2 py-0.5 rounded text-xs font-bold">
                                {candidates.filter(c => c.stage === stage).length}
                            </span>
                        </div>

                        <div className="flex flex-col gap-3">
                            {candidates.filter(c => c.stage === stage).map(candidate => (
                                <div key={candidate.id} className="glass-card p-4 rounded-xl hover:shadow-md transition-shadow border border-gray-100 group cursor-pointer bg-white">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                {candidate.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 text-sm">{candidate.name}</h4>
                                                <p className="text-xs text-blue-600 font-medium">{candidate.position}</p>
                                            </div>
                                        </div>
                                        <button aria-label="More Options" className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="space-y-1.5 mb-3">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Mail className="w-3 h-3" />
                                            {candidate.email}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Phone className="w-3 h-3" />
                                            {candidate.phone}
                                        </div>
                                    </div>

                                    {candidate.interviewDate && stage === 'Interview' && (
                                        <div className="mt-3 p-2 bg-white rounded text-xs text-purple-700 flex items-center gap-2 border border-border">
                                            <Calendar className="w-3 h-3" />
                                            {candidate.interviewDate}
                                        </div>
                                    )}

                                    <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center">
                                        <a href="#" className="text-xs text-blue-500 hover:underline">View Resume</a>
                                        <button className="text-xs bg-background hover:bg-white text-gray-600 px-2 py-1 rounded transition-colors">
                                            Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {candidates.filter(c => c.stage === stage).length === 0 && (
                                <div className="p-4 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-400">
                                    No candidates
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Candidate Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Add New Candidate</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    className="w-full p-2 border rounded-lg"
                                    value={newCandidate.name || ''}
                                    onChange={e => setNewCandidate({ ...newCandidate, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    className="w-full p-2 border rounded-lg"
                                    value={newCandidate.email || ''}
                                    onChange={e => setNewCandidate({ ...newCandidate, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    id="phone"
                                    type="text"
                                    className="w-full p-2 border rounded-lg"
                                    value={newCandidate.phone || ''}
                                    onChange={e => setNewCandidate({ ...newCandidate, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">Position Applied</label>
                                <input
                                    id="position"
                                    type="text"
                                    className="w-full p-2 border rounded-lg"
                                    value={newCandidate.position || ''}
                                    onChange={e => setNewCandidate({ ...newCandidate, position: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-background rounded-lg">Cancel</button>
                                <button onClick={handleAddCandidate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Candidate</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
