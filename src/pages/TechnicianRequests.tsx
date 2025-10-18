import React, { useState, useEffect } from "react";
import { createTechnicianRequest, fetchMyTasks } from "../api/technician";

export default function TechnicianRequests(){
  const [tasks, setTasks] = useState<any[]>([]);
  const [req, setReq] = useState({ subject:"", details:"", request_type:"hr_assistance" });

  useEffect(()=>{ fetchMyTasks().then(r=>setTasks(r.data)).catch(()=>{}) },[]);

  const submit = async (e:any) => {
    e.preventDefault();
    try {
      const res = await createTechnicianRequest(req);
      alert("Request sent");
      setReq({ subject:"", details:"", request_type:"hr_assistance" });
    } catch(e) { alert("Failed"); }
  };

  return (
    <div className="p-4">
      <h2>Technician - Requests & Tasks</h2>
      <div className="mb-4">
        <h3>My Tasks</h3>
        {tasks.map(t => (
          <div key={t.id} className="border p-2 mb-2">
            <div>{t.title}</div>
            <div>Status: {t.status}</div>
            <div>Assigned: {t.assigned_at}</div>
            <div>
              <button onClick={()=>{/* navigate to task detail or BOM flow */}} className="btn">Open</button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3>Request Assistance (HR)</h3>
        <form onSubmit={submit}>
          <input placeholder="Subject" value={req.subject} onChange={e=>setReq({...req,subject:e.target.value})} required className="input" />
          <textarea placeholder="Details" value={req.details} onChange={e=>setReq({...req,details:e.target.value})} required className="input" />
          <select value={req.request_type} onChange={e=>setReq({...req,request_type:e.target.value})} className="input">
            <option value="hr_assistance">HR assistance</option>
            <option value="spare_part">Spare part request</option>
            <option value="training">Training request</option>
          </select>
          <button type="submit" className="btn">Send request</button>
        </form>
      </div>
    </div>
  );
}
