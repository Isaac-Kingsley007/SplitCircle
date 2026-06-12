import { useState, type SubmitEvent } from 'react';
import { post } from '../lib/server';

interface AddExpenseProps {
    splitId: number | string;
    onClose: () => void;
    onAdded: () => void; // called to refresh expenses
}

export default function AddExpense({ splitId, onClose, onAdded }: AddExpenseProps) {
    const [expenseName, setExpenseName] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        setError('');

        if (!expenseName.trim()) {
            setError('Please enter an expense name.');
            return;
        }

        const amount = parseFloat(expenseAmount);
        if (isNaN(amount) || amount <= 0) {
            setError('Please enter a valid positive amount.');
            return;
        }

        setLoading(true);
        try {
            const res = await post('/splits/add-expense', {
                split_id: Number(splitId),
                expense_name: expenseName.trim(),
                expense_amount: amount
            });

            if (!res || !res.success) {
                setError(res?.error ?? 'Unable to add expense');
                return;
            }

            // success -> notify parent and close
            onAdded();
            onClose();
        } catch (err) {
            setError('Server error adding expense');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-2xl bg-slate-900/90 p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-slate-100">Add expense</h3>
                <p className="mt-1 text-sm text-slate-400">Record a new expense for this split.</p>

                <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm text-slate-300 mb-2" htmlFor="expenseName">
                            Expense name
                        </label>
                        <input
                            id="expenseName"
                            value={expenseName}
                            onChange={(e) => setExpenseName(e.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
                            placeholder="e.g. Dinner"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-300 mb-2" htmlFor="expenseAmount">
                            Amount
                        </label>
                        <input
                            id="expenseAmount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={expenseAmount}
                            onChange={(e) => setExpenseAmount(e.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
                            placeholder="e.g. 25.50"
                            required
                        />
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
                            {loading ? 'Adding...' : 'Add Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
