import { useEffect, useContext, useState } from 'preact/hooks';

import { UserContext } from '../components/contexts/UserContext';

type Agent = {
    id: string;
    user_id: string;
    name: string;
    updated_at: string;
    elo: number;
    secret?: string;
};

export default function Account() {
    const user = useContext(UserContext);
    const [agents, setAgents] = useState([] as Agent[]);

    const [agentName, setAgentName] = useState('');
    const [agentVersion, setAgentVersion] = useState('');

    function sanitizeAgentName(name: string, e: Event) {
        const sanitized = name.toLowerCase().replace(/[^a-z-]/g, '');
        setAgentName(sanitized);

        if (e.currentTarget instanceof HTMLInputElement) {
            e.currentTarget.value = sanitized;
        }
    }

    function sanitizeAgentVersion(version: string, e: Event) {
        const sanitized = version.toLowerCase().replace(/[^a-z0-9.]/g, '');
        setAgentVersion(sanitized);

        if (e.currentTarget instanceof HTMLInputElement) {
            e.currentTarget.value = sanitized;
        }
    }

    useEffect(() => {
        if (!user) return;

        fetch(`${import.meta.env.VITE_API_HOST}/agents`, {
            headers: {
                Authorization: `Bearer ${window.localStorage.getItem('token')}`,
            },
        })
        .then((res) => res.json() as Promise<{ success: boolean, agents: Agent[] }>)
        .then((data) => {
            if (data.success && data.agents) {
                setAgents(data.agents);
            }
        })
        .catch((err) => {
            console.error('Error fetching agents:', err);
        });
    }, [user]);

    function deleteAgent(agentId: string) {
        fetch(`${import.meta.env.VITE_API_HOST}/agents/${agentId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${window.localStorage.getItem('token')}`,
            },
        })
        .then(async (res) => {
            console.log(res);

            if (!res.ok) {
                const body = await res.json() as { error: string };
                alert(`Failed to delete agent. ${body.error}.`);
            }
            return res;
        })
        .then((res) => res.json() as Promise<{ success: boolean }>)
        .then((data) => {
            if (data.success) {
                setAgents((prevAgents) => prevAgents.filter(agent => agent.id !== agentId));
            }
        })
        .catch((err) => {
            console.error('Error deleting agent:', err);
        });
    }

    function registerAgent(name: string, version: string, label?: string) {
        fetch(`${import.meta.env.VITE_API_HOST}/agents`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${window.localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, version, label }),
        })
        .then(async (res) => {
            console.log(res);

            if (!res.ok) {
                const body = await res.json() as { error: string };
                alert(`Failed to register agent. ${body.error}`);
            }
            return res;
        })
        .then((res) => res.json() as Promise<{ success: boolean, agent?: Agent }>)
        .then((data) => {
            if (data.success && data.agent) {
                setAgents((prevAgents) => [...prevAgents, data.agent!]);
            }
        })
        .catch((err) => {
            console.error('Error registering agent:', err);
        });
    }

    function regenerateSecret(agentId: string) {
        fetch(`${import.meta.env.VITE_API_HOST}/agents/${agentId}/rotate-secret`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${window.localStorage.getItem('token')}`,
            },
        })
        .then(async (res) => {
            console.log(res);

            if (!res.ok) {
                const body = await res.json() as { error: string };
                alert(`Failed to regenerate secret. ${body.error}`);
            }
            return res;
        })
        .then((res) => res.json() as Promise<{ success: boolean, agent?: Agent }>)
        .then((data) => {
            if (data.success && data.agent) {
                setAgents((prevAgents) => prevAgents.map(agent => agent.id === agentId ? data.agent! : agent));
            }
        })
        .catch((err) => {
            console.error('Error regenerating secret:', err);
        });
    }

    if (!user) {
        return (
            <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                <h1 class="text-3xl sm:text-5xl font-bold">Account</h1>
                <p class="mt-3 text-slate-300 max-w-3xl">
                    You must be logged in to view your account details.
                </p>
            </main>
        );
    }

    return (
        <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <h1 class="text-3xl sm:text-5xl font-bold">Account</h1>
            
            { agents && agents.length ? (
                <div class="mt-6">
                    <h2 class="text-2xl sm:text-3xl font-semibold">Your Agents</h2>
                    <ul class="mt-4 space-y-2">
                        {agents.map(agent => (
                            <li key={agent.id} class="border border-slate-700 rounded p-4">
                                <div class="flex justify-between items-center">
                                    <span class="font-medium">{agent.name}</span>
                                    <span class="text-sm text-slate-400">ELO: {agent.elo}</span>
                                </div>
                                <div class="text-sm text-slate-400 mt-1">Last Updated: {new Date(agent.updated_at).toLocaleString()}</div>

                                { agent.secret && (
                                    <div class="mt-2 text-sm text-slate-300">
                                        Secret: <span class="font-mono">{agent.secret}</span>
                                    </div>
                                )}

                                <button onClick={() => regenerateSecret(agent.id)} class="mt-2 inline-flex items-center gap-1 rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-blue-500">
                                    Regenerate Secret
                                </button>

                                <button onClick={() => deleteAgent(agent.id)} class="mt-2 inline-flex items-center gap-1 rounded bg-red-600 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-red-500">
                                    Delete Agent
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p class="mt-6 text-slate-300">You have no registered agents.</p>
            ) }

            <div class="mt-6 flex flex-col gap-2 border-t border-slate-700 pt-6">
                <h2 class="text-2xl sm:text-3xl font-semibold">Register a New Agent</h2>
                <p class="mt-2 text-slate-300">Click the button below to register a new agent. You can then upload your agent's code and participate in competitions.</p>

                <label for="agent-name" class="block mt-4 text-sm font-medium text-slate-300">Agent Name</label>
                <input
                    id="agent-name"
                    type="text"
                    pattern="[a-z\-]+"
                    class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:ring focus:ring-blue-500/20"
                    value={agentName}
                    onInput={(e) => sanitizeAgentName(e.currentTarget.value, e)}
                />

                <label for="agent-version" class="block mt-4 text-sm font-medium text-slate-300">Agent Version</label>
                <input
                    id="agent-version"
                    type="text"
                    pattern="[a-z0-9\.]+"
                    placeholder="i.e. v1"
                    class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:ring focus:ring-blue-500/20"
                    value={agentVersion}
                    onInput={(e) => sanitizeAgentVersion(e.currentTarget.value, e)}
                />

                <button onClick={() => registerAgent(agentName, agentVersion)} class="mt-4 inline-flex items-center gap-1 rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-blue-500">
                    Register Agent
                </button>
            </div>
        </main>
    );
}
