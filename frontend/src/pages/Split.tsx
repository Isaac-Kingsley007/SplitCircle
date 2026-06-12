import { Link, useParams } from "react-router";
import { get } from "../lib/server";
import { useEffect, useState } from "react";
import AddExpense from "../components/AddExpense";
import AddUser from "../components/AddUser";
import DeleteOrLeaveSplit from "../components/DeleteOrLeaveSplit";
import ExpenseTile from "../components/ExpenseTile";
import UserTile from "../components/UserTile";
import { type Expense, type SplitUser } from "../types";

const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
});

const getAmount = (amount: number | string) => {
    const parsedAmount = Number(amount);
    return Number.isFinite(parsedAmount) ? parsedAmount : 0;
};

function Split() {
    const { split_id } = useParams();
    const [loading, setLoading] = useState<boolean>(true);
    const [hasReadAccess, setHasReadAccess] = useState<boolean>(false);
    const [hasWriteAccess, setHasWriteAccess] = useState<boolean>(false);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [users, setUsers] = useState<SplitUser[]>([]);
    const [error, setError] = useState<string>("");
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [showAddUser, setShowAddUser] = useState(false);
    const [splitName, setSplitName] = useState("");
    const [totalAmount, setTotalAmount] = useState(0);
    const [amountPerUser, setAmountPerUser] = useState(0);

    const loadSplitData = async () => {
        if (!split_id) {
            setError("Invalid split.");
            return;
        }

        try {
            setError("");
            const data = await get('/splits/split/' + split_id);

            if (!data.success) {
                setError(data.error ?? "Unable to load split details.");
                return;
            }

            setExpenses(data.data.expenses ?? []);
            setUsers(data.data.users ?? []);
            setSplitName(data.data.split_name ?? "");
            setTotalAmount(getAmount(data.data.total_amount));
            setAmountPerUser(getAmount(data.data.amount_per_user));
        } catch {
            setError("Unable to connect to the server.");
        }
    };

    useEffect(() => {
        const access = async () => {
            setLoading(true);
            const data = await get('/splits/access-level/' + split_id);

            if (!data.success) {
                setError(data.error ?? "Unable to load access details.");
                setHasReadAccess(false);
                setHasWriteAccess(false);
                return false;
            }

            const { hasRead, hasWrite } = data.data;
            setHasReadAccess(hasRead);
            setHasWriteAccess(hasWrite);
            return data.data.hasRead;
        };

        const initLoad = async () => {
            const hasAccess = await access();
            if (hasAccess) {
                await loadSplitData();
            }
            setLoading(false);
        }

        void initLoad();
    }, [split_id]);


    if(loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
                <p className="text-slate-400 text-xl">Loading...</p>
            </div>
        )
    }

    if(!hasReadAccess) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
                <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl shadow-black/30">
                    <h1 className="text-2xl font-semibold">No access</h1>
                    <p className="mt-3 text-sm text-slate-400">
                        {error || "You do not have access to this split."}
                    </p>
                    <Link className="mt-6 inline-flex rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300" to="/">
                        Back home
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
            <main className="mx-auto flex w-full max-w-6xl flex-col gap-6">
                <header className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">SplitApp</p>
                        <h1 className="mt-3 text-3xl font-semibold">{splitName}</h1>
                        <p className="mt-2 text-sm text-slate-400">
                            {users.length} {users.length === 1 ? "user" : "users"} · {expenses.length} {expenses.length === 1 ? "expense" : "expenses"}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            to="/"
                            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-slate-200 transition hover:bg-white/10"
                        >
                            Home
                        </Link>

                        {hasWriteAccess ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setShowAddUser(true)}
                                    className="rounded-2xl border border-cyan-400/40 px-5 py-3 font-semibold text-cyan-200 transition hover:border-cyan-300 hover:text-cyan-100"
                                >
                                    Add User
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddExpense(true)}
                                    className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
                                >
                                    Add Expense
                                </button>
                            </>
                        ) : null}

                        <DeleteOrLeaveSplit splitId={split_id!} hasWriteAccess={hasWriteAccess} />
                    </div>
                </header>

                {error ? (
                    <p className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                        {error}
                    </p>
                ) : null}

                <section className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
                        <p className="text-sm font-medium uppercase tracking-wide text-slate-400">Total Amount</p>
                        <p className="mt-3 text-3xl font-bold text-cyan-300">{currency.format(totalAmount)}</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
                        <p className="text-sm font-medium uppercase tracking-wide text-slate-400">Each User Pays</p>
                        <p className="mt-3 text-3xl font-bold text-cyan-300">{currency.format(amountPerUser)}</p>
                    </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <h2 className="text-2xl font-semibold">Expenses</h2>
                            <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                                {expenses.length}
                            </span>
                        </div>

                        {expenses.length > 0 ? (
                            <div className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10">
                                {expenses.map((expense) => (
                                    <ExpenseTile
                                        key={expense.expense_id}
                                        splitId={split_id!}
                                        expense={expense}
                                        canEdit={hasWriteAccess}
                                        onRemove={loadSplitData}
                                        setError={setError}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-6 text-center text-slate-400">
                                No expenses added yet.
                            </p>
                        )}
                    </section>

                    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <h2 className="text-2xl font-semibold">Users</h2>
                            <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                                {users.length}
                            </span>
                        </div>

                        {users.length > 0 ? (
                            <div className="space-y-3">
                                {users.map((user) => (
                                    <UserTile
                                        key={user.user_name}
                                        splitId={split_id!}
                                        user={user}
                                        canEdit={hasWriteAccess}
                                        onRemove={loadSplitData}
                                        setError={setError}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-6 text-center text-slate-400">
                                No users added yet.
                            </p>
                        )}
                    </section>
                </div>
            </main>

            {showAddExpense ? (
                <AddExpense
                    splitId={split_id!}
                    onClose={() => setShowAddExpense(false)}
                    onAdded={async () => { await loadSplitData(); }}
                />
            ) : null}

            {showAddUser ? (
                <AddUser
                    splitId={split_id!}
                    onClose={() => setShowAddUser(false)}
                    onAdded={async () => { await loadSplitData(); }}
                />
            ) : null}
        </div>
    );
}

export default Split;
