import { NavLink } from "react-router";
import { type SplitCardValues } from "../types";

interface SplitCardProps {
    values: SplitCardValues;
}

function SplitCard({ values }: SplitCardProps) {

    const { split_id, split_name, num_expenses, total_amount, num_users } = values;

    return (
        <NavLink 
            to={`/split/${split_id}`} 
            className="group block rounded-2xl border border-white/10 bg-linear-to-br from-slate-900/60 to-slate-950 p-6 shadow-lg shadow-black/30 transition duration-300 hover:border-cyan-400/50 hover:from-slate-900 hover:to-slate-900/80 hover:shadow-xl hover:shadow-cyan-400/10"
        >
            <div className="flex flex-col gap-4">
                {/* Header */}
                <div>
                    <h2 className="text-xl font-bold text-slate-100 group-hover:text-cyan-300 transition duration-300">
                        {split_name}
                    </h2>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                    {/* Expenses */}
                    <div className="rounded-xl bg-slate-800/40 p-3 text-center">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Expenses</p>
                        <p className="mt-1 text-2xl font-bold text-cyan-300">{num_expenses}</p>
                    </div>

                    {/* Users */}
                    <div className="rounded-xl bg-slate-800/40 p-3 text-center">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Users</p>
                        <p className="mt-1 text-2xl font-bold text-cyan-300">{num_users}</p>
                    </div>

                    {/* Total Amount */}
                    <div className="rounded-xl bg-slate-800/40 p-3 text-center">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Total</p>
                        <p className="mt-1 text-2xl font-bold text-cyan-300">${total_amount}</p>
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="pt-2">
                    <p className="text-xs text-slate-500 group-hover:text-slate-400 transition duration-300">
                        Click to view details →
                    </p>
                </div>
            </div>
        </NavLink>
    )

}

export default SplitCard;