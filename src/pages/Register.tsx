import React, { useState } from "react";
import { register as apiRegister } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", full_name: "", phone: "", password: ""});
  const [error, setError] = useState<any>();

  const submit = async (e: any) => {
    e.preventDefault();
    try {
      await apiRegister(form);
      navigate("/login");
    } catch (err:any) {
      setError(err.response?.data?.detail || "Failed to register");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-3">Register</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={submit}>
        <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email" required className="input" />
        <input value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})} placeholder="Full name" required className="input" />
        <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Phone" className="input" />
        <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Password" required className="input" />
        <button type="submit" className="btn">Register</button>
      </form>
    </div>
  );
}
