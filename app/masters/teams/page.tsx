"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, Users, Loader2, Edit, Trash2, LayoutGrid, List, X, User as UserIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/components/ui/toaster';
import { getTeams, createTeam, updateTeam, deleteTeam } from '@/app/actions/organization';
import { getAllUsers } from '@/app/actions/user';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
    _id: string;
    name: string;
    role: string;
    dept: string;
    jobTitle?: string;
    image?: string;
}

interface Team {
    _id?: string;
    id?: string;
    name: string;
    teamLead?: User | string; // Populated or ID
    members: User[] | string[]; // Populated or IDs
}

export default function TeamsMaster() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const [formData, setFormData] = useState<{
        name: string;
        teamLead: string;
        members: string[];
    }>({
        name: '',
        teamLead: '',
        members: []
    });

    // For member selection inside sheet
    const [selectedMemberToAdd, setSelectedMemberToAdd] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadData();
        const savedView = localStorage.getItem('teamsViewMode');
        if (savedView === 'grid' || savedView === 'list') {
            setViewMode(savedView);
        }
    }, []);

    const toggleViewMode = (mode: 'grid' | 'list') => {
        setViewMode(mode);
        localStorage.setItem('teamsViewMode', mode);
    };

    const loadData = async () => {
        setLoading(true);
        const [teamsData, usersData] = await Promise.all([
            getTeams(),
            getAllUsers()
        ]);
        setTeams(teamsData || []);
        setAllUsers(usersData || []);
        setLoading(false);
    };

    const handleOpenSheet = (team?: Team) => {
        if (team) {
            setCurrentTeam(team);
            setFormData({
                name: team.name,
                teamLead: typeof team.teamLead === 'object' ? (team.teamLead?._id || '') : (team.teamLead || ''),
                members: team.members.map(m => typeof m === 'object' ? m._id : m)
            });
        } else {
            setCurrentTeam(null);
            setFormData({ name: '', teamLead: '', members: [] });
        }
        setSelectedMemberToAdd('');
        setIsSheetOpen(true);
    };

    const handleAddMember = () => {
        if (!selectedMemberToAdd) return;
        if (!formData.members.includes(selectedMemberToAdd)) {
            setFormData(prev => ({
                ...prev,
                members: [...prev.members, selectedMemberToAdd]
            }));
        }
        setSelectedMemberToAdd('');
    };

    const handleRemoveMember = (userId: string) => {
        setFormData(prev => ({
            ...prev,
            members: prev.members.filter(id => id !== userId)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            let res;
            if (currentTeam && (currentTeam._id || currentTeam.id)) {
                res = await updateTeam({ ...formData, id: currentTeam._id || currentTeam.id });
            } else {
                res = await createTeam(formData);
            }

            if (res?.data?.success) {
                toast.success(currentTeam ? "Team updated" : "Team created");
                setIsSheetOpen(false);
                loadData();
            } else {
                toast.error(res?.data?.error || "Operation failed");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this team?")) {
            const res = await deleteTeam({ id });
            if (res?.data?.success) {
                toast.success("Team deleted");
                loadData();
            } else {
                toast.error(res?.data?.error || "Failed to delete");
            }
        }
    };

    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getMemberDetails = (id: string) => allUsers.find(u => u._id === id);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
                    <p className="text-gray-500">Create and manage functional teams.</p>
                </div>
                <Button onClick={() => handleOpenSheet()} className="bg-primary hover:bg-primary/90 shadow-md shadow-green-200">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Team
                </Button>
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm items-center">
                <div className="relative flex-1 w-full md:w-auto">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search teams..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex items-center border rounded-lg overflow-hidden shrink-0">
                    <button
                        onClick={() => toggleViewMode('grid')}
                        className={`p-2.5 ${viewMode === 'grid' ? 'bg-white text-gray-900' : 'bg-white text-gray-500 hover:text-gray-900'}`}
                        title="Grid View"
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                    <div className="w-px h-10 bg-white" />
                    <button
                        onClick={() => toggleViewMode('list')}
                        className={`p-2.5 ${viewMode === 'list' ? 'bg-white text-gray-900' : 'bg-white text-gray-500 hover:text-gray-900'}`}
                        title="List View"
                    >
                        <List className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content View */}
            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>
            ) : filteredTeams.length === 0 ? (
                <p className="text-center text-gray-500 py-10 bg-white rounded-xl border border-dashed">No teams created yet.</p>
            ) : (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredTeams.map((team) => (
                                <div key={team._id || team.id} className="bg-white border rounded-lg p-5 hover:shadow-md transition-all group flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{team.name}</h3>
                                            <div className="flex items-center mt-1 text-sm text-gray-500">
                                                <UserIcon className="w-3 h-3 mr-1" />
                                                <span className="font-medium text-gray-700">
                                                    {typeof team.teamLead === 'object' ? team.teamLead?.name : 'No Lead'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-2 space-y-3 flex-grow border-t pt-3">
                                        <div className="flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            <span>Team Members ({team.members.length})</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-1 max-h-[120px] overflow-y-auto pr-1">
                                            {team.members.length > 0 ? (
                                                team.members.map((member: any) => (
                                                    <div key={member._id} className="flex items-center gap-2 text-xs bg-background p-1.5 rounded">
                                                        <Avatar className="w-5 h-5">
                                                            <AvatarImage src={member.image} />
                                                            <AvatarFallback className="text-[9px]">{member.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col truncate">
                                                            <span className="font-medium text-gray-900 truncate">{member.name}</span>
                                                            <span className="text-[10px] text-gray-500 truncate">
                                                                {member.dept} • {member.role}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-sm text-gray-400 italic">No members added</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                            onClick={() => handleOpenSheet(team)}
                                        >
                                            <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDelete(team._id || team.id!)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-background border-b">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">Team Name</th>
                                            <th className="px-6 py-3 font-medium">Lead</th>
                                            <th className="px-6 py-3 font-medium">Members</th>
                                            <th className="px-6 py-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredTeams.map((team) => (
                                            <tr key={team._id || team.id} className="hover:bg-background/50">
                                                <td className="px-6 py-3 font-medium text-gray-900">{team.name}</td>
                                                <td className="px-6 py-3 text-gray-600">
                                                    {typeof team.teamLead === 'object' ? team.teamLead?.name : '-'}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex -space-x-2 overflow-hidden">
                                                        {team.members.map((member: any) => (
                                                            <div key={member._id} className="relative inline-block h-8 w-8 rounded-full ring-2 ring-white" title={`${member.name} (${member.dept} - ${member.role})`}>
                                                                <Avatar className="h-full w-full">
                                                                    <AvatarImage src={member.image} />
                                                                    <AvatarFallback className="text-[10px]">{member.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                                </Avatar>
                                                            </div>
                                                        ))}
                                                        {team.members.length === 0 && <span className="text-gray-400">-</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:bg-amber-50 rounded-full" onClick={() => handleOpenSheet(team)}>
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50 rounded-full" onClick={() => handleDelete(team._id || team.id!)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Create/Edit Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>{currentTeam ? 'Edit Team' : 'Create Team'}</SheetTitle>
                    </SheetHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 mt-6">

                        <div className="space-y-2">
                            <Label>Team Name</Label>
                            <Input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Apollo Launch Squad"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Team Lead</Label>
                            <Select
                                value={formData.teamLead}
                                onValueChange={(val) => setFormData({ ...formData, teamLead: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Team Lead" />
                                </SelectTrigger>
                                <SelectContent className="bg-white max-h-60">
                                    {allUsers.map(user => (
                                        <SelectItem key={user._id} value={user._id}>
                                            {user.name} <span className="text-gray-400 text-xs">({user.dept})</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3 pt-2 border-t">
                            <div className="flex items-center justify-between">
                                <Label>Members</Label>
                                <span className="text-xs text-gray-500">{formData.members.length} selected</span>
                            </div>

                            <div className="flex gap-2">
                                <Select
                                    value={selectedMemberToAdd}
                                    onValueChange={setSelectedMemberToAdd}
                                >
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Select member to add..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white max-h-60">
                                        {allUsers
                                            .filter(u => !formData.members.includes(u._id))
                                            .map(user => (
                                                <SelectItem key={user._id} value={user._id}>
                                                    {user.name} <span className="text-xs text-gray-500">[{user.role} - {user.dept}]</span>
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                                <Button type="button" size="sm" onClick={handleAddMember} disabled={!selectedMemberToAdd}>
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="space-y-2 max-h-60 overflow-y-auto bg-background rounded-lg p-2 border">
                                {formData.members.length === 0 ? (
                                    <p className="text-xs text-center text-gray-400 py-4">No members added yet.</p>
                                ) : (
                                    formData.members.map(memberId => {
                                        const user = getMemberDetails(memberId);
                                        if (!user) return null;
                                        return (
                                            <div key={memberId} className="flex items-center justify-between bg-white p-2 rounded shadow-sm border text-sm">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <Avatar className="w-6 h-6">
                                                        <AvatarImage src={user.image} />
                                                        <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col truncate">
                                                        <span className="font-medium truncate">{user.name}</span>
                                                        <span className="text-[10px] text-gray-500 truncate">
                                                            {user.dept} • {user.role}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveMember(memberId)}
                                                    className="text-gray-400 hover:text-red-500 p-1"
                                                    aria-label="Remove member"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        <SheetFooter>
                            <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Save Changes
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
}
