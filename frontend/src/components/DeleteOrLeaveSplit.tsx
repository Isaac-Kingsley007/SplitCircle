import { useState } from 'react';
import { useNavigate } from 'react-router';

interface DeleteOrLeaveSplitProps {
    splitId: number | string;
    hasWriteAccess: boolean;
}

const API_BASE_URL = import.meta.env.VITE_BASE_URL ?? 'http://localhost:3000/api';

export default function DeleteOrLeaveSplit({ splitId, hasWriteAccess }: DeleteOrLeaveSplitProps) {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const actionLabel = hasWriteAccess ? 'Delete Split' : 'Leave Split';
    const confirmTitle = hasWriteAccess ? 'Delete this split?' : 'Leave this split?';
    const confirmText = hasWriteAccess
        ? 'This will permanently delete the split and all related data.'
        : 'This will remove you from the split.';

    const handleConfirm = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(
                `${API_BASE_URL}/splits/${hasWriteAccess ? 'delete-split' : 'leave-split'}`,
                {
                    method: hasWriteAccess ? 'DELETE' : 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ split_id: Number(splitId) }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                setError(data.error ?? data.message ?? 'Unable to complete action.');
                return;
            }

            navigate('/');
        } catch {
            setError('Unable to connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={`rounded-2xl px-5 py-3 font-semibold transition ${
                    hasWriteAccess
                        ? 'border border-rose-400/40 text-rose-200 hover:border-rose-300 hover:text-rose-100'
                        : 'border border-amber-400/40 text-amber-200 hover:border-amber-300 hover:text-amber-100'
                }`}
            >
                {actionLabel}
            </button>

            {open ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl shadow-black/40">
                        <h3 className="text-2xl font-semibold text-slate-100">{confirmTitle}</h3>
                        <p className="mt-3 text-sm text-slate-400">{confirmText}</p>

                        {error ? (
                            <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                                {error}
                            </p>
                        ) : null}

                        <div className="mt-6 flex flex-wrap justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setOpen(false);
                                    setError('');
                                }}
                                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-slate-200 transition hover:bg-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={loading}
                                className={`rounded-2xl px-5 py-3 font-semibold text-slate-950 transition disabled:cursor-not-allowed disabled:opacity-70 ${
                                    hasWriteAccess ? 'bg-rose-400 hover:bg-rose-300' : 'bg-amber-300 hover:bg-amber-200'
                                }`}
                            >
                                {loading ? 'Please wait...' : actionLabel}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}