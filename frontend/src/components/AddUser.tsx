import { useState, type FormEvent } from 'react';
import { post } from '../lib/server';

interface AddUserProps {
    splitId: number | string;
    onClose: () => void;
    onAdded: () => void; // called to refresh users
}

export default function AddUser({ splitId, onClose, onAdded }: AddUserProps) {
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!userName.trim()) {
            setError('Please enter a username.');
            return;
        }

        setLoading(true);
        try {
            const res = await post('/splits/add-user-to-split', {
                split_id: Number(splitId),
                user_name: userName.trim()
            });

            if (!res || !res.success) {
                setError(res?.error ?? 'Unable to add user');
                return;
            }

            // success -> notify parent and close
            onAdded();
            onClose();
        } catch (err) {
            setError('Server error adding user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-2xl bg-slate-900/90 p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-slate-100">Add user</h3>
                <p className="mt-1 text-sm text-slate-400">Add an existing user to this split.</p>

                <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm text-slate-300 mb-2" htmlFor="userName">
                            Username
                        </label>
                        <input
                            id="userName"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
                            placeholder="e.g. john_doe"
                            required
                        />
                        <p className="mt-2 text-xs text-slate-500">Username must be at least 5 characters.</p>
                    </div>

                    {error ? <p className="text-sm text-rose-400">{error}</p> : null}

                    <div className="flex gap-3 justify-end">
                        <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 bg-white/5 text-slate-200">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg px-4 py-2 bg-cyan-400 text-slate-950 font-semibold disabled:opacity-60"
                        >
                            {loading ? 'Adding...' : 'Add User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
