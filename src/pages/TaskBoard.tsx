import React, { useEffect, useState } from "react";
import { apiClient } from '@/lib/api';

const axios = apiClient.axios;

export default function TaskBoard(){
  const [tasks, setTasks] = useState<any[]>([]);
  useEffect(()=> {
    axios.get("/tasks").then(r=>setTasks(r.data)).catch(()=>{})
  },[]);
  return (
    <div className="p-4">
      <h2>Task Board</h2>
      <ul>
        {tasks.map(t => (
          <li key={t.id}>
            {t.title} - {t.status} - Assigned: {t.technician?.full_name || "unassigned"}
          </li>
        ))}
      </ul>
    </div>
  );
}
