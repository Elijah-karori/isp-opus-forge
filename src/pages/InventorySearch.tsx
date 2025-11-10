import React, { useEffect, useState } from "react";
import { searchInventory, triggerSupplierScrape, getSuppliers, getProductPriceHistory } from "../api/inventory";

export default function InventorySearch(){
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ getSuppliers().then(r=>setSuppliers(r.data)).catch(()=>{}) },[]);

  const doSearch = async () => {
    setLoading(true);
    try {
      const res = await searchInventory(q);
      setResults(res.data || []);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  const refreshSupplier = async (supplierId:number) => {
    try {
      await triggerSupplierScrape(supplierId);
      doSearch();
    } catch(e){
      console.error(e);
      alert("Scrape trigger failed");
    }
  };

  const showPriceHistory = async (productId:number) => {
    const r = await getProductPriceHistory(productId);
    alert(JSON.stringify(r.data, null, 2));
  };

  return (
    <div className="p-4">
      <h2>Inventory Search</h2>
      <div className="flex gap-2 mb-4">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search SKU or name" className="input" />
        <button onClick={doSearch} disabled={loading} className="btn">Search</button>
      </div>

      <div className="mb-4">
        <strong>Suppliers</strong>
        {suppliers.map(s=>(
          <div key={s.id} className="flex items-center gap-2">
            <span>{s.name}</span>
            <button onClick={()=>refreshSupplier(s.id)} className="btn">Scrape now</button>
          </div>
        ))}
      </div>

      <div>
        <h3>Results</h3>
        {results.length === 0 && <div>No results</div>}
        <ul>
          {results.map(p=>(
            <li key={p.id} className="mb-2 border p-2">
              <div><strong>{p.name}</strong> — SKU: {p.sku}</div>
              <div>Price: {p.price}</div>
              <div>
                <button onClick={()=>showPriceHistory(p.id)} className="btn">Price history</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
