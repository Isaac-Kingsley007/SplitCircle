import { patch } from "../lib/server";
import { type Expense } from "../types";

interface ExpenseTileProps {
    splitId: number | string;
    expense: Expense;
    canEdit: boolean;
    onRemove: () => Promise<void>;
    setError: React.Dispatch<React.SetStateAction<string>>;
}

const currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const getAmount = (amount: number | string) => {
    const parsedAmount = Number(amount);
    return Number.isFinite(parsedAmount) ? parsedAmount : 0;
};

export default function ExpenseTile({ splitId, expense, canEdit, onRemove, setError }: ExpenseTileProps) {

    const handleRemoveExpense = async () => {
        const expenseName = expense.expense_name;
            if (!splitId || !expenseName) {
                return;
            }
    
            const response = await patch('/splits/remove-expense', {
                split_id: Number(splitId),
                expense_name: expenseName,
            });
    
            if (!response.success) {
                setError(response.error ?? response.message ?? 'Unable to remove expense.');
                return;
            }
    
            await onRemove();
        };

    return (
        <div className="flex items-center justify-between gap-4 bg-slate-900/60 px-4 py-4">
            <div>
                <p className="font-medium text-slate-100">{expense.expense_name}</p>
                <p className="mt-1 text-sm text-slate-400">{currency.format(getAmount(expense.expense_amount))}</p>
            </div>

            {canEdit ? (
                <button
                    type="button"
                    onClick={() => void handleRemoveExpense()}
                    className="rounded-xl border border-rose-400/30 px-3 py-2 text-sm font-semibold text-rose-200 transition hover:border-rose-300 hover:text-rose-100"
                >
                    Remove
                </button>
            ) : null}
        </div>
    );
}