import { useNavigate } from "react-router";
import { useState,useEffect } from "react";
import { get } from './lib/server';
import { type SplitCardValues } from "./types";
import SplitCard from "./components/SplitCard";
import CreateSplit from "./components/CreateSplit";
import Logout from "./components/Logout";

export default function App() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);

  const [createdSplites, setCreatedSplites] = useState<SplitCardValues[]>([]);
  const [joinedSplits, setJoinedSplits] = useState<SplitCardValues[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  const loadSplits = async () => {
    setLoading(true);
    const isLoggedIn = (await get('/auth/is_authenticated')).data;
    if (!isLoggedIn) {
      setLoading(false);
      navigate('/signin');
      return false;
    }

    setCreatedSplites((await get('/splits/created-splits-data')).data || []);
    setJoinedSplits((await get('/splits/joined-splits-data')).data || []);
    setLoading(false);
    return true;
  }

  useEffect(() => {
    void loadSplits();
  }, [])

  if(loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
        Loading
      </div>
    )
  }

  return(
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">SplitCircle</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Your Splits</h2>
              <p className="mt-1 text-sm text-slate-400">Track created and joined splits from one place.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
              >
                Create split
              </button>
              <Logout />
            </div>
          </div>
        </div>

        <div className="mb-10">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Created Splits</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {createdSplites.map((split) => (
              <SplitCard key={split.split_id} values={split} />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Joined Splits</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {joinedSplits.map((split) => (
              <SplitCard key={split.split_id} values={split} />
            ))}
          </div>
        </div>

        {showCreate ? (
          <CreateSplit
            onClose={() => setShowCreate(false)}
            onCreated={async () => { await loadSplits(); }}
          />
        ) : null}
      </div>
    </div>
  )
}