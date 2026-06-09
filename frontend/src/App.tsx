import { useNavigate } from "react-router";
import { useState,useEffect } from "react";
import { get } from './lib/server';

export default function App() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const checkAuth = async () => {
      const {data} = await get('/auth/is_authenticated');

      if (!data) {
        navigate('/signin');
      }

      return data;
    }

    const initialDataLoad = async () => {
      const isLoggedIn = await checkAuth();
      setLoading(!isLoggedIn);
    }

    initialDataLoad();
  }, [])

  if(loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
        <p className="text-slate-400 text-xl">Loading...</p>
      </div>
    )
  }


  console.log("PASSES TO HERE");

  return(
    <div>
      <p className="text-red-400 text-xl">Authenticated</p>
    </div>
  )
}