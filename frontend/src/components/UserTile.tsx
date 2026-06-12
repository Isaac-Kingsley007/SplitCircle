interface UserTileProps {
    splitId: number | string;
    user: {
        user_name: string;
    };
    canEdit: boolean;
    onRemove: (userName: string) => Promise<void>;
}

const currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

export default function UserTile({ user, canEdit, onRemove }: UserTileProps) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-4">
            <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 font-bold text-cyan-200">
                    {user.user_name.charAt(0).toUpperCase()}
                </span>
                <p className="truncate font-medium text-slate-100">{user.user_name}</p>
            </div>

            {canEdit ? (
                <button
                    type="button"
                    onClick={() => void onRemove(user.user_name)}
                    className="rounded-xl border border-rose-400/30 px-3 py-2 text-sm font-semibold text-rose-200 transition hover:border-rose-300 hover:text-rose-100"
                >
                    Remove
                </button>
            ) : (
                <p className="shrink-0 text-sm font-semibold text-cyan-300">{currency.format(0)}</p>
            )}
        </div>
    );
}