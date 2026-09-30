"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Leaf, PackageCheck, ReceiptIndianRupee, ShoppingCart, Users, 
  Boxes, IndianRupee, ArrowRight, ArrowLeft, CheckCircle2,
  FileSpreadsheet, History, Search, Trash2, X, Printer, FileText, Settings
} from "lucide-react";

type Role = "purchase" | "sales";
type Product = { id: number; name: string; category: string; hsn: string; batch: string; expiry: string; unit: string; stock: number; purchase_rate: number; sale_rate: number; gst_rate: number; low_stock_alert: number };
type Voucher = { id: number; voucher_no: string; party_name: string; item_name: string; quantity: number; total: number; status: string; voucher_date: string; created_at: string };
type Party = { id: number; type: string; name: string; father_name?: string; unique_id?: string; location: string; phone: string; balance: number };
type Audit = { id: number; action: string; module: string; record_ref: string; detail: string; actor: string; created_at: string };
type CartItem = { product: Product; quantity: number; rate: number; gstRate: number; hsnCode: string };
type Reminder = { id: number; party_name: string; amount: number; type: string; due_date: string; frequency: string };

const money = (v: number) => "₹" + (v || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

type FlowState = 
  | "HOME" 
  | "SELECT_PARTY" 
  | "SELECT_PRODUCT" 
  | "CART_DETAILS" 
  | "REVIEW" 
  | "SUCCESS"
  | "MANAGER_TOOLS"
  | "PARTY_LEDGER"
  | "INVENTORY_VIEW"
  | "VIEW_INVOICE"
  | "VOUCHER_HISTORY"
  | "SETTINGS_VIEW";

export default function Dashboard() {
  const [data, setData] = useState<{
    vouchers: Voucher[]; 
    products: Product[]; 
    parties: Party[]; 
    audit: Audit[]; 
    loans: any[];
    settings?: { id: number; company_name: string; address: string; phone: string; bank_name: string; account_name: string; account_no: string; ifsc: string };
    financials?: { ebit: number; debtors: number; creditors: number; totalPrincipal: number; accruedInterest: number };
    reminders?: Reminder[];
  } | null>(null);

  const mutate = useCallback(() => {
    fetch("/api/state").then(r => r.json()).then(setData).catch(console.error);
  }, []);

  useEffect(() => {
    mutate();
    const id = setInterval(mutate, 15000);
    return () => clearInterval(id);
  }, [mutate]);

  const [flow, setFlow] = useState<FlowState>("HOME");
  const [type, setType] = useState<"sale"|"purchase">("sale");
  
  // Cart State
  const [party, setParty] = useState<Party | null>(null);
  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  // UI State
  const [partySearchQuery, setPartySearchQuery] = useState("");
  const [farmerSearchQuery, setFarmerSearchQuery] = useState("");
  const [supplierSearchQuery, setSupplierSearchQuery] = useState("");
  const [customPartyName, setCustomPartyName] = useState("");
  const [customFatherName, setCustomFatherName] = useState("");
  const [customUniqueId, setCustomUniqueId] = useState("");
  const [customProductName, setCustomProductName] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [isCreatingParty, setIsCreatingParty] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);

  // Ledger State
  const [selectedPartyForLedger, setSelectedPartyForLedger] = useState<Party | null>(null);
  const [settleAmount, setSettleAmount] = useState<number | "">("");
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

  // New Feature State
  const [isManagerAuth, setIsManagerAuth] = useState(false);
  const [managerPasswordInput, setManagerPasswordInput] = useState("");
  const [showTakeLoan, setShowTakeLoan] = useState(false);
  const [loanLender, setLoanLender] = useState("");
  const [loanPrincipal, setLoanPrincipal] = useState<number | "">("");
  const [loanRate, setLoanRate] = useState<number | "">("");
  const [treatAsLoan, setTreatAsLoan] = useState(false);
  const [saleLoanRate, setSaleLoanRate] = useState<number | "">("");
  const [saleLoanAmount, setSaleLoanAmount] = useState<number | "">("");
  
  // Reminders State
  const [reminderAmount, setReminderAmount] = useState<number|"">("");
  const [reminderType, setReminderType] = useState<"fixed"|"full">("full");
  const [reminderFrequency, setReminderFrequency] = useState("monthly");
  const [reminderDate, setReminderDate] = useState("");
  const [itemKind, setItemKind] = useState("");
  const [fertilizerType, setFertilizerType] = useState("");
  const [goodsKind, setGoodsKind] = useState("");
  const [packagingType, setPackagingType] = useState("");

  function startFlow(t: "sale"|"purchase") {
    setType(t);
    setParty(null);
    setSelectedItems([]);
    setSearchQuery("");
    setPartySearchQuery("");
    setError("");
    setCustomPartyName("");
    setCustomFatherName("");
    setCustomUniqueId("");
    setSearchQuery("");
    setPartySearchQuery("");
    setIsCreatingParty(false);
    setIsCreatingProduct(false);
    setTreatAsLoan(false);
    setSaleLoanRate("");
    setItemKind("");
    setFertilizerType("");
    setGoodsKind("");
    setPackagingType("");
    setFlow("SELECT_PARTY");
  }

  function chooseParty(p: Party) {
    setParty(p);
    setFlow("SELECT_PRODUCT");
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const payload = {
      action: "update_settings",
      company_name: formData.get("company_name"),
      address: formData.get("address"),
      phone: formData.get("phone"),
      bank_name: formData.get("bank_name"),
      account_name: formData.get("account_name"),
      account_no: formData.get("account_no"),
      ifsc: formData.get("ifsc"),
    };
    try {
      await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-role": type === "sale" ? "sales" : "purchase" },
        body: JSON.stringify(payload)
      });
      mutate();
      setFlow("MANAGER_TOOLS");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function createCustomParty(e: React.FormEvent) {
    e.preventDefault();
    if (!customPartyName.trim()) return;
    const temp: Party = { id: 0, type: type === "sale" ? "farmer" : "supplier", name: customPartyName, father_name: customFatherName, unique_id: customUniqueId, location: "Local", phone: "", balance: 0 };
    setParty(temp);
    setFlow("SELECT_PRODUCT");
  }

  function toggleProduct(p: Product) {
    const exists = selectedItems.find(i => i.product.name === p.name);
    if (exists) {
      setSelectedItems(selectedItems.filter(i => i.product.name !== p.name));
    } else {
      setSelectedItems([...selectedItems, { product: p, quantity: 1, rate: type === "sale" ? p.sale_rate : p.purchase_rate, gstRate: p.gst_rate, hsnCode: p.hsn }]);
    }
  }

  async function createCustomProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!customProductName.trim()) return;
    const formData = new FormData(e.target as HTMLFormElement);
    const purchaseRate = Number(formData.get("purchase_rate") || 0);
    const saleRate = Number(formData.get("sale_rate") || 0);
    const gstRate = Number(formData.get("gst_rate") || 0);
    const cat = formData.get("category") as string || "General";
    const tempUnit = packagingType || "Unit";

    const temp: Product = { 
      id: 0, name: customProductName, category: cat, hsn: "", batch: "New", expiry: "2030", 
      unit: tempUnit, stock: 0, purchase_rate: purchaseRate, sale_rate: saleRate, gst_rate: gstRate 
    };
    
    // Auto-save the product if we have rates, this simplifies the cart flow
    if (purchaseRate > 0 || saleRate > 0) {
      await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-role": type === "sale" ? "sales" : "purchase" },
        body: JSON.stringify({ 
          action: "create_product", 
          name: customProductName, 
          category: cat,
          unit: tempUnit,
          purchase_rate: purchaseRate,
          sale_rate: saleRate,
          gst_rate: gstRate,
          item_kind: itemKind,
          fertilizer_type: fertilizerType,
          goods_kind: goodsKind,
          packaging_type: packagingType
        })
      });
      mutate();
    }
    
    toggleProduct(temp);
    
    // Only reset if it's an event (from Save & Add Another), otherwise we just close.
    // Actually, let's check the submitter button name.
    const submitter = (e.nativeEvent as SubmitEvent).submitter;
    if (submitter && submitter.getAttribute('name') === 'save_and_add') {
      (e.target as HTMLFormElement).reset();
      setCustomProductName("");
      setItemKind("");
      setFertilizerType("");
      setGoodsKind("");
      setPackagingType("");
    } else {
      setCustomProductName("");
      setSearchQuery("");
      setIsCreatingProduct(false);
    }
  }

  async function saveProduct(e: React.FormEvent, id: number) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    setSaving(true);
    try {
      const res = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-role": "sales" },
        body: JSON.stringify({
          action: "update_product",
          id,
          stock: Number(formData.get("stock")),
          purchase_rate: Number(formData.get("purchase_rate")),
          sale_rate: Number(formData.get("sale_rate")),
          low_stock_alert: Number(formData.get("low_stock_alert"))
        })
      });
      if (!res.ok) throw new Error("Failed to update product");
      setEditingProduct(null);
      mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error updating product");
    } finally {
      setSaving(false);
    }
  }

  const handleCartChange = (index: number, field: keyof CartItem, value: any) => {
    const newItems = [...selectedItems];
    (newItems[index] as any)[field] = value;
    setSelectedItems(newItems);
  };
  
  const removeCartItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
    if (selectedItems.length === 1) setFlow("SELECT_PRODUCT"); // If empty, go back
  };

  const grandTotal = selectedItems.reduce((sum, item) => sum + (item.quantity * item.rate) * (1 + item.gstRate/100), 0);

  async function saveBill() {
    setSaving(true);
    setError("");
    try {
      const itemsPayload = selectedItems.map(i => ({ item: i.product.name, quantity: i.quantity, rate: i.rate, gstRate: i.gstRate, hsnCode: i.hsnCode }));
      const res = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-role": type === "sale" ? "sales" : "purchase" },
        body: JSON.stringify({ 
          type, 
          party: party?.name, 
          father_name: party?.father_name,
          unique_id: party?.unique_id,
          date: new Date().toISOString().split("T")[0], 
          items: itemsPayload,
          isLoan: treatAsLoan,
          interestRate: Number(saleLoanRate) || 0,
          loanAmount: Number(saleLoanAmount) || 0
        })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to save bill");
      setSelectedInvoice(resData.voucherNo);
      mutate();
      setFlow("SUCCESS");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error saving bill");
    } finally {
      setSaving(false);
    }
  }

  async function createReminder(e: React.FormEvent, partyName: string) {
    e.preventDefault();
    if (!reminderDate) return;
    setSaving(true);
    try {
      const res = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-role": "sales" },
        body: JSON.stringify({
          action: "create_reminder",
          party_name: partyName,
          amount: reminderType === "fixed" ? (Number(reminderAmount) || 0) : 0,
          reminder_type: reminderType,
          due_date: reminderDate,
          frequency: reminderFrequency
        })
      });
      if (res.ok) {
        setReminderAmount("");
        setReminderDate("");
        mutate();
      }
    } finally {
      setSaving(false);
    }
  }

  async function settleReminder(id: number) {
    if (!confirm("Mark this reminder as collected/settled?")) return;
    setSaving(true);
    try {
      await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-role": "sales" },
        body: JSON.stringify({ action: "settle_reminder", id })
      });
      mutate();
    } finally {
      setSaving(false);
    }
  }

  async function deleteParty(name: string) {
    if (!confirm(`Are you sure you want to completely delete ${name} and all their transactions? This cannot be undone.`)) return;
    setSaving(true);
    try {
      const res = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-role": "sales" },
        body: JSON.stringify({ action: "delete_party", name })
      });
      if (res.ok) {
        setFlow("MANAGER_TOOLS");
        mutate();
      }
    } finally {
      setSaving(false);
    }
  }

  async function saveSettlement(e: React.FormEvent) {
    e.preventDefault();
    if (!loanLender || !loanPrincipal || !loanRate) return;
    setSaving(true);
    try {
      const res = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-role": "purchase" }, // Borrowing is closer to purchasing
        body: JSON.stringify({ 
          action: "take_loan", 
          lender: loanLender, 
          principal: Number(loanPrincipal), 
          rate: Number(loanRate), 
          date: new Date().toISOString().split("T")[0] 
        })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to take loan");
      setLoanLender("");
      setLoanPrincipal("");
      setLoanRate("");
      setShowTakeLoan(false);
      mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error taking loan");
    } finally {
      setSaving(false);
    }
  }

  async function saveSettlement(e: React.FormEvent) {
    e.preventDefault();
    if (!settleAmount || !selectedPartyForLedger) return;
    setSaving(true);
    try {
      const isFarmer = selectedPartyForLedger.type === "farmer";
      const res = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-role": isFarmer ? "sales" : "purchase" },
        body: JSON.stringify({ type: isFarmer ? "receipt" : "payment", party: selectedPartyForLedger.name, date: new Date().toISOString().split("T")[0], amount: Number(settleAmount) })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to settle");
      setSettleAmount("");
      mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error saving settlement");
    } finally {
      setSaving(false);
    }
  }

  async function deleteVoucher(voucherNo: string) {
    if (!confirm(`Are you sure you want to delete ${voucherNo}? The stock and balances will be automatically reversed.`)) return;
    setSaving(true);
    try {
      const v = data?.vouchers.find(x => x.voucher_no === voucherNo);
      const reqRole = v && (v.type === "sale" || v.type === "receipt") ? "sales" : "purchase";
      
      const res = await fetch(`/api/state?voucherNo=${encodeURIComponent(voucherNo)}`, {
        method: "DELETE",
        headers: { "x-admin-role": reqRole || "sales" }
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to delete");
      mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error deleting voucher");
    } finally {
      setSaving(false);
    }
  }

  async function deleteParty(id: number, name: string) {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/state?partyId=${id}`, {
        method: "DELETE",
        headers: { "x-admin-role": "sales" } 
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to delete");
      mutate();
      if (selectedPartyForLedger?.name === name) setFlow("MANAGER_TOOLS");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error deleting party");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(id: number, name: string) {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/state?productId=${id}`, {
        method: "DELETE",
        headers: { "x-admin-role": "sales" }
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to delete");
      mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error deleting product");
    } finally {
      setSaving(false);
    }
  }

  function downloadCSV() {
    if (!data?.vouchers) return;
    const headers = ["Voucher No", "Date", "Type", "Party", "Item", "Quantity", "Total", "Status"];
    const rows = data.vouchers.map(v => [
      v.voucher_no, v.voucher_date, v.type, `"${v.party_name}"`, `"${v.item_name}"`, v.quantity, v.total, v.status
    ]);
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `krishikhata_vouchers_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // --- RENDER FUNCTIONS ---

  function renderHome() {
    return (
      <div className="wizard-card home">
        <header>
          <Leaf size={40} className="brand-icon" />
          <h1>Welcome to KrishiKhata</h1>
        </header>

        <div className="big-buttons">
          <button className="big-btn green" onClick={() => startFlow("sale")}>
            <ReceiptIndianRupee size={32} />
            <div>
              <h2>Make a Sale</h2>
              <small>Sell items to a farmer or customer</small>
            </div>
            <ArrowRight size={24} />
          </button>
          
          <button className="big-btn blue" onClick={() => startFlow("purchase")}>
            <ShoppingCart size={32} />
            <div>
              <h2>Record a Purchase</h2>
              <small>Buy items from a supplier</small>
            </div>
            <ArrowRight size={24} />
          </button>

          <button className="big-btn outline" onClick={() => setFlow("MANAGER_TOOLS")}>
            <History size={32} />
            <div>
              <h2>Manager Tools</h2>
              <small>View reports, history, and alerts</small>
            </div>
            <ArrowRight size={24} />
          </button>
          
          <button className="big-btn outline" onClick={() => setFlow("INVENTORY_VIEW")}>
            <Boxes size={32} />
            <div>
              <h2>Check Total Inventory</h2>
              <small>View all goods, stock levels, and rates</small>
            </div>
            <ArrowRight size={24} />
          </button>
        </div>
      </div>
    );
  }

  function renderFinancialBanner() {
    if (!data?.financials) return null;
    return (
      <div style={{display: 'flex', justifyContent: 'space-between', padding: '12px 15px', background: '#fdfbfa', borderBottom: '1px solid #e7e1d5', fontSize: '13px', marginBottom: '15px', borderRadius: '8px'}}>
        <div><strong>Sundry Debtors:</strong> <span style={{color: '#1a7b4c'}}>{money(data.financials.debtors)}</span></div>
        <div><strong>Sundry Creditors:</strong> <span style={{color: '#d8564d'}}>{money(data.financials.creditors)}</span></div>
      </div>
    );
  }

  function renderSelectParty() {
    const list = data?.parties.filter(p => (type === "sale" ? p.type === "farmer" : p.type === "supplier") && p.name.toLowerCase().includes(partySearchQuery.toLowerCase())) || [];
    
    // Auto-generate 7-digit ID if not present
    const generateId = () => {
      setCustomUniqueId(Math.floor(1000000 + Math.random() * 9000000).toString());
    };

    return (
      <div className="wizard-card">
        <header className="with-back">
          <button className="back-btn" onClick={() => setFlow("HOME")}><ArrowLeft size={24}/></button>
          <h2>Who are you {type === "sale" ? "selling to" : "buying from"}?</h2>
        </header>

        <div className="search-bar">
          <Search size={20} className="search-icon"/>
          <input type="text" placeholder="Search for contacts..." value={partySearchQuery} onChange={e => setPartySearchQuery(e.target.value)} />
        </div>

        {isCreatingParty ? (
          <div style={{background: '#fdfbfa', padding: '15px', borderRadius: '12px', border: '1px solid #e7e1d5', marginBottom: '20px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
              <h3 style={{fontSize: '15px', margin: 0}}>Create New Profile</h3>
              <button onClick={() => setIsCreatingParty(false)} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#888'}}><X size={18}/></button>
            </div>
            <form className="custom-input-form" style={{display: 'flex', flexDirection: 'column', gap: '10px'}} onSubmit={createCustomParty}>
              <input type="text" placeholder={`Type a new ${type === "sale" ? "farmer" : "supplier"} name...`} value={customPartyName} onChange={e => setCustomPartyName(e.target.value)} required />
              <input type="text" placeholder="Father's Name (Optional)" value={customFatherName} onChange={e => setCustomFatherName(e.target.value)} />
              <div style={{display: 'flex', gap: '10px'}}>
                <input type="text" placeholder="Unique ID (7 digits)" value={customUniqueId} onChange={e => setCustomUniqueId(e.target.value)} pattern="[0-9]{7}" title="Must be exactly 7 digits" style={{flex: 1}} />
                <button type="button" onClick={generateId} style={{whiteSpace: 'nowrap', padding: '0 15px', borderRadius: '8px', border: '1px solid #d8d0c0', background: '#fff', color: '#333', fontSize: '13px', cursor: 'pointer'}}>Auto-Gen ID</button>
              </div>
              <button type="submit" disabled={!customPartyName.trim()} className="action-btn green" style={{marginTop: '5px'}}>+ Create Profile</button>
            </form>
          </div>
        ) : (
          <button className="list-card" style={{justifyContent: 'center', background: '#fdfbfa', border: '1px dashed #d8d0c0', color: '#1a7b4c', marginBottom: '20px'}} onClick={() => setIsCreatingParty(true)}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold'}}>
              + Create New Profile
            </div>
          </button>
        )}

        <div className="list-grid">
          {list.map(p => (
            <button key={p.id} className="list-card" onClick={() => chooseParty(p)}>
              <Users size={24} className="list-icon" />
              <div className="list-text">
                <h3>{p.name}</h3>
                <small>{p.father_name ? `S/o ${p.father_name} · ` : ""}{p.unique_id ? `ID: ${p.unique_id} · ` : ""}{p.location} {p.phone ? `· ${p.phone}` : ""}</small>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  function renderSelectProduct() {
    const list = data?.products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())) || [];
    
    return (
      <div className="wizard-card">
        <header className="with-back">
          <button className="back-btn" onClick={() => setFlow("SELECT_PARTY")}><ArrowLeft size={24}/></button>
          <h2>What is {party?.name} {type === "sale" ? "buying" : "supplying"}?</h2>
        </header>
        
        <div className="search-bar">
          <Search size={20} className="search-icon"/>
          <input type="text" placeholder="Search for items..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>

        {isCreatingProduct ? (
          <div style={{background: '#fdfbfa', padding: '15px', borderRadius: '12px', border: '1px solid #e7e1d5', marginBottom: '20px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
              <h3 style={{fontSize: '15px', margin: 0}}>Create New Item</h3>
              <button onClick={() => setIsCreatingProduct(false)} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#888'}}><X size={18}/></button>
            </div>
            <form className="custom-input-form" style={{display: 'flex', flexDirection: 'column', gap: '10px'}} onSubmit={createCustomProduct}>
              <input type="text" name="name" placeholder="Item Name (e.g. Urea 45kg)" required value={customProductName} onChange={(e) => setCustomProductName(e.target.value)} />
              <input type="text" name="category" placeholder="Category (e.g. Fertiliser)" required />
              
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                <input type="text" placeholder="Kind of Item" value={itemKind} onChange={(e) => setItemKind(e.target.value)} />
                <input type="text" placeholder="Fertilizer Type" value={fertilizerType} onChange={(e) => setFertilizerType(e.target.value)} />
                <input type="text" placeholder="Kind of Goods" value={goodsKind} onChange={(e) => setGoodsKind(e.target.value)} />
                <input type="text" name="hsn" placeholder="HSN/HSC Code" required />
                <select value={packagingType} onChange={(e) => setPackagingType(e.target.value)} required style={{padding: '12px', borderRadius: '8px', border: '1px solid #d8d0c0'}}>
                  <option value="" disabled>Select Packaging...</option>
                  <option value="Sack">Sack</option>
                  <option value="Bottle">Bottle</option>
                  <option value="Box">Box</option>
                  <option value="Unit">Unit</option>
                </select>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                <input type="number" name="purchase_rate" placeholder="Purchase Rate (₹)" required />
                <input type="number" name="sale_rate" placeholder="Sale Rate (₹)" required />
                <input type="number" name="gst_rate" placeholder="GST Rate (%)" defaultValue="0" required />
                <input type="number" name="stock" placeholder="Initial Stock" defaultValue="0" required />
                <input type="number" name="low_stock_alert" placeholder="Low Stock Alert Level" defaultValue="0" />
              </div>
              <div style={{display: 'flex', gap: '10px', marginTop: '5px'}}>
                <button type="submit" disabled={saving} className="action-btn green" style={{flex: 1}}>+ Save Item</button>
                <button type="submit" name="save_and_add" disabled={saving} className="action-btn outline" style={{flex: 1}}>Save & Add Another</button>
              </div>
            </form>
          </div>
        ) : (
          <button className="list-card" style={{justifyContent: 'center', background: '#fdfbfa', border: '1px dashed #d8d0c0', color: '#1a7b4c', marginBottom: '20px'}} onClick={() => setIsCreatingProduct(true)}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold'}}>
              + Create New Item
            </div>
          </button>
        )}

        <div className="list-grid multi-select">
          {list.map(p => {
            const isSelected = selectedItems.some(i => i.product.name === p.name);
            return (
              <button key={p.id} className={`list-card ${isSelected ? 'active' : ''}`} onClick={() => toggleProduct(p)}>
                <Boxes size={24} className="list-icon" />
                <div className="list-text">
                  <h3>{p.name}</h3>
                  <small>Available: {p.stock} {p.unit}s · ₹{type === "sale" ? p.sale_rate : p.purchase_rate}</small>
                </div>
                {isSelected && <CheckCircle2 className="select-check" size={20}/>}
              </button>
            );
          })}
        </div>

        {selectedItems.length > 0 && (
          <button className="action-btn floating" onClick={() => setFlow("CART_DETAILS")}>
            Next: Enter Quantities ({selectedItems.length} items) <ArrowRight size={20}/>
          </button>
        )}
      </div>
    );
  }

  function renderCartDetails() {
    return (
      <div className="wizard-card">
        <header className="with-back">
          <button className="back-btn" onClick={() => setFlow("SELECT_PRODUCT")}><ArrowLeft size={24}/></button>
          <h2>Enter Quantities</h2>
        </header>

        <div className="cart-list">
          {selectedItems.map((item, index) => (
            <div key={item.product.name} className="cart-item">
              <div className="cart-item-header">
                <h3>{item.product.name}</h3>
                <button className="remove-btn" onClick={() => removeCartItem(index)}><X size={20}/></button>
              </div>
              <div className="cart-item-inputs">
                <label>
                  <span>Qty ({item.product.unit}s)</span>
                  <input type="number" min="1" value={item.quantity} onChange={e => handleCartChange(index, "quantity", Number(e.target.value))} required />
                </label>
                <label>
                  <span>Rate (₹)</span>
                  <input type="number" min="0" value={item.rate} onChange={e => handleCartChange(index, "rate", Number(e.target.value))} required />
                </label>
                <label>
                  <span>GST %</span>
                  <select value={item.gstRate} onChange={e => handleCartChange(index, "gstRate", Number(e.target.value))}>
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </label>
              </div>
            </div>
          ))}
        </div>
        
        <button className="action-btn" onClick={() => setFlow("REVIEW")}>Continue to Review <ArrowRight size={20}/></button>
      </div>
    );
  }

  function renderReview() {
    return (
      <div className="wizard-card">
        <header className="with-back">
          <button className="back-btn" onClick={() => setFlow("CART_DETAILS")}><ArrowLeft size={24}/></button>
          <h2>Review and Confirm</h2>
        </header>
        <div className="review-box">
          <div className="review-row"><span>Party:</span> <strong>{party?.name}</strong></div>
          <div className="divider"/>
          
          <table className="review-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.map(i => {
                const itemTotal = (i.quantity * i.rate) * (1 + i.gstRate/100);
                return (
                  <tr key={i.product.name}>
                    <td>{i.product.name}</td>
                    <td>{i.quantity}</td>
                    <td>₹{i.rate}</td>
                    <td>{money(itemTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="divider"/>
          <div className="review-row total"><span>Grand Total:</span> <strong>{money(grandTotal)}</strong></div>
        </div>
        {type === "sale" && (
          <div style={{background: '#fdfbfa', padding: '15px', borderRadius: '12px', border: '1px solid #e7e1d5', margin: '20px 0'}}>
            <label style={{display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', cursor: 'pointer', marginBottom: treatAsLoan ? '10px' : '0'}}>
              <input type="checkbox" checked={treatAsLoan} onChange={e => setTreatAsLoan(e.target.checked)} style={{width: '18px', height: '18px'}} />
              Treat as Loan
            </label>
            {treatAsLoan && (
              <div className="custom-input-form" style={{marginTop: '10px', display: 'flex', gap: '10px'}}>
                <input type="number" placeholder={`Loan Amount (Max: ${grandTotal})`} value={saleLoanAmount} onChange={e => setSaleLoanAmount(Number(e.target.value))} max={grandTotal} required />
                <input type="number" placeholder="Interest Rate (%)" value={saleLoanRate} onChange={e => setSaleLoanRate(Number(e.target.value))} required />
              </div>
            )}
          </div>
        )}
        {error && <p className="error-msg">{error}</p>}
        <button onClick={saveBill} disabled={saving} className={`action-btn ${type === "sale" ? "green" : "blue"}`}>
          {saving ? "Saving..." : `Confirm and Save ${type === "sale" ? "Sale" : "Purchase"}`}
          <CheckCircle2 size={20}/>
        </button>
      </div>
    );
  }

  function renderSuccess() {
    return (
      <div className="wizard-card success">
        <CheckCircle2 size={64} className="success-icon" />
        <h2>All Done!</h2>
        <p>The {type === "sale" ? "sale" : "purchase"} has been saved successfully.</p>
        <div style={{display: 'flex', gap: '15px', marginTop: '20px', justifyContent: 'center'}}>
          <button onClick={() => setFlow("HOME")} className="action-btn outline" style={{margin: 0}}>Back to Home</button>
          <button onClick={() => setFlow("VIEW_INVOICE")} className="action-btn blue" style={{margin: 0}}>
            <FileText size={18} style={{marginRight: '8px'}}/> Print Receipt
          </button>
        </div>
      </div>
    );
  }

  function renderInventoryView() {
    return (
      <div className="wizard-card manager-tools-card inventory-card">
        <header className="with-back">
          <button className="back-btn" onClick={() => setFlow("HOME")}><ArrowLeft size={24}/></button>
          <h2>All Inventory (Goods)</h2>
        </header>
        <div className="search-bar">
          <Search size={20} className="search-icon"/>
          <input type="text" placeholder="Search for items..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="manager-section full-width" style={{overflowX: 'auto'}}>
          <table className="review-table" style={{width: '100%', minWidth: '600px', fontSize: '16px'}}>
            <thead>
              <tr>
                <th style={{textAlign: 'left'}}>Item Name</th>
                <th>Stock</th>
                <th>Purchase (₹)</th>
                <th>Sale (₹)</th>
                <th>Low Alert</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => {
                const isLowStock = p.low_stock_alert > 0 && p.stock <= p.low_stock_alert;
                if (editingProduct === p.id) {
                  return (
                    <tr key={p.id} style={{background: '#fcfbfa'}}>
                      <td colSpan={6}>
                        <form className="custom-input-form" style={{display: 'flex', gap: '10px', alignItems: 'center'}} onSubmit={(e) => saveProduct(e, p.id)}>
                          <strong>{p.name}</strong>
                          <input type="number" name="stock" defaultValue={p.stock} required style={{width: '80px'}} placeholder="Stock"/>
                          <input type="number" name="purchase_rate" defaultValue={p.purchase_rate} required style={{width: '100px'}} placeholder="Purchase"/>
                          <input type="number" name="sale_rate" defaultValue={p.sale_rate} required style={{width: '100px'}} placeholder="Sale"/>
                          <input type="number" name="low_stock_alert" defaultValue={p.low_stock_alert} required style={{width: '100px'}} placeholder="Alert"/>
                          <button type="submit" disabled={saving} className="action-btn blue" style={{margin: 0, padding: '8px 16px'}}>Save</button>
                          <button type="button" onClick={() => setEditingProduct(null)} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#888'}}><X size={18}/></button>
                        </form>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={p.id} style={{background: isLowStock ? '#fff5f5' : 'transparent'}}>
                    <td>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        {p.name}
                        {isLowStock && <span style={{background: '#ffebee', color: '#d32f2f', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold'}}>Low</span>}
                      </div>
                    </td>
                    <td style={{textAlign: 'center'}}>{p.stock} {p.unit}s</td>
                    <td style={{textAlign: 'center'}}>₹{p.purchase_rate}</td>
                    <td style={{textAlign: 'center'}}>₹{p.sale_rate}</td>
                    <td style={{textAlign: 'center'}}>{p.low_stock_alert}</td>
                    <td>
                      <div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
                        <button className="action-btn outline" style={{padding: '4px 10px', fontSize: '12px', margin: 0}} onClick={() => setEditingProduct(p.id)}>Edit</button>
                        <button className="delete-btn" onClick={() => deleteProduct(p.id, p.name)} disabled={saving} style={{padding: '4px 8px'}}><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderPartyLedger() {
    if (!selectedPartyForLedger) return null;
    const freshParty = data?.parties.find(p => p.name === selectedPartyForLedger.name) || selectedPartyForLedger;
    const ledgerVouchers = data?.vouchers.filter(v => v.party_name === freshParty.name) || [];

    return (
      <div className="wizard-card manager-tools-card">
        <header className="with-back" style={{justifyContent: 'space-between'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <button className="back-btn" onClick={() => setFlow("MANAGER_TOOLS")}><ArrowLeft size={24}/></button>
            <h2>{freshParty.name} Ledger</h2>
          </div>
          <button className="delete-btn" onClick={() => deleteParty(freshParty.name)} disabled={saving} style={{padding: '6px 12px', fontSize: '13px', margin: 0}}><Trash2 size={16}/> Delete Party</button>
        </header>
        
        <div className="ledger-header">
          <div className="balance-box">
            <span>Outstanding Balance</span>
            <strong className={freshParty.balance > 0 ? "text-red" : "text-green"}>{money(Math.abs(freshParty.balance))} {freshParty.balance > 0 ? "Due" : freshParty.balance < 0 ? "Advance" : ""}</strong>
          </div>
        </div>

        <form className="settlement-form" onSubmit={saveSettlement}>
          <h3>Record a Payment</h3>
          <div className="settlement-row">
            <input type="number" placeholder="Enter amount..." value={settleAmount} onChange={e => setSettleAmount(Number(e.target.value) || "")} required min="1"/>
            <button type="submit" disabled={saving} className="action-btn">Settle</button>
          </div>
        </form>

        <form className="settlement-form" style={{marginTop: '20px'}} onSubmit={(e) => createReminder(e, freshParty.name)}>
          <h3>Set a Payment Reminder</h3>
          <div className="custom-input-form" style={{display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px'}}>
            <div style={{display: 'flex', gap: '10px'}}>
              <select value={reminderType} onChange={e => setReminderType(e.target.value as "fixed"|"full")} style={{padding: '12px', borderRadius: '8px', border: '1px solid #dce6e0'}}>
                <option value="full">Remind for Full Accumulated Balance</option>
                <option value="fixed">Remind for Fixed Amount</option>
              </select>
              {reminderType === "fixed" && (
                <input type="number" placeholder="Amount (₹)" value={reminderAmount} onChange={e => setReminderAmount(Number(e.target.value))} required min="1" />
              )}
            </div>
            <div style={{display: 'flex', gap: '10px'}}>
              <input type="date" value={reminderDate} onChange={e => setReminderDate(e.target.value)} required />
              <select value={reminderFrequency} onChange={e => setReminderFrequency(e.target.value)} style={{padding: '12px', borderRadius: '8px', border: '1px solid #dce6e0'}}>
                <option value="one-time">One-time Reminder</option>
                <option value="monthly">Monthly Reminder</option>
                <option value="weekly">Weekly Reminder</option>
              </select>
            </div>
            <button type="submit" disabled={saving} className="action-btn green" style={{width: 'fit-content'}}>+ Add Reminder</button>
          </div>
        </form>

        <div className="manager-section full-width" style={{marginTop: '20px'}}>
          <h3>Transaction History</h3>
          {ledgerVouchers.length === 0 ? <p className="empty-text">No transactions found.</p> : null}
          {ledgerVouchers.map(v => (
            <div key={v.id} className="history-item voucher-item">
              <div>
                <strong>{v.voucher_no} · {v.type.toUpperCase()}</strong>
                <small>{v.voucher_date} · {v.item_name} {v.quantity > 0 ? `· ${v.quantity} units` : ""}</small>
              </div>
              <div className="voucher-actions">
                <strong className={v.type === "receipt" || v.type === "sale" ? "text-green" : "text-red"}>{money(v.total)}</strong>
                <button className="action-btn outline" style={{padding: '6px 12px', fontSize: '13px', margin: 0}} onClick={() => { setSelectedInvoice(v.voucher_no); setFlow("VIEW_INVOICE"); }}><FileText size={16}/> Invoice</button>
                <button className="delete-btn" onClick={() => deleteVoucher(v.voucher_no)} disabled={saving}><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderManagerTools() {
    if (!isManagerAuth) {
      return (
        <div className="wizard-card manager-tools-card" style={{maxWidth: '400px', margin: '100px auto'}}>
          <header className="with-back">
            <button className="back-btn" onClick={() => setFlow("HOME")}><ArrowLeft size={24}/></button>
            <h2>Manager Access</h2>
          </header>
          <div style={{padding: '20px', textAlign: 'center'}}>
            <p style={{marginBottom: '20px'}}>Please enter the manager password to continue.</p>
            <form onSubmit={e => {
              e.preventDefault();
              if (managerPasswordInput === 'admin123') {
                setIsManagerAuth(true);
                setManagerPasswordInput("");
              } else alert('Incorrect password');
            }}>
              <input type="password" value={managerPasswordInput} onChange={e => setManagerPasswordInput(e.target.value)} placeholder="Password" style={{width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc'}} />
              <button type="submit" className="action-btn blue">Unlock</button>
            </form>
          </div>
        </div>
      );
    }

    const dailyVouchers = data?.vouchers.filter(v => v.voucher_date === selectedDate) || [];
    
    // Party-wise summaries
    const salesByParty: Record<string, number> = {};
    const purchasesByParty: Record<string, number> = {};
    for (const v of dailyVouchers) {
      if (v.type === "sale") salesByParty[v.party_name] = (salesByParty[v.party_name] || 0) + v.total;
      if (v.type === "purchase") purchasesByParty[v.party_name] = (purchasesByParty[v.party_name] || 0) + v.total;
    }

    return (
      <div className="wizard-card manager-tools-card">
        <header className="with-back" style={{justifyContent: 'space-between'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <button className="back-btn" onClick={() => setFlow("HOME")}><ArrowLeft size={24}/></button>
            <h2>Manager Tools</h2>
          </div>
          <div style={{display: 'flex', gap: '10px'}}>
            <button className="action-btn blue" onClick={downloadCSV} style={{padding: '8px 12px', fontSize: '13px', margin: 0}}>
              <FileSpreadsheet size={16}/> CSV
            </button>
            <button className="action-btn outline" onClick={() => setFlow("VOUCHER_HISTORY")} style={{padding: '8px 12px', fontSize: '13px', margin: 0}}>
              <History size={16}/> History
            </button>
            <button className="action-btn outline" onClick={() => setFlow("SETTINGS_VIEW")} style={{padding: '8px 12px', fontSize: '13px', margin: 0}}>
              <Settings size={16}/> Settings
            </button>
          </div>
        </header>
        
        {renderFinancialBanner()}
        
        {data?.financials && (
          <div className="financial-panel">
            <div className="metric-card green">
              <small>EBIT</small>
              <strong>{money(data.financials.ebit)}</strong>
            </div>
            <div className="metric-card">
              <small>Sundry Debtors</small>
              <strong style={{color: '#1a7b4c'}}>{money(data.financials.debtors)}</strong>
            </div>
            <div className="metric-card">
              <small>Sundry Creditors</small>
              <strong style={{color: '#d8564d'}}>{money(data.financials.creditors)}</strong>
            </div>
            <div className="metric-card orange">
              <small>Loan & Interest</small>
              <strong>{money(data.financials.totalPrincipal + data.financials.accruedInterest)}</strong>
            </div>
          </div>
        )}

        <div className="manager-section full-width" style={{marginTop: '20px', marginBottom: '20px'}}>
          <h3>Upcoming Reminders</h3>
          {(!data?.reminders || data.reminders.length === 0) ? <p className="empty-text">No active reminders.</p> : null}
          {data?.reminders?.map(r => (
            <div key={r.id} className="history-item voucher-item" style={{borderLeft: '4px solid #1a7b4c'}}>
              <div>
                <strong>{r.party_name}</strong>
                <small>Due: {new Date(r.due_date).toLocaleDateString("en-GB", {day:"2-digit",month:"short",year:"numeric"})} · {r.frequency} · {r.type === 'full' ? 'Full Balance' : 'Fixed Amount'}</small>
              </div>
              <div className="voucher-actions">
                <strong className="text-red">{r.amount > 0 ? money(r.amount) : "Full Balance"}</strong>
                <button className="action-btn outline" style={{padding: '6px 12px', fontSize: '13px', margin: 0}} onClick={() => settleReminder(r.id)} disabled={saving}><CheckCircle2 size={16}/> Settle</button>
              </div>
            </div>
          ))}
        </div>

        <div className="date-picker-row">
          <label>
            <strong>Track Day:</strong>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
          </label>
        </div>

        <div className="manager-grid">
          <div className="manager-section">
            <h3>Sales per Farmer (Day)</h3>
            {Object.keys(salesByParty).length === 0 ? <p className="empty-text">No sales on this day.</p> : null}
            {Object.entries(salesByParty).map(([name, total]) => (
              <div key={name} className="history-item">
                <strong>{name}</strong>
                <strong className="text-green">{money(total)}</strong>
              </div>
            ))}
          </div>

          <div className="manager-section">
            <h3>Purchases per Supplier (Day)</h3>
            {Object.keys(purchasesByParty).length === 0 ? <p className="empty-text">No purchases on this day.</p> : null}
            {Object.entries(purchasesByParty).map(([name, total]) => (
              <div key={name} className="history-item">
                <strong>{name}</strong>
                <strong className="text-red">{money(total)}</strong>
              </div>
            ))}
          </div>
          
          <div className="manager-section full-width">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
              <h3 style={{margin: 0}}>Loans & Advances (Overall)</h3>
              <button className="action-btn outline" style={{padding: '6px 12px', margin: 0, fontSize: '13px'}} onClick={() => setShowTakeLoan(true)}>+ Take a Loan</button>
            </div>
            {showTakeLoan && (
              <form onSubmit={submitTakeLoan} style={{background: '#fdfbfa', padding: '15px', borderRadius: '8px', border: '1px solid #e7e1d5', marginBottom: '15px', display: 'flex', gap: '10px'}}>
                <input type="text" placeholder="Lender Name" value={loanLender} onChange={e => setLoanLender(e.target.value)} required style={{flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc'}} />
                <input type="number" placeholder="Principal (₹)" value={loanPrincipal} onChange={e => setLoanPrincipal(Number(e.target.value))} required style={{flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc'}} />
                <input type="number" placeholder="Interest Rate (%)" value={loanRate} onChange={e => setLoanRate(Number(e.target.value))} required style={{width: '120px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc'}} />
                <button type="submit" disabled={saving} className="action-btn green" style={{margin: 0, padding: '8px 15px'}}>Save</button>
                <button type="button" onClick={() => setShowTakeLoan(false)} className="action-btn outline" style={{margin: 0, padding: '8px 15px'}}>Cancel</button>
              </form>
            )}
            {data?.loans?.map(l => (
              <div key={l.id} className="history-item">
                <strong>{l.lender} {l.type === 'lent' ? '(Lent)' : '(Borrowed)'}</strong>
                <small>Principal: {money(l.principal)} @ {l.rate_percent}%</small>
              </div>
            ))}
          </div>

          <div className="manager-section full-width">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
              <h3 style={{margin: 0}}>Farmers Ledger</h3>
              <div className="search-bar" style={{width: '250px', marginBottom: 0}}>
                <Search size={16} className="search-icon"/>
                <input type="text" placeholder="Search farmers..." value={farmerSearchQuery} onChange={e => setFarmerSearchQuery(e.target.value)} />
              </div>
            </div>
            <p className="empty-text">Click on a farmer to view their ledger and settle balances.</p>
            {data?.parties.filter(p => p.type === 'farmer' && p.name.toLowerCase().includes(farmerSearchQuery.toLowerCase())).map(p => (
              <div key={p.id} className="history-item voucher-item clickable" onClick={() => { setSelectedPartyForLedger(p); setFlow("PARTY_LEDGER"); }}>
                <div>
                  <strong>{p.name}</strong>
                  <small>{p.father_name ? `S/o ${p.father_name} · ` : ""}{p.unique_id ? `ID: ${p.unique_id} · ` : ""}Balance: {money(p.balance)}</small>
                </div>
                <button className="delete-btn" onClick={(e) => { e.stopPropagation(); deleteParty(p.name); }} disabled={saving}><Trash2 size={16}/> Delete</button>
              </div>
            ))}
          </div>

          <div className="manager-section full-width">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
              <h3 style={{margin: 0}}>Suppliers Ledger</h3>
              <div className="search-bar" style={{width: '250px', marginBottom: 0}}>
                <Search size={16} className="search-icon"/>
                <input type="text" placeholder="Search suppliers..." value={supplierSearchQuery} onChange={e => setSupplierSearchQuery(e.target.value)} />
              </div>
            </div>
            <p className="empty-text">Click on a supplier to view their ledger and settle balances.</p>
            {data?.parties.filter(p => p.type === 'supplier' && p.name.toLowerCase().includes(supplierSearchQuery.toLowerCase())).map(p => (
              <div key={p.id} className="history-item voucher-item clickable" onClick={() => { setSelectedPartyForLedger(p); setFlow("PARTY_LEDGER"); }}>
                <div>
                  <strong>{p.name}</strong>
                  <small>{p.father_name ? `S/o ${p.father_name} · ` : ""}{p.unique_id ? `ID: ${p.unique_id} · ` : ""}Balance: {money(p.balance)}</small>
                </div>
                <button className="delete-btn" onClick={(e) => { e.stopPropagation(); deleteParty(p.name); }} disabled={saving}><Trash2 size={16}/> Delete</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderVoucherHistory() {
    return (
      <div className="wizard-card manager-tools-card">
        <header className="with-back">
          <button className="back-btn" onClick={() => setFlow("MANAGER_TOOLS")}><ArrowLeft size={24}/></button>
          <h2>Voucher History</h2>
        </header>
        <div className="date-picker-row">
          <label>
            <strong>Track Day:</strong>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
          </label>
        </div>
        <div className="manager-section full-width">
          {data?.vouchers.filter(v => v.voucher_date === selectedDate).length === 0 ? <p className="empty-text">No vouchers on this day.</p> : null}
          {data?.vouchers.filter(v => v.voucher_date === selectedDate).map(v => (
            <div key={v.id} className="history-item voucher-item">
              <div>
                <strong>{v.voucher_no} · {v.type.toUpperCase()}</strong>
                <small>{v.party_name} · {v.item_name} {v.quantity > 0 ? `· ${v.quantity} units` : ""} · {money(v.total)}</small>
              </div>
              <div className="voucher-actions">
                <button className="action-btn outline" style={{padding: '6px 12px', fontSize: '13px', margin: 0}} onClick={() => { setSelectedInvoice(v.voucher_no); setFlow("VIEW_INVOICE"); }}><FileText size={16}/> Invoice</button>
                <button className="delete-btn" onClick={() => deleteVoucher(v.voucher_no)} disabled={saving}><Trash2 size={16}/> Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderSettingsView() {
    return (
      <div className="wizard-card manager-tools-card">
        <header className="with-back">
          <button className="back-btn" onClick={() => setFlow("MANAGER_TOOLS")}><ArrowLeft size={24}/></button>
          <h2>Invoice Template Settings</h2>
        </header>
        <form className="custom-input-form" style={{display: 'flex', flexDirection: 'column', gap: '15px'}} onSubmit={saveSettings}>
          <div className="manager-section">
            <h3>Company Details</h3>
            <input type="text" name="company_name" placeholder="Company Name" defaultValue={data?.settings?.company_name} required />
            <textarea name="address" placeholder="Company Address" defaultValue={data?.settings?.address} required style={{width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #d8d0c0', background: '#fcfcfc', fontFamily: 'inherit', resize: 'vertical', minHeight: '80px'}}/>
            <input type="text" name="phone" placeholder="Phone Number" defaultValue={data?.settings?.phone} required />
          </div>
          <div className="manager-section">
            <h3>Bank Details</h3>
            <input type="text" name="bank_name" placeholder="Bank Name" defaultValue={data?.settings?.bank_name} />
            <input type="text" name="account_name" placeholder="Account Name" defaultValue={data?.settings?.account_name} />
            <input type="text" name="account_no" placeholder="Account Number" defaultValue={data?.settings?.account_no} />
            <input type="text" name="ifsc" placeholder="IFSC Code" defaultValue={data?.settings?.ifsc} />
          </div>
          <button type="submit" disabled={saving} className="action-btn green" style={{alignSelf: 'flex-start', padding: '12px 24px'}}>{saving ? "Saving..." : "Save Settings"}</button>
        </form>
      </div>
    );
  }

  function renderInvoiceView() {
    if (!selectedInvoice) return null;
    // We group by voucher_no because multi-item cart creates multiple vouchers with the same base voucher_no
    const invoiceRows = data?.vouchers.filter(v => v.voucher_no === selectedInvoice || v.voucher_no.startsWith(selectedInvoice + "-")) || [];
    if (invoiceRows.length === 0) return null;
    
    const firstRow = invoiceRows[0];
    const partyData = data?.parties.find(p => p.name === firstRow.party_name);
    
    // Derived values
    const grandTotal = invoiceRows.reduce((sum, v) => sum + v.total, 0);
    const dateStr = new Date(firstRow.voucher_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    
    const printPdf = () => {
      const el = document.getElementById("invoicePage");
      if (!el || !(window as any).html2pdf) {
        window.print();
        return;
      }
      (window as any).html2pdf().from(el).set({
        margin: 0,
        filename: `${selectedInvoice}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      }).save();
    };

    return (
      <div className="wizard-card manager-tools-card">
        <header className="with-back" style={{justifyContent: 'space-between'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <button className="back-btn" onClick={() => setFlow("MANAGER_TOOLS")}><ArrowLeft size={24}/></button>
            <h2>Invoice View</h2>
          </div>
          <button className="action-btn blue" onClick={printPdf} style={{padding: '8px 15px', fontSize: '14px', margin: 0}}>
            <Printer size={16}/> Print / Save PDF
          </button>
        </header>

        <div className="template-wrap">
          <div className="invoice-page" id="invoicePage">
            <header className="invoice-header">
              <div>
                <h1 className="invoice-title">{firstRow.type.toUpperCase() === "SALE" ? "TAX INVOICE" : "PURCHASE"}</h1>
                <p className="company-name">{data?.settings?.company_name || "KrishiKhata Inc."}</p>
                <div className="company-details" style={{whiteSpace: 'pre-wrap'}}>
                  {data?.settings?.address || "123 Agriculture Market,\nNear Main Station,\nCity, State 123456"}\n
                  Ph: {data?.settings?.phone || "+91 9876543210"}
                </div>
              </div>
              <div className="logo-box">{data?.settings?.company_name ? data.settings.company_name.split(' ').map(w => w[0]).join('').substring(0,2).toUpperCase() : "KK"}</div>
            </header>

            <section className="invoice-info-grid">
              <div>
                <div className="invoice-section-title">{firstRow.type === "sale" ? "Bill To:" : "Supplier:"}</div>
                <div className="invoice-text">
                  <strong>{firstRow.party_name}</strong>\n
                  {partyData?.location || "No address provided"}\n
                  {partyData?.phone ? `Ph: ${partyData.phone}` : ""}
                </div>
              </div>
              <div>
                <div className="invoice-section-title">Details:</div>
                <div className="invoice-meta-row"><strong>Voucher #:</strong><span>{firstRow.voucher_no}</span></div>
                <div className="invoice-meta-row"><strong>Date:</strong><span>{dateStr}</span></div>
                <div className="invoice-meta-row"><strong>Type:</strong><span>{firstRow.type.toUpperCase()}</span></div>
              </div>
            </section>

            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoiceRows.map(v => (
                  <tr key={v.id}>
                    <td>
                      <strong>{v.item_name}</strong>
                      {(() => {
                        const productData = data?.products.find(p => p.name === v.item_name);
                        return productData ? <small style={{display: 'block', color: '#666', marginTop: '2px'}}>HSN/HSC: {productData.hsn || "N/A"} | GST: {productData.gst_rate}%</small> : null;
                      })()}
                    </td>
                    <td>{v.quantity}</td>
                    <td>{money(v.total / (v.quantity || 1))}</td>
                    <td>{money(v.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <section className="invoice-totals">
              <div></div>
              <div>
                <div className="total-row grand">
                  <div className="label">GRAND TOTAL</div>
                  <div className="value">{money(grandTotal)}</div>
                </div>
              </div>
            </section>

            <footer className="invoice-footer">
              <div>
                <div className="payment-title">Payment Info:</div>
                <div className="payment-text" style={{whiteSpace: 'pre-wrap'}}>
                  Bank Name: {data?.settings?.bank_name || "Krishi Bank"}\n
                  Account Name: {data?.settings?.account_name || "KrishiKhata"}\n
                  Account No.: {data?.settings?.account_no || "1234567890"}\n
                  IFSC Code: {data?.settings?.ifsc || "KB0001234"}
                </div>
              </div>
              <div>
                <div className="signature"><span className="signature-text">{data?.settings?.company_name || "KrishiKhata"}</span></div>
                <div className="auth-label">Authorized Signature</div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="wizard-layout">
      {flow === "HOME" && renderHome()}
      {flow === "SELECT_PARTY" && renderSelectParty()}
      {flow === "SELECT_PRODUCT" && renderSelectProduct()}
      {flow === "CART_DETAILS" && renderCartDetails()}
      {flow === "REVIEW" && renderReview()}
      {flow === "SUCCESS" && renderSuccess()}
      {flow === "MANAGER_TOOLS" && renderManagerTools()}
      {flow === "PARTY_LEDGER" && renderPartyLedger()}
      {flow === "INVENTORY_VIEW" && renderInventoryView()}
      {flow === "VOUCHER_HISTORY" && renderVoucherHistory()}
      {flow === "SETTINGS_VIEW" && renderSettingsView()}
      {flow === "VIEW_INVOICE" && renderInvoiceView()}
    </main>
  );
}
