import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Building2, Clock, Scissors, User, Calendar as CalendarIcon, ChevronRight, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

type Salon = { id: string; name: string; address: string; logo_url: string | null };
type Service = { id: string; name: string; price: number; duration_min: number };
type Staff = { id: string; name: string; role: string };

const Book = () => {
  const [step, setStep] = useState(1);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [customerInfo, setCustomerInfo] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    supabase.from("salons").select("id, name, address, logo_url").eq("is_profile_complete", true)
      .then(({ data }) => setSalons(data ?? []));
  }, []);

  const fetchSalonData = async (salonId: string) => {
    const [servRes, staffRes] = await Promise.all([
      supabase.from("services").select("id, name, price, duration_min").eq("salon_id", salonId),
      supabase.from("staff").select("id, name, role").eq("salon_id", salonId),
    ]);
    // Fallback: if salon_id filter returns nothing, load all (handles unseeded salon_id)
    const svcData = servRes.data?.length ? servRes.data : (await supabase.from("services").select("id, name, price, duration_min")).data ?? [];
    const staffData = staffRes.data?.length ? staffRes.data : (await supabase.from("staff").select("id, name, role")).data ?? [];
    setServices(svcData as Service[]);
    setStaff(staffData as Staff[]);
  };

  const handleSalonSelect = (salon: Salon) => {
    setSelectedSalon(salon);
    fetchSalonData(salon.id);
    setStep(2);
  };

  const handleBooking = async () => {
    if (!selectedSalon || !selectedService || !selectedStaff || !selectedDate || !selectedTime) {
      toast.error("Please complete all steps before confirming.");
      return;
    }
    if (!customerInfo.name || !customerInfo.phone) {
      toast.error("Name and phone number are required.");
      return;
    }

    try {
      let customerId: string | null = null;

      // Find existing customer by email if provided
      if (customerInfo.email) {
        const { data: existing } = await supabase
          .from("customers")
          .select("id")
          .eq("email", customerInfo.email)
          .eq("salon_id", selectedSalon.id)
          .maybeSingle();
        customerId = existing?.id ?? null;
      }

      // Create new customer if not found
      if (!customerId) {
        const { data: newCustomer, error: custErr } = await supabase
          .from("customers")
          .insert({
            salon_id: selectedSalon.id,
            name: customerInfo.name,
            email: customerInfo.email || null,
            phone: customerInfo.phone,
            tag: "Regular",
            visits: 0,
            lifetime_spend: 0,
          })
          .select("id")
          .single();
        if (custErr) throw custErr;
        customerId = newCustomer.id;
      }

      // Build scheduled datetime
      const scheduledAt = new Date(selectedDate);
      const [hrs, mins] = selectedTime.split(":");
      scheduledAt.setHours(parseInt(hrs), parseInt(mins), 0, 0);

      const { error: apptErr } = await supabase.from("appointments").insert({
        salon_id: selectedSalon.id,
        customer_id: customerId,
        staff_id: selectedStaff.id,
        service_id: selectedService.id,
        scheduled_at: scheduledAt.toISOString(),
        total_price: selectedService.price,
        status: "confirmed",
      });

      if (apptErr) throw apptErr;

      setStep(5);
      toast.success("Appointment booked successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to book appointment");
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="font-display text-4xl text-foreground">Book an Appointment</h1>
          <p className="text-muted-foreground mt-2">Intuitive booking for your favorite salons.</p>
        </div>

        {/* Progress Stepper */}
        <div className="flex justify-between items-center max-w-md mx-auto mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center">
              <div className={`h-8 w-8 rounded-full border-2 grid place-items-center text-sm font-medium transition-colors ${step >= i ? "bg-primary border-primary text-primary-foreground" : "border-border text-muted-foreground"}`}>
                {i}
              </div>
              {i < 4 && <div className={`w-12 h-0.5 mx-2 ${step > i ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="grid md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
            {salons.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSalonSelect(s)}
                className="glass-card p-6 text-left hover:border-primary/40 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-primary/10 rounded-xl grid place-items-center border border-primary/20 shrink-0">
                    {s.logo_url ? <img src={s.logo_url} alt={s.name} className="h-full w-full object-cover rounded-xl" /> : <Building2 className="h-8 w-8 text-primary" />}
                  </div>
                  <div>
                    <h3 className="font-display text-xl text-foreground">{s.name}</h3>
                    <p className="text-sm text-muted-foreground">{s.address}</p>
                  </div>
                  <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Services */}
              <div className="space-y-3">
                <h2 className="font-display text-2xl flex items-center gap-2"><Scissors className="h-5 w-5" /> Select Service</h2>
                {services.length === 0 && (
                  <p className="text-sm text-muted-foreground glass-card p-4 rounded-xl">No services available for this salon yet.</p>
                )}
                <div className="grid gap-3">
                  {services.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedService(s)}
                      className={`glass-card p-4 text-left border transition-all ${selectedService?.id === s.id ? "border-primary bg-primary/5" : "hover:border-primary/30"}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-muted-foreground">{s.duration_min} mins</div>
                        </div>
                        <div className="text-primary font-display">₹{s.price}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stylists */}
              <div className="space-y-3">
                <h2 className="font-display text-2xl flex items-center gap-2"><User className="h-5 w-5" /> Select Stylist</h2>
                {staff.length === 0 && (
                  <p className="text-sm text-muted-foreground glass-card p-4 rounded-xl">No stylists available for this salon yet.</p>
                )}
                <div className="grid gap-3">
                  {staff.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStaff(s)}
                      className={`glass-card p-4 text-left border transition-all ${selectedStaff?.id === s.id ? "border-primary bg-primary/5" : "hover:border-primary/30"}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-9 w-9 rounded-full bg-gradient-gold grid place-items-center text-primary-foreground font-semibold shrink-0">{s.name[0]}</span>
                        <div>
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-muted-foreground">{s.role}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button
                variant="hero"
                disabled={!selectedService || !selectedStaff}
                onClick={() => setStep(3)}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="glass-card p-6 rounded-2xl">
                <h2 className="font-display text-2xl flex items-center gap-2 mb-4"><CalendarIcon className="h-5 w-5" /> Date</h2>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border border-border/50 bg-background/50 mx-auto"
                />
              </div>
              <div className="glass-card p-6 rounded-2xl">
                <h2 className="font-display text-2xl flex items-center gap-2 mb-4"><Clock className="h-5 w-5" /> Time</h2>
                <div className="grid grid-cols-3 gap-2">
                  {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map((t) => (
                    <Button
                      key={t}
                      variant={selectedTime === t ? "hero" : "outline"}
                      onClick={() => setSelectedTime(t)}
                    >
                      {t}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button variant="hero" disabled={!selectedDate || !selectedTime} onClick={() => setStep(4)}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h2 className="font-display text-2xl">Your Details</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Full Name *"
                  required
                  className="w-full bg-surface border border-border rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="Email Address (optional)"
                  className="w-full bg-surface border border-border rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  required
                  className="w-full bg-surface border border-border rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                />
              </div>
            </div>
            
            <div className="glass-card p-6 rounded-2xl bg-primary/5 border-primary/20 space-y-3">
              <h3 className="font-display text-xl">Booking Summary</h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between"><span>Salon</span><span className="font-medium">{selectedSalon?.name}</span></div>
                <div className="flex justify-between"><span>Service</span><span className="font-medium">{selectedService?.name}</span></div>
                <div className="flex justify-between"><span>Stylist</span><span className="font-medium">{selectedStaff?.name}</span></div>
                <div className="flex justify-between"><span>Time</span><span className="font-medium">{selectedDate && format(selectedDate, "MMM d")} at {selectedTime}</span></div>
              </div>
              <div className="pt-2 border-t border-primary/20 flex justify-between font-display text-lg">
                <span>Total</span>
                <span className="text-gradient-gold">₹{selectedService?.price}</span>
              </div>
            </div>

            <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
            <Button
              onClick={handleBooking}
              className="w-full"
              variant="hero"
              size="lg"
              disabled={!customerInfo.name || !customerInfo.phone}
            >
              Confirm Booking
            </Button>
          </div>
        )}

        {step === 5 && (
          <div className="max-w-md mx-auto text-center space-y-6 py-12 animate-in zoom-in">
            <CheckCircle2 className="h-20 w-20 text-success mx-auto" />
            <h2 className="font-display text-4xl">Booking Confirmed!</h2>
            <p className="text-muted-foreground">
              Thank you, {customerInfo.name}. We've sent a confirmation to {customerInfo.email}.
            </p>
            <Button onClick={() => setStep(1)} variant="outline" className="w-full">Book Another Appointment</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Book;
