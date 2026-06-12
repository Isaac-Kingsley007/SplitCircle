interface ExpenseTileProps {
    splitId: number | string;
    expense: {
        expense_name: string;
        expense_amount: number | string;
    };
    canEdit: boolean;
    onRemove: (expenseName: string) => Promise<void>;
}

const currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const getAmount = (amount: number | string) => {
    const parsedAmount = Number(amount);
    return Number.isFinite(parsedAmount) ? parsedAmount : 0;
};

export default function ExpenseTile({ expense, canEdit, onRemove }: ExpenseTileProps) {
    return (
        <div className="flex items-center justify-between gap-4 bg-slate-900/60 px-4 py-4">
            <div>
                <p className="font-medium text-slate-100">{expense.expense_name}</p>
                <p className="mt-1 text-sm text-slate-400">{currency.format(getAmount(expense.expense_amount))}</p>
            </div>

            {canEdit ? (
                <button
                    type="button"
                    onClick={() => void onRemove(expense.expense_name)}
                    className="rounded-xl border border-rose-400/30 px-3 py-2 text-sm font-semibold text-rose-200 transition hover:border-rose-300 hover:text-rose-100"
                >
                    Remove
                </button>
            ) : null}
        </div>
    );
}