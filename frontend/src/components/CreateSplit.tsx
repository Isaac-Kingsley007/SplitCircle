import { useState, type SubmitEvent } from 'react';
import { post } from '../lib/server';

interface CreateSplitProps {
    onClose: () => void;
    onCreated: () => void;
}

export default function CreateSplit({ onClose, onCreated }: CreateSplitProps) {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Please enter a split name.');
            return;
        }

        setLoading(true);
        try {
            const res = await post('/splits/create-split', { split_name: name.trim() });
            if (!res || !res.success) {
                setError(res?.error ?? 'Unable to create split');
                return;
            }

            // success -> notify parent to refresh and close
            onCreated();
            onClose();
        } catch (err) {
            setError('Server error creating split');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-2xl bg-slate-900/90 p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-slate-100">Create new split</h3>
                <p className="mt-1 text-sm text-slate-400">Give your split a name so others can join.</p>

                <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm text-slate-300 mb-2" htmlFor="splitName">Split name</label>
                        <input
                            id="splitName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
                            placeholder="e.g. Weekend Dinner"
                            required
                        />
                    </div>

                    {error ? <p className="text-sm text-rose-400">{error}</p> : null}

                    <div className="flex gap-3 justify-end">
                        <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 bg-white/5 text-slate-200">Cancel</button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg px-4 py-2 bg-cyan-400 text-slate-950 font-semibold disabled:opacity-60"
                        >
                            {loading ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
