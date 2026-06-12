import { post } from "../lib/server";
import { useNavigate } from "react-router";
import { useState } from "react";

function Logout() {
    const navigate = useNavigate();
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const handleLogout = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await post('/auth/logout', {});

            if (response?.success === false) {
                setError(response?.error ?? 'Unable to log out.');
                return;
            }

            setOpen(false);
            navigate('/signin');
        } catch {
            setError('Unable to connect to the server.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <button
                type="button"
                onClick={() => {
                    setError("");
                    setOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 shadow-lg shadow-black/10 transition hover:border-white/20 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-rose-400/40"
            >
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                Logout
            </button>

        {open ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl shadow-black/40 ring-1 ring-white/5">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/20">
                            ⎋
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-2xl font-semibold text-slate-100">Logout</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                Are you sure you want to log out of your account?
                            </p>
                        </div>
                    </div>

                    {error ? (
                        <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                            {error}
                        </p>
                    ) : null}

                    <div className="mt-6 flex flex-wrap justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                setError("");
                            }}
                            disabled={loading}
                            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={loading}
                            className="rounded-2xl bg-gradient-to-r from-rose-400 to-orange-400 px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-rose-500/20 transition hover:from-rose-300 hover:to-orange-300 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {loading ? 'Please wait...' : 'Logout'}
                        </button>
                    </div>
                        </div>
            </div>
        ) : null}

        </div>
    )
}

export default Logout;