import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export type Customer = {
  id: string; name: string; visits: number;
  last_visit_at: string | null; lifetime_spend: number;
  tag: "VIP" | "Regular" | "At risk";
  loyalty_points: number;
  phone: string | null;
  email: string | null;
};
export type Package = {
  id: string; name: string; price: number; sessions_total: number;
  service_names: string; loyalty_points: number;
};
export type CustomerPackage = {
  id: string; customer_id: string; package_id: string; sessions_used: number; sessions_total: number;
  packages: { name: string; service_names: string } | null;
};
export type Staff = {
  id: string; name: string; role: string; img_url: string | null;
  rating: number; jobs_count: number; mtd_earnings: number; commission_pct: number;
};
export type Branch = {
  id: string; name: string; city: string;
  staff_count: number; mtd_revenue: number; growth_pct: string;
};
export type Service = { id: string; name: string; price: number; duration_min: number; loyalty_points: number };
export type InventoryItem = {
  id: string; sku: string; name: string;
  stock: number; par_level: number; unit_cost: number;
};
export type Campaign = {
  id: string; name: string; channel: string; audience_count: number;
  status: string; open_rate: string; sent_at: string | null;
};
export type RevenueDay = { id: string; date: string; amount: number };
export type Appointment = {
  id: string; scheduled_at: string; total_price: number; status: string;
  customers: { name: string; phone: string | null; email: string | null } | null;
  services: { name: string; duration_min: number } | null;
  staff: { id: string; name: string } | null;
};

interface DataStore {
  customers: Customer[];
  staff: Staff[];
  branches: Branch[];
  services: Service[];
  inventory: InventoryItem[];
  campaigns: Campaign[];
  revenue: RevenueDay[];
  appointments: Appointment[];
  packages: Package[];
  loading: boolean;
  refresh: () => void;
}

const empty = {
  customers: [], staff: [], branches: [], services: [],
  inventory: [], campaigns: [], revenue: [], appointments: [], packages: [],
};

const DataContext = createContext<DataStore>({
  ...empty, loading: true, refresh: () => {},
});

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [data, setData] = useState(empty);
  const [loading, setLoading] = useState(true);
  const fetchedFor = useRef<string | null>(null);

  const fetchAll = async (userId: string) => {
    setLoading(true);
    const [
      { data: customers },
      { data: staff },
      { data: branches },
      { data: services },
      { data: inventory },
      { data: campaigns },
      { data: revenue },
      { data: appointments },
      { data: packages },
    ] = await Promise.all([
      supabase.from("customers").select("*").order("lifetime_spend", { ascending: false }),
      supabase.from("staff").select("*").order("mtd_earnings", { ascending: false }),
      supabase.from("branches").select("*").order("mtd_revenue", { ascending: false }),
      supabase.from("services").select("id, name, price, duration_min, loyalty_points").order("name"),
      supabase.from("inventory").select("*").order("name"),
      supabase.from("campaigns").select("*").order("created_at", { ascending: false }),
      supabase.from("revenue_daily").select("*").order("date", { ascending: true }).limit(30),
      supabase.from("appointments")
        .select("id, scheduled_at, total_price, status, customers(name, phone, email), services(name, duration_min), staff(id, name)")
        .order("scheduled_at", { ascending: false })
        .limit(500),
      supabase.from("packages").select("id, name, price, sessions_total, service_names, loyalty_points").order("name"),
    ]);

    setData({
      customers: (customers ?? []) as Customer[],
      staff: (staff ?? []) as Staff[],
      branches: (branches ?? []) as Branch[],
      services: (services ?? []) as Service[],
      inventory: (inventory ?? []) as InventoryItem[],
      campaigns: (campaigns ?? []) as Campaign[],
      revenue: (revenue ?? []) as RevenueDay[],
      appointments: (appointments ?? []) as unknown as Appointment[],
      packages: (packages ?? []) as Package[],
    });
    setLoading(false);
  };

  useEffect(() => {
    if (!user?.id) {
      fetchedFor.current = null;
      setData(empty);
      setLoading(true);
      return;
    }

    if (fetchedFor.current === user.id) return;
    fetchedFor.current = user.id;
    fetchAll(user.id);

    // Real-time: re-fetch appointments whenever any row is inserted/updated
    const channel = supabase
      .channel("appointments-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => {
        fetchAll(user.id);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const refresh = () => {
    if (!user?.id) return;
    fetchedFor.current = null; // allow re-fetch
    fetchedFor.current = user.id;
    fetchAll(user.id);
  };

  return (
    <DataContext.Provider value={{ ...data, loading, refresh }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
