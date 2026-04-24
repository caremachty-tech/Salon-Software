import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Receipt, Search, UserPlus, Minus, ShoppingBag, Scissors, User, ChevronDown, Gift, MessageCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Staff } from "@/context/DataContext";
import { generateInvoicePDF, buildWhatsAppMessage } from "@/lib/invoice";

const POINTS_PER_100 = 10;
const POINTS_VALUE = 0.1; // 10 points = ₹1

type CartItem = {
  lineId: number;
  id: string;
  name: string;
  price: number;
  qty: number;
  type: "service" | "product" | "package";
  inventoryId?: string;
  sessionsTotal?: number;
  loyaltyPoints?: number;
};

type FoundCustomer = { id: string; name: string; phone: string | null; tag: string; loyalty_points: number };
type FoundStaff = Pick<Staff, "id" | "name" | "role">;

const BillingPage = () => {
  const { services, inventory, staff: allStaff, packages, loading, refresh } = useData();
  const { salon } = useAuth();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");

  // Loyalty points
  const [customerPoints, setCustomerPoints] = useState(0);
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [pointsLoading, setPointsLoading] = useState(false);

  // Customer lookup
  const [custQuery, setCustQuery] = useState("");
  const [custResults, setCustResults] = useState<FoundCustomer[]>([]);
  const [custSearching, setCustSearching] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<FoundCustomer | null>(null);
  const [showNewCust, setShowNewCust] = useState(false);
  const [newCust, setNewCust] = useState({ name: "", phone: "", email: "" });
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stylist picker
  const [stylistQuery, setStylistQuery] = useState("");
  const [selectedStylist, setSelectedStylist] = useState<FoundStaff | null>(null);
  const hasServices = cart.some((c) => c.type === "service" || c.type === "package");
  const stylistResults = stylistQuery.trim()
    ? allStaff.filter((s) => s.name.toLowerCase().startsWith(stylistQuery.toLowerCase())).slice(0, 6)
    : [];

  // Add service modal
  const [addSvcOpen, setAddSvcOpen] = useState(false);
  const [addSvcSaving, setAddSvcSaving] = useState(false);
  const [svcForm, setSvcForm] = useState({ name: "", price: "", duration_min: "0", loyalty_points: "0" });

  // Add package modal
  const [addPkgOpen, setAddPkgOpen] = useState(false);
  const [addPkgSaving, setAddPkgSaving] = useState(false);
  const [pkgForm, setPkgForm] = useState({ name: "", price: "", sessions_total: "5", service_names: "", loyalty_points: "0" });

  // Charge
  const [charging, setCharging] = useState(false);
  const [custError, setCustError] = useState(false);

  // Customer search with debounce
  useEffect(() => {
    if (!custQuery.trim()) { setCustResults([]); return; }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setCustSearching(true);
      const { data } = await supabase
        .from("customers")
        .select("id, name, phone, tag, loyalty_points")
        .or(`name.ilike.%${custQuery}%,phone.ilike.%${custQuery}%`)
        .limit(6);
      setCustResults((data ?? []) as FoundCustomer[]);
      setCustSearching(false);
    }, 300);
  }, [custQuery]);

  // Re-fetch loyalty points directly from DB when customer selected
  useEffect(() => {
    if (!selectedCustomer) { setCustomerPoints(0); setRedeemPoints(0); return; }
    setPointsLoading(true);
    supabase.from("customers").select("loyalty_points").eq("id", selectedCustomer.id).single()
      .then(({ data }) => {
        setCustomerPoints(data?.loyalty_points ?? 0);
        setPointsLoading(false);
      });
  }, [selectedCustomer?.id]);

  const addToCart = (item: Omit<CartItem, "lineId" | "qty">) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id && c.type === item.type);
      if (existing) return prev.map((c) => c.id === item.id && c.type === item.type ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1, lineId: Date.now() }];
    });
  };

  const updateQty = (lineId: number, delta: number) => {
    setCart((prev) => prev
      .map((c) => c.lineId === lineId ? { ...c, qty: c.qty + delta } : c)
      .filter((c) => c.qty > 0)
    );
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const pointsDiscount = Math.min(redeemPoints * POINTS_VALUE, subtotal);
  const pointsDiscountDisplay = (redeemPoints * POINTS_VALUE).toFixed(2);
  const discountedSubtotal = subtotal - pointsDiscount;
  const tax = discountedSubtotal * 0.08;
  const total = discountedSubtotal + tax;

  const registerNewCustomer = async (): Promise<FoundCustomer | null> => {
    if (!newCust.name.trim()) { toast.error("Customer name is required."); return null; }
    if (!newCust.phone.trim()) { toast.error("Phone number is required."); return null; }
    // Check duplicate phone
    const { data: existing } = await supabase.from("customers").select("id").eq("phone", newCust.phone.trim()).maybeSingle();
    if (existing) { toast.error("A customer with this phone number already exists."); return null; }
    const { data, error } = await supabase.from("customers").insert({
      name: newCust.name.trim(),
      phone: newCust.phone.trim(),
      email: newCust.email || null,
      tag: "Regular",
      visits: 0,
      lifetime_spend: 0,
      loyalty_points: 0,
      salon_id: salon?.id ?? null,
    }).select("id, name, phone, tag, loyalty_points").single();
    if (error) { toast.error(error.message); return null; }
    toast.success(`${newCust.name} registered as a new customer.`);
    refresh();
    return data as FoundCustomer;
  };

  const onCharge = async () => {
    if (cart.length === 0) { toast.error("Cart is empty."); return; }
    if (hasServices && !selectedStylist) { toast.error("Please select a stylist for the service."); return; }
    const hasCustomer = selectedCustomer || (showNewCust && newCust.name.trim());
    if (!hasCustomer) { setCustError(true); toast.error("Customer details are required."); return; }
    setCustError(false);
    setCharging(true);

    let customer = selectedCustomer;

    // Register new customer inline if needed
    if (!customer && showNewCust) {
      customer = await registerNewCustomer();
      if (!customer) { setCharging(false); return; }
      setSelectedCustomer(customer);
      setShowNewCust(false);
    }

    const services_in_cart = cart.filter((c) => c.type === "service");
    const products_in_cart = cart.filter((c) => c.type === "product");
    const packages_in_cart = cart.filter((c) => c.type === "package");

    // 1. Create appointment records per service
    for (const svc of services_in_cart) {
      for (let q = 0; q < svc.qty; q++) {
        await supabase.from("appointments").insert({
          customer_id: customer?.id ?? null,
          service_id: svc.id,
          staff_id: selectedStylist?.id ?? null,
          scheduled_at: new Date().toISOString(),
          total_price: svc.price,
          status: "completed",
          salon_id: salon?.id ?? null,
        });
      }
    }

    // 2. Products — reduce inventory
    for (const prod of products_in_cart) {
      await supabase.from("appointments").insert({
        customer_id: customer?.id ?? null,
        service_id: null,
        scheduled_at: new Date().toISOString(),
        total_price: prod.price * prod.qty,
        status: "completed",
        notes: `Product: ${prod.name} × ${prod.qty}`,
        salon_id: salon?.id ?? null,
      });
      if (prod.inventoryId) {
        const { data: inv } = await supabase.from("inventory").select("stock").eq("id", prod.inventoryId).single();
        if (inv) await supabase.from("inventory").update({ stock: Math.max(0, inv.stock - prod.qty) }).eq("id", prod.inventoryId);
      }
    }

    // 3. Packages — create customer_packages record
    for (const pkg of packages_in_cart) {
      await supabase.from("customer_packages").insert({
        customer_id: customer?.id ?? null,
        package_id: pkg.id,
        sessions_used: 0,
        sessions_total: pkg.sessionsTotal ?? 1,
        salon_id: salon?.id ?? null,
      });
      await supabase.from("appointments").insert({
        customer_id: customer?.id ?? null,
        service_id: null,
        staff_id: selectedStylist?.id ?? null,
        scheduled_at: new Date().toISOString(),
        total_price: pkg.price,
        status: "completed",
        notes: `Package: ${pkg.name}`,
        salon_id: salon?.id ?? null,
      });
    }

    // 4. Update customer stats + loyalty points (sum per-item points)
    if (customer?.id) {
      const { data: cust } = await supabase.from("customers").select("visits, lifetime_spend, loyalty_points").eq("id", customer.id).single();
      if (cust) {
        const pointsEarned = cart.reduce((sum, item) => sum + (item.loyaltyPoints ?? 0) * item.qty, 0);
        const newPoints = Math.max(0, (cust.loyalty_points ?? 0) - redeemPoints) + pointsEarned;
        await supabase.from("customers").update({
          visits: (cust.visits ?? 0) + 1,
          lifetime_spend: (cust.lifetime_spend ?? 0) + subtotal,
          last_visit_at: new Date().toISOString(),
          loyalty_points: newPoints,
        }).eq("id", customer.id);
      }
    }

    // 5. Generate invoice PDF + WhatsApp
    const pointsEarned = cart.reduce((sum, item) => sum + (item.loyaltyPoints ?? 0) * item.qty, 0);
    const newLoyaltyBalance = Math.max(0, (customerPoints) - redeemPoints) + pointsEarned;
    const invoiceData = {
      invoiceNo: Date.now().toString().slice(-6),
      date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      salonName: salon?.name ?? "Salon",
      salonPhone: salon?.phone ?? null,
      customerName: customer?.name ?? "Guest",
      customerPhone: customer?.phone ?? null,
      stylistName: selectedStylist?.name ?? null,
      items: cart.map((i) => ({ name: i.name, price: i.price, qty: i.qty })),
      subtotal,
      pointsDiscount,
      tax,
      total,
      pointsEarned,
      loyaltyBalance: newLoyaltyBalance,
    };

    const doc = generateInvoicePDF(invoiceData);
    doc.save(`invoice-${invoiceData.invoiceNo}.pdf`);

    if (customer?.phone) {
      const msg = buildWhatsAppMessage(invoiceData);
      const phone = customer.phone.replace(/\D/g, "");
      const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, "_blank");
    }

    setCharging(false);
    toast.success(`Payment of ₹${total.toFixed(2)} received for ${customer?.name ?? "guest"}. Invoice downloaded${customer?.phone ? " & WhatsApp opened." : "."}`);
    setCart([]);
    setSelectedCustomer(null);
    setCustQuery("");
    setNewCust({ name: "", phone: "", email: "" });
    setSelectedStylist(null);
    setStylistQuery("");
    setRedeemPoints(0);
    setCustomerPoints(0);
    refresh();
  };

  const onAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddSvcSaving(true);
    const { error } = await supabase.from("services").insert({
      name: svcForm.name, price: parseFloat(svcForm.price),
      duration_min: parseInt(svcForm.duration_min), description: "",
      loyalty_points: parseInt(svcForm.loyalty_points) || 0,
    });
    setAddSvcSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Service added.");
    setAddSvcOpen(false);
    setSvcForm({ name: "", price: "", duration_min: "0", loyalty_points: "0" });
    refresh();
  };

  const onAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddPkgSaving(true);
    const { error } = await supabase.from("packages").insert({
      name: pkgForm.name,
      price: parseFloat(pkgForm.price),
      sessions_total: parseInt(pkgForm.sessions_total),
      service_names: pkgForm.service_names,
      loyalty_points: parseInt(pkgForm.loyalty_points) || 0,
      salon_id: salon?.id ?? null,
    });
    setAddPkgSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Package added.");
    setAddPkgOpen(false);
    setPkgForm({ name: "", price: "", sessions_total: "5", service_names: "", loyalty_points: "0" });
    refresh();
  };

  const filteredServices = services.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
  const filteredProducts = inventory.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const filteredPackages = packages.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div className="space-y-3">
      {[1,2,3].map(i => <div key={i} className="flex gap-4 py-3 border-b border-border/30 animate-pulse"><div className="h-4 bg-muted rounded w-1/4"/><div className="h-4 bg-muted rounded w-1/4"/><div className="h-4 bg-muted rounded w-1/4"/></div>)}
    </div>
  );

  return (
    <div className="grid lg:grid-cols-3 gap-6 animate-fade-in">
      {/* ── Catalog ── */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl text-foreground">Quick billing</h2>
            <p className="text-sm text-muted-foreground">Select services & products, then charge.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setAddPkgOpen(true)}><Plus className="h-4 w-4" /> Add package</Button>
            <Button variant="hero" onClick={() => setAddSvcOpen(true)}><Plus className="h-4 w-4" /> Add service</Button>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search services or products…" className="pl-9 bg-surface" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <Tabs defaultValue="services">
            <TabsList>
              <TabsTrigger value="services" className="gap-1.5"><Scissors className="h-3.5 w-3.5" /> Services</TabsTrigger>
              <TabsTrigger value="products" className="gap-1.5"><ShoppingBag className="h-3.5 w-3.5" /> Products</TabsTrigger>
              <TabsTrigger value="packages" className="gap-1.5"><Gift className="h-3.5 w-3.5" /> Packages</TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="mt-3">
              {filteredServices.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No services found.</p>}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {filteredServices.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => addToCart({ id: s.id, name: s.name, price: s.price, type: "service", loyaltyPoints: s.loyalty_points ?? 0 })}
                    className="text-left rounded-lg border border-border bg-surface hover:border-primary/40 hover:bg-primary/5 p-3 transition-all"
                  >
                    <div className="text-sm text-foreground font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s.duration_min} min</div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-sm text-primary font-display">₹{s.price}</div>
                      {(s.loyalty_points ?? 0) > 0 && <div className="text-xs text-success">+{s.loyalty_points} pts</div>}
                    </div>
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="products" className="mt-3">
              {filteredProducts.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No products found.</p>}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    disabled={p.stock === 0}
                    onClick={() => addToCart({ id: p.id, name: p.name, price: p.unit_cost, type: "product", inventoryId: p.id })}
                    className="text-left rounded-lg border border-border bg-surface hover:border-primary/40 hover:bg-primary/5 p-3 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <div className="text-sm text-foreground font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Stock: {p.stock}</div>
                    <div className="text-sm text-primary mt-1 font-display">₹{p.unit_cost}</div>
                    {p.stock === 0 && <Badge variant="outline" className="text-[10px] border-destructive/40 text-destructive mt-1">Out of stock</Badge>}
                  </button>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="packages" className="mt-3">
              {filteredPackages.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No packages yet. Click "Add package" to create one.</p>}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {filteredPackages.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => addToCart({ id: pkg.id, name: pkg.name, price: pkg.price, type: "package", sessionsTotal: pkg.sessions_total, loyaltyPoints: pkg.loyalty_points ?? 0 })}
                    className="text-left rounded-lg border border-border bg-surface hover:border-primary/40 hover:bg-primary/5 p-3 transition-all"
                  >
                    <div className="text-sm text-foreground font-medium">{pkg.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{pkg.service_names}</div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-sm text-primary font-display">₹{pkg.price}</div>
                      <div className="text-xs text-muted-foreground">{pkg.sessions_total} sessions</div>
                    </div>
                    {(pkg.loyalty_points ?? 0) > 0 && <div className="text-xs text-success mt-0.5">+{pkg.loyalty_points} pts</div>}
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ── Order panel ── */}
      <aside className="glass-card rounded-xl p-6 space-y-5 h-fit sticky top-20">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl text-foreground">Order</h3>
          <Receipt className="h-4 w-4 text-primary" />
        </div>

        {/* Cart items */}
        <div className="space-y-2 max-h-52 overflow-y-auto">
          {cart.length === 0 && <p className="text-sm text-muted-foreground">Add items from the catalog.</p>}
          {cart.map((item) => (
            <div key={item.lineId} className="flex items-center gap-2 text-sm">
              <div className="flex-1 min-w-0">
                <div className="text-foreground truncate">{item.name}</div>
                <div className="text-xs text-muted-foreground">₹{item.price} × {item.qty} = ₹{(item.price * item.qty).toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => updateQty(item.lineId, -1)} className="h-5 w-5 rounded border border-border flex items-center justify-center hover:bg-surface text-muted-foreground hover:text-foreground">
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-5 text-center text-xs">{item.qty}</span>
                <button onClick={() => updateQty(item.lineId, 1)} className="h-5 w-5 rounded border border-border flex items-center justify-center hover:bg-surface text-muted-foreground hover:text-foreground">
                  <Plus className="h-3 w-3" />
                </button>
                <button onClick={() => setCart((p) => p.filter((x) => x.lineId !== item.lineId))} className="ml-1 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-border/50 pt-3 space-y-1 text-sm">
          <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
          {pointsDiscount > 0 && <div className="flex justify-between text-success"><span>Points discount</span><span>-₹{pointsDiscountDisplay}</span></div>}
          <div className="flex justify-between text-muted-foreground"><span>Tax (8%)</span><span>₹{tax.toFixed(2)}</span></div>
          <div className="flex justify-between text-foreground text-lg pt-1 font-display"><span>Total</span><span className="text-gradient-gold">₹{total.toFixed(2)}</span></div>
        </div>

        {/* Stylist picker — only when cart has services */}
        {hasServices && (
          <div className="border-t border-border/50 pt-4 space-y-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Scissors className="h-3.5 w-3.5" /> Stylist <span className="text-destructive">*</span>
            </p>
            {selectedStylist ? (
              <div className="flex items-center justify-between glass-card rounded-lg px-3 py-2">
                <div>
                  <p className="text-sm text-foreground font-medium">{selectedStylist.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedStylist.role}</p>
                </div>
                <button onClick={() => { setSelectedStylist(null); setStylistQuery(""); }} className="text-xs text-muted-foreground hover:text-destructive">✕</button>
              </div>
            ) : (
              <div className="relative">
                <Input
                  placeholder="Type stylist name…"
                  className="bg-surface text-sm h-9"
                  value={stylistQuery}
                  onChange={(e) => setStylistQuery(e.target.value)}
                />
                {stylistResults.length > 0 && (
                  <div className="absolute z-10 top-full mt-1 w-full border border-border rounded-lg bg-background shadow-lg overflow-hidden">
                    {stylistResults.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => { setSelectedStylist(s); setStylistQuery(""); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-surface border-b border-border/40 last:border-0"
                      >
                        <span className="text-foreground">{s.name}</span>
                        <span className="text-muted-foreground ml-2 text-xs">{s.role}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Loyalty points redemption — show whenever a customer is selected */}
        {selectedCustomer && (
          <div className="border-t border-border/50 pt-4 space-y-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Gift className="h-3.5 w-3.5" /> Loyalty points
            </p>
            {pointsLoading ? (
              <div className="glass-card rounded-lg px-3 py-2">
                <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
              </div>
            ) : (
              <div className="glass-card rounded-lg px-3 py-2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available</span>
                  <span className="text-primary font-medium">{customerPoints} pts = ₹{(customerPoints * POINTS_VALUE).toFixed(2)}</span>
                </div>
                {customerPoints > 0 ? (
                  <>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={customerPoints}
                        value={redeemPoints}
                        onChange={(e) => setRedeemPoints(parseInt(e.target.value))}
                        className="flex-1 accent-primary"
                      />
                      <span className="text-xs text-foreground w-16 text-right">{redeemPoints} pts</span>
                    </div>
                    {redeemPoints > 0 && <p className="text-xs text-success">Saving ₹{(redeemPoints * POINTS_VALUE).toFixed(2)}</p>}
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">No points available yet.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Customer lookup */}
        <div className="border-t border-border/50 pt-4 space-y-3">
          <p className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" /> Customer <span className="text-destructive">*</span>
            {custError && <span className="text-destructive text-[10px] normal-case tracking-normal ml-auto">Required</span>}
          </p>

          {selectedCustomer ? (
            <div className="flex items-center justify-between glass-card rounded-lg px-3 py-2">
              <div>
                <p className="text-sm text-foreground font-medium">{selectedCustomer.name}</p>
                <p className="text-xs text-muted-foreground">{selectedCustomer.phone ?? "No phone"}</p>
              </div>
              <button onClick={() => { setSelectedCustomer(null); setCustQuery(""); }} className="text-xs text-muted-foreground hover:text-destructive">✕</button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Name or phone…"
                  className={`pl-8 bg-surface text-sm h-9 ${custError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  value={custQuery}
                  onChange={(e) => { setCustQuery(e.target.value); setShowNewCust(false); setCustError(false); }}
                />
              </div>

              {custSearching && <p className="text-xs text-muted-foreground">Searching…</p>}

              {custResults.length > 0 && (
                <div className="border border-border rounded-lg overflow-hidden">
                  {custResults.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedCustomer(c); setCustQuery(""); setCustResults([]); setShowNewCust(false); setCustError(false); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-surface border-b border-border/40 last:border-0"
                    >
                      <span className="text-foreground">{c.name}</span>
                      <span className="text-muted-foreground ml-2 text-xs">{c.phone ?? ""}</span>
                    </button>
                  ))}
                </div>
              )}

              {custQuery.length > 1 && !custSearching && custResults.length === 0 && !showNewCust && (
                <button
                  onClick={() => { setShowNewCust(true); setNewCust((p) => ({ ...p, name: custQuery })); setCustError(false); }}
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  <UserPlus className="h-3.5 w-3.5" /> Register "{custQuery}" as new customer
                </button>
              )}

              {showNewCust && (
                <div className="glass-card rounded-lg p-3 space-y-2 border border-primary/20">
                  <p className="text-xs text-primary font-medium">New customer</p>
                  <Input placeholder="Full name *" className="h-8 text-sm bg-surface" value={newCust.name} onChange={(e) => setNewCust((p) => ({ ...p, name: e.target.value }))} />
                  <Input required placeholder="Phone *" className="h-8 text-sm bg-surface" value={newCust.phone} onChange={(e) => setNewCust((p) => ({ ...p, phone: e.target.value }))} />
                  <Input placeholder="Email" className="h-8 text-sm bg-surface" value={newCust.email} onChange={(e) => setNewCust((p) => ({ ...p, email: e.target.value }))} />
                </div>
              )}
            </div>
          )}
        </div>

        <Button
          variant="hero"
          className="w-full"
          size="lg"
          disabled={charging || cart.length === 0}
          onClick={onCharge}
        >
          {charging ? "Processing…" : `Charge ₹${total.toFixed(2)}`}
        </Button>
      </aside>

      {/* Add service dialog */}
      <Dialog open={addSvcOpen} onOpenChange={setAddSvcOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="font-display text-2xl">Add service</DialogTitle></DialogHeader>
          <form onSubmit={onAddService} className="space-y-4 pt-2">
            <div className="space-y-1.5"><Label>Service name</Label><Input required placeholder="Deep Conditioning" value={svcForm.name} onChange={(e) => setSvcForm((p) => ({ ...p, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Price ₹</Label><Input required type="number" min="0" step="0.01" placeholder="80.00" value={svcForm.price} onChange={(e) => setSvcForm((p) => ({ ...p, price: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Duration (min)</Label><Input type="number" min="0" placeholder="60" value={svcForm.duration_min} onChange={(e) => setSvcForm((p) => ({ ...p, duration_min: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Gift className="h-3.5 w-3.5" /> Loyalty points awarded</Label>
              <Input type="number" min="0" placeholder="0" value={svcForm.loyalty_points} onChange={(e) => setSvcForm((p) => ({ ...p, loyalty_points: e.target.value }))} />
              <p className="text-[11px] text-muted-foreground">Points customer earns when this service is billed. 10 pts = ₹1.</p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setAddSvcOpen(false)}>Cancel</Button>
              <Button type="submit" variant="hero" className="flex-1" disabled={addSvcSaving}>{addSvcSaving ? "Saving…" : "Add service"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add package dialog */}
      <Dialog open={addPkgOpen} onOpenChange={setAddPkgOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="font-display text-2xl">Add package</DialogTitle></DialogHeader>
          <form onSubmit={onAddPackage} className="space-y-4 pt-2">
            <div className="space-y-1.5"><Label>Package name</Label><Input required placeholder="Haircut + Color + Wash" value={pkgForm.name} onChange={(e) => setPkgForm((p) => ({ ...p, name: e.target.value }))} /></div>
            <div className="space-y-1.5">
              <Label>Services included</Label>
              <Input required placeholder="Haircut, Color, Wash" value={pkgForm.service_names} onChange={(e) => setPkgForm((p) => ({ ...p, service_names: e.target.value }))} />
              <p className="text-[11px] text-muted-foreground">Comma-separated list of services in this bundle.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Bundle price ₹</Label><Input required type="number" min="0" step="0.01" placeholder="999" value={pkgForm.price} onChange={(e) => setPkgForm((p) => ({ ...p, price: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Total sessions</Label><Input required type="number" min="1" placeholder="5" value={pkgForm.sessions_total} onChange={(e) => setPkgForm((p) => ({ ...p, sessions_total: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Gift className="h-3.5 w-3.5" /> Loyalty points awarded</Label>
              <Input type="number" min="0" placeholder="0" value={pkgForm.loyalty_points} onChange={(e) => setPkgForm((p) => ({ ...p, loyalty_points: e.target.value }))} />
              <p className="text-[11px] text-muted-foreground">Points customer earns when this package is purchased. 10 pts = ₹1.</p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setAddPkgOpen(false)}>Cancel</Button>
              <Button type="submit" variant="hero" className="flex-1" disabled={addPkgSaving}>{addPkgSaving ? "Saving…" : "Add package"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillingPage;
