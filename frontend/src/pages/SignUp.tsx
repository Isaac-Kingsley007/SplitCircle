
import { useState, type SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { post } from '../lib/server';

function Signup() {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage('');

        if (password !== confirmPassword) {
            setMessage('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            const data = await post('/auth/signup', {
                user_name: userName,
                password
            });

            if (!data.success) {
                setMessage(data.error);
                return;
            }

            setMessage(data.message ?? 'Account created successfully. Redirecting to sign in...');
            navigate('/signin');
        } catch {
            setMessage('Unable to connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur">
                <div className="mb-8 text-center">
                    <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">SplitCircle</p>
                    <h1 className="mt-3 text-3xl font-semibold">Create account</h1>
                    <p className="mt-2 text-sm text-slate-400">Create your account to start tracking shared expenses.</p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor="user_name">
                            Username
                        </label>
                        <input
                            id="user_name"
                            name="user_name"
                            type="text"
                            autoComplete="username"
                            value={userName}
                            onChange={(event) => setUserName(event.target.value)}
                            placeholder="Choose a username"
                            className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                            required
                        />
                        <p className="mt-2 text-xs text-slate-500">Use 5+ characters: letters, numbers, or underscore.</p>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Create a password"
                            className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor="confirm_password">
                            Confirm password
                        </label>
                        <input
                            id="confirm_password"
                            name="confirm_password"
                            type="password"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            placeholder="Confirm your password"
                            className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                            required
                        />
                    </div>

                    {message ? (
                        <p className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-slate-200">
                            {message}
                        </p>
                    ) : null}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-400">
                    Already have an account?{' '}
                    <Link to="/signin" className="font-medium text-cyan-300 hover:text-cyan-200">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;