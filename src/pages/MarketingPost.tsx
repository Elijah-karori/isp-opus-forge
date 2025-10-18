import React, { useState, useEffect } from "react";
import { postMarketing, listMarketing } from "../api/marketing";

export default function MarketingPost(){
  const [posts, setPosts] = useState<any[]>([]);
  const [form, setForm] = useState({ title:"", body:"", ready_for_installation:false });

  useEffect(()=>{ listMarketing().then(r=>setPosts(r.data)).catch(()=>{}) },[]);

  const submit = async (e:any) => {
    e.preventDefault();
    try {
      const res = await postMarketing(form);
      setPosts(prev=>[res.data, ...prev]);
      setForm({title:"", body:"", ready_for_installation:false});
    } catch(e){ alert("Failed to post"); }
  };

  return (
    <div className="p-4">
      <h2>Marketing - Post</h2>
      <form onSubmit={submit} className="mb-4">
        <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Title" required className="input" />
        <textarea value={form.body} onChange={e=>setForm({...form,body:e.target.value})} placeholder="Content" required className="input" />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.ready_for_installation} onChange={e=>setForm({...form,ready_for_installation:e.target.checked})} />
          Ready for installation (acquired market)
        </label>
        <button type="submit" className="btn">Publish</button>
      </form>

      <h3>Recent posts</h3>
      <ul>
        {posts.map(p=>(
          <li key={p.id} className="mb-2">
            <h4>{p.title}</h4>
            <p>{p.body}</p>
            <div>Ready: {p.ready_for_installation ? "Yes" : "No"}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
