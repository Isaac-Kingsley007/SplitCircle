import { useNavigate } from "react-router";
import { useState,useEffect } from "react";
import { get } from './lib/server';
import { type SplitCardValues } from "./types";
import SplitCard from "./components/SplitCard";
import CreateSplit from "./components/CreateSplit";

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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-slate-100">Your Splits</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-lg bg-cyan-400 px-4 py-2 font-medium text-slate-950"
        >
          Create split
        </button>
      </div>

      <div className="mb-8">
        <p className="text-sm text-slate-400 mb-3">Created Splits</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {createdSplites.map((split) => (
            <SplitCard key={split.split_id} values={split} />
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm text-slate-400 mb-3">Joined Splits</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
  )
}