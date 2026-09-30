type Role = "purchase" | "sales";

const statements = [
  `CREATE TABLE IF NOT EXISTS parties (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT NOT NULL, name TEXT NOT NULL, location TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', gstin TEXT NOT NULL DEFAULT '', balance REAL NOT NULL DEFAULT 0, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, category TEXT NOT NULL, hsn TEXT NOT NULL, batch TEXT NOT NULL, expiry TEXT NOT NULL, unit TEXT NOT NULL, stock REAL NOT NULL DEFAULT 0, purchase_rate REAL NOT NULL DEFAULT 0, sale_rate REAL NOT NULL DEFAULT 0, gst_rate REAL NOT NULL DEFAULT 0, low_stock_alert REAL NOT NULL DEFAULT 0, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS vouchers (id INTEGER PRIMARY KEY AUTOINCREMENT, voucher_no TEXT NOT NULL UNIQUE, type TEXT NOT NULL, party_name TEXT NOT NULL, item_name TEXT NOT NULL DEFAULT '', quantity REAL NOT NULL DEFAULT 0, taxable_value REAL NOT NULL DEFAULT 0, tax_amount REAL NOT NULL DEFAULT 0, total REAL NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'Credit', voucher_date TEXT NOT NULL, created_by TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS audit_log (id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT NOT NULL, module TEXT NOT NULL, record_ref TEXT NOT NULL, detail TEXT NOT NULL, actor TEXT NOT NULL, role TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS loans (id INTEGER PRIMARY KEY AUTOINCREMENT, lender TEXT NOT NULL, principal REAL NOT NULL, rate_percent REAL NOT NULL, start_date TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY AUTOINCREMENT, company_name TEXT, address TEXT, phone TEXT, bank_name TEXT, account_name TEXT, account_no TEXT, ifsc TEXT)`,
  `CREATE TABLE IF NOT EXISTS reminders (id INTEGER PRIMARY KEY AUTOINCREMENT, party_name TEXT NOT NULL, amount REAL NOT NULL, type TEXT NOT NULL, due_date TEXT NOT NULL, frequency TEXT NOT NULL DEFAULT 'monthly', status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`
];

async function ready() {
  const db = (globalThis as typeof globalThis & { __KRISHI_DB?: D1Database }).__KRISHI_DB;
  if (!db) throw new Error("Database binding is unavailable");
  await db.batch(statements.map((sql) => db.prepare(sql)));
  const count = await db.prepare("SELECT COUNT(*) AS count FROM products").first<{ count: number }>();
  if ((count?.count ?? 0) === 0) {
    await db.batch([
      db.prepare("INSERT INTO products (name,category,hsn,batch,expiry,unit,stock,purchase_rate,sale_rate,gst_rate) VALUES (?,?,?,?,?,?,?,?,?,?)").bind("DAP 18-46-0 · 50 kg","Fertiliser","31053000","DP-0826","2028-08-31","Bag",12,1220,1360,5),
      db.prepare("INSERT INTO products (name,category,hsn,batch,expiry,unit,stock,purchase_rate,sale_rate,gst_rate) VALUES (?,?,?,?,?,?,?,?,?,?)").bind("Saaf Fungicide · 500 g","Fungicide","38089290","SF-2409","2026-10-02","Pack",24,410,495,18),
      db.prepare("INSERT INTO products (name,category,hsn,batch,expiry,unit,stock,purchase_rate,sale_rate,gst_rate) VALUES (?,?,?,?,?,?,?,?,?,?)").bind("Urea · 45 kg","Fertiliser","31021000","UR-1182","2028-06-30","Bag",8,264,290,5),
      db.prepare("INSERT INTO products (name,category,hsn,batch,expiry,unit,stock,purchase_rate,sale_rate,gst_rate) VALUES (?,?,?,?,?,?,?,?,?,?)").bind("Confidor · 100 ml","Insecticide","38089199","CF-182","2026-11-18","Bottle",31,520,625,18),
      db.prepare("INSERT INTO parties (type,name,location,phone,gstin,balance) VALUES (?,?,?,?,?,?)").bind("supplier","UPL Limited","Bengaluru","","29AAACU1365P1ZV",482400),
      db.prepare("INSERT INTO parties (type,name,location,phone,gstin,balance) VALUES (?,?,?,?,?,?)").bind("supplier","Coromandel International","Bengaluru","","29AAACC7852K1Z9",376820),
      db.prepare("INSERT INTO parties (type,name,location,phone,gstin,balance) VALUES (?,?,?,?,?,?)").bind("farmer","Ramesh Gowda","Mandya","98450 12684","",42680),
      db.prepare("INSERT INTO parties (type,name,location,phone,gstin,balance) VALUES (?,?,?,?,?,?)").bind("farmer","Venkatappa R.","Tumakuru","99804 78211","",38240),
      db.prepare("INSERT INTO parties (type,name,location,phone,gstin,balance) VALUES (?,?,?,?,?,?)").bind("farmer","Mahesh Reddy","Kolar","99010 34628","",31820),
      db.prepare("INSERT INTO vouchers (voucher_no,type,party_name,item_name,quantity,taxable_value,tax_amount,total,status,voucher_date,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)").bind("SAL/26-27/2941","sale","Ramesh Gowda","DAP 18-46-0 · 50 kg",10,17542.86,877.14,18420,"Part-paid","2026-08-10","Sales Admin"),
      db.prepare("INSERT INTO vouchers (voucher_no,type,party_name,item_name,quantity,taxable_value,tax_amount,total,status,voucher_date,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)").bind("SAL/26-27/2940","sale","Sri Lakshmi Agro Centre","Urea · 45 kg",200,61714.29,3085.71,64800,"Credit","2026-08-10","Sales Admin"),
      db.prepare("INSERT INTO vouchers (voucher_no,type,party_name,item_name,quantity,taxable_value,tax_amount,total,status,voucher_date,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)").bind("PUR/26-27/0842","purchase","UPL Limited","Confidor · 100 ml",150,71627.12,12892.88,84520,"Credit","2026-08-10","Purchase Admin"),
      db.prepare("INSERT INTO audit_log (action,module,record_ref,detail,actor,role,created_at) VALUES (?,?,?,?,?,?,?)").bind("Invoice created","Sales","SAL/26-27/2941","Ramesh Gowda · ₹18,420 · Part-paid","Sales Admin","sales","2026-08-10 10:42:00"),
      db.prepare("INSERT INTO audit_log (action,module,record_ref,detail,actor,role,created_at) VALUES (?,?,?,?,?,?,?)").bind("Stock updated","Inventory","DP-0826","DAP stock reduced from 22 to 12 bags","Sales Admin","sales","2026-08-10 10:42:00"),
      db.prepare("INSERT INTO audit_log (action,module,record_ref,detail,actor,role,created_at) VALUES (?,?,?,?,?,?,?)").bind("Purchase recorded","Purchases","PUR/26-27/0842","UPL Limited · ₹84,520 · 150 units","Purchase Admin","purchase","2026-08-10 09:18:00"),
      db.prepare("INSERT INTO loans (lender,principal,rate_percent,start_date) VALUES (?,?,?,?)").bind("Canara Bank MSME", 1500000, 8.5, "2025-01-10"),
      db.prepare("INSERT INTO loans (lender,principal,rate_percent,start_date) VALUES (?,?,?,?)").bind("Ramesh Capital", 250000, 12, "2025-11-20"),
    ]);
  }
  
  try { await db.prepare("ALTER TABLE parties ADD COLUMN father_name TEXT DEFAULT ''").run(); } catch (e) {}
  try { await db.prepare("ALTER TABLE parties ADD COLUMN unique_id TEXT DEFAULT ''").run(); } catch (e) {}
  try { await db.prepare("ALTER TABLE products ADD COLUMN low_stock_alert REAL DEFAULT 0").run(); } catch (e) {}
  try { await db.prepare("ALTER TABLE loans ADD COLUMN type TEXT DEFAULT 'borrowed'").run(); } catch (e) {}
  try { await db.prepare("ALTER TABLE products ADD COLUMN item_kind TEXT DEFAULT ''").run(); } catch (e) {}
  try { await db.prepare("ALTER TABLE products ADD COLUMN fertilizer_type TEXT DEFAULT ''").run(); } catch (e) {}
  try { await db.prepare("ALTER TABLE products ADD COLUMN goods_kind TEXT DEFAULT ''").run(); } catch (e) {}
  try { await db.prepare("ALTER TABLE products ADD COLUMN packaging_type TEXT DEFAULT ''").run(); } catch (e) {}

  const settingsCount = await db.prepare("SELECT COUNT(*) AS count FROM settings").first<{ count: number }>();
  if ((settingsCount?.count ?? 0) === 0) {
    await db.prepare("INSERT INTO settings (company_name, address, phone, bank_name, account_name, account_no, ifsc) VALUES (?, ?, ?, ?, ?, ?, ?)").bind("KrishiKhata Default", "123 Farm Road, Agro City", "9999999999", "Agri Bank", "KrishiKhata Inc", "0000000000", "AGRI0000").run();
  }

  return db;
}

function actor(request: Request) {
  const email = request.headers.get("oai-authenticated-user-email");
  if (email) return email;
  return request.headers.get("x-admin-role") === "purchase" ? "Purchase Admin" : "Sales Admin";
}

export async function GET() {
  try {
    const db = await ready();
    const [vouchers, products, parties, audit, loans, settingsResult, reminders] = await Promise.all([
      db.prepare("SELECT * FROM vouchers ORDER BY created_at DESC, id DESC LIMIT 100").all<{type:string, total:number}>(),
      db.prepare("SELECT * FROM products ORDER BY name").all(),
      db.prepare("SELECT * FROM parties ORDER BY balance DESC").all<{type:string, balance:number, father_name:string, unique_id:string}>(),
      db.prepare("SELECT * FROM audit_log ORDER BY created_at DESC, id DESC LIMIT 100").all(),
      db.prepare("SELECT * FROM loans").all<{principal:number, rate_percent:number, start_date:string, type?:string}>(),
      db.prepare("SELECT * FROM settings LIMIT 1").first(),
      db.prepare("SELECT * FROM reminders WHERE status = 'active' ORDER BY due_date ASC").all(),
    ]);

    let ebit = 0;
    for (const v of vouchers.results) {
      if (v.type === "sale") ebit += v.total;
      else if (v.type === "purchase") ebit -= v.total;
    }

    let debtors = 0;
    let creditors = 0;
    for (const p of parties.results) {
      if (p.type === "farmer") debtors += p.balance;
      else if (p.type === "supplier") creditors += p.balance;
    }

    let totalPrincipal = 0;
    let accruedInterest = 0;
    const now = new Date();
    for (const l of loans.results) {
      totalPrincipal += l.principal;
      const start = new Date(l.start_date);
      const days = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (days > 0) {
        accruedInterest += (l.principal * (l.rate_percent / 100)) * (days / 365);
      }
    }

    return Response.json({ 
      vouchers: vouchers.results, 
      products: products.results, 
      parties: parties.results, 
      audit: audit.results,
      loans: loans.results,
      settings: settingsResult?.results?.[0] || null,
      reminders: reminders.results || [],
      financials: {
        ebit,
        debtors,
        creditors,
        totalPrincipal,
        accruedInterest
      },
      syncedAt: new Date().toISOString() 
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load records" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const role = (request.headers.get("x-admin-role") ?? "sales") as Role;
    const signedActor = actor(request);
    const body = await request.json() as any;
    
    const db = await ready();

    if (body.action === "update_settings") {
      await db.prepare("UPDATE settings SET company_name = ?, address = ?, phone = ?, bank_name = ?, account_name = ?, account_no = ?, ifsc = ?").bind(body.company_name, body.address, body.phone, body.bank_name, body.account_name, body.account_no, body.ifsc).run();
      await db.prepare("INSERT INTO audit_log (action,module,record_ref,detail,actor,role) VALUES (?,?,?,?,?,?)").bind("Settings updated","Config","Invoice Settings","Updated invoice template",signedActor,role).run();
      return Response.json({ ok: true });
    }

    if (body.action === "update_product") {
      await db.prepare("UPDATE products SET stock = ?, purchase_rate = ?, sale_rate = ?, low_stock_alert = ? WHERE id = ?").bind(body.stock, body.purchase_rate, body.sale_rate, body.low_stock_alert, body.id).run();
      await db.prepare("INSERT INTO audit_log (action,module,record_ref,detail,actor,role) VALUES (?,?,?,?,?,?)").bind("Product updated","Inventory",body.id.toString(),"Updated product parameters",signedActor,role).run();
      return Response.json({ ok: true });
    }

    if (body.action === "create_product") {
      await db.prepare("INSERT INTO products (name, category, hsn, batch, expiry, unit, stock, purchase_rate, sale_rate, gst_rate, low_stock_alert, item_kind, fertilizer_type, goods_kind, packaging_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(body.name, body.category, body.hsn || "", "New", "2030-01-01", body.unit, body.stock, body.purchase_rate, body.sale_rate, body.gst_rate, body.low_stock_alert || 0, body.item_kind || "", body.fertilizer_type || "", body.goods_kind || "", body.packaging_type || "").run();
      await db.prepare("INSERT INTO audit_log (action,module,record_ref,detail,actor,role) VALUES (?,?,?,?,?,?)").bind("Product created","Inventory",body.name,`${body.name} created manually`,signedActor,role).run();
      return Response.json({ ok: true });
    }

    if (body.action === "delete_party") {
      await db.prepare("DELETE FROM parties WHERE name = ?").bind(body.name).run();
      await db.prepare("DELETE FROM vouchers WHERE party_name = ?").bind(body.name).run();
      await db.prepare("DELETE FROM reminders WHERE party_name = ?").bind(body.name).run();
      await db.prepare("INSERT INTO audit_log (action,module,record_ref,detail,actor,role) VALUES (?,?,?,?,?,?)").bind("Party deleted","Manager",body.name,`${body.name} and their records were deleted`,signedActor,role).run();
      return Response.json({ ok: true });
    }

    if (body.action === "update_product") {
      await db.prepare("UPDATE products SET stock = ?, purchase_rate = ?, sale_rate = ?, low_stock_alert = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(body.stock, body.purchase_rate, body.sale_rate, body.low_stock_alert, body.id).run();
      const p = await db.prepare("SELECT name FROM products WHERE id = ?").bind(body.id).first<{name: string}>();
      if (p) {
        await db.prepare("INSERT INTO audit_log (action,module,record_ref,detail,actor,role) VALUES (?,?,?,?,?,?)").bind("Product updated","Inventory",p.name,`${p.name} updated manually`,signedActor,role).run();
      }
      return Response.json({ ok: true });
    }
    
    if (body.action === "take_loan") {
      await db.prepare("INSERT INTO loans (lender, principal, rate_percent, start_date, type) VALUES (?, ?, ?, ?, ?)").bind(body.lender, body.principal, body.rate, body.date, 'borrowed').run();
      
      const partyExists = await db.prepare("SELECT id FROM parties WHERE name = ?").bind(body.lender).first();
      if (!partyExists) {
        await db.prepare("INSERT INTO parties (type, name, location, balance) VALUES (?, ?, ?, ?)").bind("supplier", body.lender, "Local", body.principal).run();
      } else {
        await db.prepare("UPDATE parties SET type = 'supplier', balance = balance + ? WHERE name = ?").bind(body.principal, body.lender).run();
      }
      
      await db.prepare("INSERT INTO audit_log (action,module,record_ref,detail,actor,role) VALUES (?,?,?,?,?,?)").bind("Loan taken","Finance","Loan",`${body.lender} · ₹${body.principal}`,signedActor,role).run();
      return Response.json({ ok: true });
    }

    if (body.action === "create_reminder") {
      await db.prepare("INSERT INTO reminders (party_name, amount, type, due_date, frequency) VALUES (?, ?, ?, ?, ?)").bind(body.party_name, body.amount, body.reminder_type, body.due_date, body.frequency).run();
      return Response.json({ ok: true });
    }

    if (body.action === "settle_reminder") {
      await db.prepare("UPDATE reminders SET status = 'completed' WHERE id = ?").bind(body.id).run();
      
      // We also log this in the audit log
      const reminder = await db.prepare("SELECT * FROM reminders WHERE id = ?").bind(body.id).first<{party_name: string, amount: number}>();
      if (reminder) {
        await db.prepare("INSERT INTO audit_log (action,module,record_ref,detail,actor,role) VALUES (?,?,?,?,?,?)").bind("Reminder Settled","Finance",reminder.party_name,`Collected/Settled Reminder`,signedActor,role).run();
      }
      return Response.json({ ok: true });
    }
    
    if (!body.party || !body.date) return Response.json({ error: "Party and date are required" }, { status: 400 });
    const isVoucher = body.type === "sale" || body.type === "purchase";
    if (isVoucher && (!body.items || body.items.length === 0)) return Response.json({ error: "At least one item is required for vouchers" }, { status: 400 });
    if (!isVoucher && !body.amount) return Response.json({ error: "Amount is required for settlements" }, { status: 400 });
    

    
    let grandTotal = 0;
    if (isVoucher && body.items) {
      grandTotal = body.items.reduce((sum, i) => sum + (i.quantity * i.rate) * (1 + (i.gstRate || 0)/100), 0);
    } else {
      grandTotal = body.amount || 0;
    }
    
    const prefix = body.type === "sale" ? "SAL" : body.type === "purchase" ? "PUR" : body.type === "receipt" ? "REC" : "PAY";
    const next = await db.prepare("SELECT COALESCE(MAX(id),0)+1 AS id FROM vouchers").first<{ id: number }>();
    const ref = `${prefix}/26-27/${String((body.type === "sale" ? 2941 : 842) + (next?.id ?? 1)).padStart(4,"0")}`;
    
    const partyExists = await db.prepare("SELECT id FROM parties WHERE name = ?").bind(body.party).first();
    const balanceChange = isVoucher ? grandTotal : -grandTotal;
    
    const batchStmts = [];
    if (!partyExists) {
      batchStmts.push(db.prepare("INSERT INTO parties (type, name, father_name, unique_id, location, balance) VALUES (?, ?, ?, ?, ?, ?)").bind(body.type === "sale" || body.type === "receipt" ? "farmer" : "supplier", body.party, body.father_name || "", body.unique_id || "", "Local", balanceChange));
    } else {
      batchStmts.push(db.prepare("UPDATE parties SET balance = balance + ? WHERE name = ?").bind(balanceChange, body.party));
    }
    
    if (isVoucher && body.items) {
      let itemIndex = 1;
      for (const i of body.items) {
        const productExists = await db.prepare("SELECT id FROM products WHERE name = ?").bind(i.item).first();
        if (!productExists) {
          batchStmts.push(db.prepare("INSERT INTO products (name, category, hsn, batch, expiry, unit, stock, purchase_rate, sale_rate, gst_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(i.item, "General", i.hsnCode || "", "New", "2030-01-01", "Unit", body.type === "sale" ? -i.quantity : i.quantity, body.type === "purchase" ? i.rate : 0, body.type === "sale" ? i.rate : 0, i.gstRate));
          batchStmts.push(db.prepare("INSERT INTO audit_log (action,module,record_ref,detail,actor,role) VALUES (?,?,?,?,?,?)").bind("Product created","Inventory",i.item,`${i.item} created`,signedActor,role));
        } else {
          batchStmts.push(db.prepare(`UPDATE products SET stock = stock ${body.type === "sale" ? "-" : "+"} ?, hsn = COALESCE(?, hsn), gst_rate = ?, updated_at = CURRENT_TIMESTAMP WHERE name = ?`).bind(i.quantity, i.hsnCode || null, i.gstRate, i.item));
          batchStmts.push(db.prepare("INSERT INTO audit_log (action,module,record_ref,detail,actor,role) VALUES (?,?,?,?,?,?)").bind("Stock updated","Inventory",i.item,`${i.item} ${body.type === "sale" ? "reduced" : "increased"} by ${i.quantity}`,signedActor,role));
        }
        const taxable = i.quantity * i.rate;
        const tax = taxable * (i.gstRate || 0) / 100;
        const total = taxable + tax;
        const itemRef = body.items.length > 1 ? `${ref}-${itemIndex++}` : ref;
        batchStmts.push(db.prepare("INSERT INTO vouchers (voucher_no,type,party_name,item_name,quantity,taxable_value,tax_amount,total,status,voucher_date,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)").bind(itemRef,body.type,body.party,i.item,i.quantity,taxable,tax,total,body.status || "Settled",body.date,signedActor));
      }
    } else {
      batchStmts.push(db.prepare("INSERT INTO vouchers (voucher_no,type,party_name,item_name,quantity,taxable_value,tax_amount,total,status,voucher_date,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)").bind(ref,body.type,body.party,"Settlement",0,0,0,grandTotal,body.status || "Settled",body.date,signedActor));
    }
    
    let auditAction = body.type === "sale" ? "Invoice created" : body.type === "purchase" ? "Purchase recorded" : body.type === "receipt" ? "Payment received" : "Payment made";
    batchStmts.push(db.prepare("INSERT INTO audit_log (action,module,record_ref,detail,actor,role) VALUES (?,?,?,?,?,?)").bind(auditAction, body.type === "sale" || body.type === "receipt" ? "Sales" : "Purchases", ref, `${body.party} · ₹${grandTotal.toFixed(2)}`, signedActor, role));

    if (body.type === "sale" && body.isLoan) {
      batchStmts.push(db.prepare("INSERT INTO loans (lender, principal, rate_percent, start_date, type) VALUES (?, ?, ?, ?, ?)").bind(body.party, body.loanAmount || grandTotal, body.interestRate || 0, body.date, 'lent'));
    }

    await db.batch(batchStmts);
    return Response.json({ ok: true, voucherNo: ref, total: grandTotal }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to save voucher" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const role = (request.headers.get("x-admin-role") ?? "sales") as Role;
    const { searchParams } = new URL(request.url);
    const voucherNo = searchParams.get("voucherNo");
    const partyId = searchParams.get("partyId");
    const productId = searchParams.get("productId");
    const db = await ready();
    const signedActor = actor(request);

    if (voucherNo) {
      const vouchers = await db.prepare("SELECT * FROM vouchers WHERE voucher_no = ?").bind(voucherNo).all<{ type: "sale" | "purchase" | "receipt" | "payment"; item_name: string; quantity: number; total: number; party_name: string }>();
      if (!vouchers.results || vouchers.results.length === 0) return Response.json({ error: "Voucher not found" }, { status: 404 });
      
      const v0 = vouchers.results[0];
      if ((role === "purchase" && (v0.type !== "purchase" && v0.type !== "payment")) || (role === "sales" && (v0.type !== "sale" && v0.type !== "receipt"))) return Response.json({ error: "This admin role cannot delete that voucher type" }, { status: 403 });

      const grandTotal = vouchers.results.reduce((sum, v) => sum + v.total, 0);
      const balanceChange = (v0.type === "sale" || v0.type === "purchase") ? -grandTotal : grandTotal;

      const batchStmts = [
        db.prepare("UPDATE parties SET balance = balance + ? WHERE name = ?").bind(balanceChange, v0.party_name),
        db.prepare("DELETE FROM vouchers WHERE voucher_no = ?").bind(voucherNo),
        db.prepare("INSERT INTO audit_log (action,module,record_ref,detail,actor,role) VALUES (?,?,?,?,?,?)").bind("Voucher deleted", v0.type === "sale" || v0.type === "receipt" ? "Sales" : "Purchases", voucherNo, `Voucher ${voucherNo} deleted, balance reversed`, signedActor, role)
      ];
      
      if (v0.type === "sale" || v0.type === "purchase") {
        for (const v of vouchers.results) {
          batchStmts.unshift(db.prepare(`UPDATE products SET stock = stock ${v0.type === "sale" ? "+" : "-"} ?, updated_at = CURRENT_TIMESTAMP WHERE name = ?`).bind(v.quantity, v.item_name));
        }
      }
      
      await db.batch(batchStmts);
      return Response.json({ ok: true });
    }
    
    if (partyId) {
      const party = await db.prepare("SELECT * FROM parties WHERE id = ?").bind(partyId).first<{ name: string; type: string }>();
      if (!party) return Response.json({ error: "Party not found" }, { status: 404 });
      const count = await db.prepare("SELECT COUNT(*) as count FROM vouchers WHERE party_name = ?").bind(party.name).first<{ count: number }>();
      if (count && count.count > 0) return Response.json({ error: `Cannot delete ${party.name} because they have ${count.count} linked vouchers.` }, { status: 400 });
      
      const batchStmts = [
        db.prepare("DELETE FROM parties WHERE id = ?").bind(partyId),
        db.prepare("INSERT INTO audit_log (action,module,record_ref,detail,actor,role) VALUES (?,?,?,?,?,?)").bind("Party deleted", "Contacts", party.name, `Deleted ${party.type} ${party.name}`, signedActor, role)
      ];
      await db.batch(batchStmts);
      return Response.json({ ok: true });
    }

    if (productId) {
      const product = await db.prepare("SELECT * FROM products WHERE id = ?").bind(productId).first<{ name: string }>();
      if (!product) return Response.json({ error: "Product not found" }, { status: 404 });
      const count = await db.prepare("SELECT COUNT(*) as count FROM vouchers WHERE item_name = ?").bind(product.name).first<{ count: number }>();
      if (count && count.count > 0) return Response.json({ error: `Cannot delete ${product.name} because it is used in ${count.count} linked vouchers.` }, { status: 400 });
      
      const batchStmts = [
        db.prepare("DELETE FROM products WHERE id = ?").bind(productId),
        db.prepare("INSERT INTO audit_log (action,module,record_ref,detail,actor,role) VALUES (?,?,?,?,?,?)").bind("Product deleted", "Inventory", product.name, `Deleted product ${product.name}`, signedActor, role)
      ];
      await db.batch(batchStmts);
      return Response.json({ ok: true });
    }

    return Response.json({ error: "voucherNo, partyId, or productId is required" }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to process deletion" }, { status: 500 });
  }
}
