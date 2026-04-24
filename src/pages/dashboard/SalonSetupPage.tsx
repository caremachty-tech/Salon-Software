import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Building2, Phone, Mail, MapPin, Upload } from "lucide-react";

const SalonSetupPage = () => {
  const { user, refreshAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    logo_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("salons").upsert({
        owner_id: user.id,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        logo_url: formData.logo_url,
        is_profile_complete: true,
      });

      if (error) throw error;

      toast.success("Salon profile completed successfully!");
      await refreshAuth();
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to save salon profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card rounded-2xl p-8 space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="h-16 w-16 bg-primary/10 rounded-2xl grid place-items-center mx-auto mb-4 border border-primary/20">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl text-foreground">Setup your Salon</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Complete your business profile to access the dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Salon Name</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                required
                className="pl-10"
                placeholder="Mane Magic Studio"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  required
                  className="pl-10"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Business Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  className="pl-10"
                  placeholder="hello@salon.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Physical Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="address"
                required
                className="pl-10 min-h-[100px]"
                placeholder="123 Beauty Lane, Style City, SC 12345"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Salon Logo</Label>
            <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors cursor-pointer bg-surface/50 group">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2 group-hover:text-primary transition-colors" />
              <p className="text-xs text-muted-foreground">
                Logo upload functionality will be connected to Supabase Storage.
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full" variant="hero" disabled={loading}>
            {loading ? "Saving..." : "Complete Setup"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SalonSetupPage;
