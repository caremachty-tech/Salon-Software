import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { UserPlus, Scissors, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WalkInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const WalkInModal = ({ open, onOpenChange, onSuccess }: WalkInModalProps) => {
  const { salon } = useAuth();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<{ id: string; name: string; price: number }[]>([]);
  const [staff, setStaff] = useState<{ id: string; name: string }[]>([]);

  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    serviceId: "",
    staffId: "",
  });

  useEffect(() => {
    if (open && salon?.id) {
      Promise.all([
        supabase.from("services").select("id, name, price").eq("salon_id", salon.id),
        supabase.from("staff").select("id, name").eq("salon_id", salon.id),
      ]).then(([servRes, staffRes]) => {
        setServices(servRes.data ?? []);
        setStaff(staffRes.data ?? []);
      });
    }
  }, [open, salon?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salon?.id) return;

    setLoading(true);
    try {
      // 1. Create or find customer
      const { data: customerData, error: custErr } = await supabase
        .from("customers")
        .insert({
          salon_id: salon.id,
          name: formData.customerName,
          phone: formData.phone,
          visits: 1,
        })
        .select()
        .single();

      if (custErr) throw custErr;

      // 2. Create completed appointment for walk-in
      const selectedService = services.find(s => s.id === formData.serviceId);
      
      const { error: apptErr } = await supabase.from("appointments").insert({
        salon_id: salon.id,
        customer_id: customerData.id,
        service_id: formData.serviceId,
        staff_id: formData.staffId,
        scheduled_at: new Date().toISOString(),
        status: "completed",
        total_price: selectedService?.price ?? 0,
        is_walk_in: true,
      });

      if (apptErr) throw apptErr;

      toast.success("Walk-in recorded successfully!");
      onSuccess();
      onOpenChange(false);
      setFormData({ customerName: "", phone: "", serviceId: "", staffId: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to record walk-in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" /> Record Walk-in
          </DialogTitle>
          <DialogDescription>
            Register a customer and their service after a walk-in visit.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cust-name">Customer Name</Label>
            <Input
              id="cust-name"
              required
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cust-phone">Phone Number</Label>
            <Input
              id="cust-phone"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div className="space-y-2">
            <Label>Service Provided</Label>
            <Select 
              value={formData.serviceId} 
              onValueChange={(v) => setFormData({ ...formData, serviceId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name} (${s.price})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Stylist</Label>
            <Select 
              value={formData.staffId} 
              onValueChange={(v) => setFormData({ ...formData, staffId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select stylist" />
              </SelectTrigger>
              <SelectContent>
                {staff.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? "Recording..." : "Complete & Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WalkInModal;
