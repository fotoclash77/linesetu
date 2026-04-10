import React from "react";
import { LayoutDashboard, Building2, Stethoscope, Clock, IndianRupee, FileText, Search, Bell, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

export function AdminLayout({ children, currentPage }: AdminLayoutProps) {
  const navItems = [
    { name: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, id: "Dashboard" },
    { name: "Clinics", icon: <Building2 className="w-5 h-5" />, id: "Clinics" },
    { name: "Doctors", icon: <Stethoscope className="w-5 h-5" />, id: "Doctors" },
    { name: "Bookings", icon: <Clock className="w-5 h-5" />, id: "BookingMonitor" },
    { name: "Revenue", icon: <IndianRupee className="w-5 h-5" />, id: "Revenue" },
    { name: "Transactions", icon: <FileText className="w-5 h-5" />, id: "Transactions" },
  ];

  const glassStyle = {
    backdropFilter: "blur(12px)",
    background: "rgba(255,255,255,0.8)",
    borderRight: "1px solid rgba(255,255,255,0.8)",
  };

  const headerGlassStyle = {
    backdropFilter: "blur(12px)",
    background: "rgba(255,255,255,0.6)",
    borderBottom: "1px solid rgba(255,255,255,0.8)",
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative font-sans max-w-[1280px] mx-auto shadow-2xl">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-3xl pointer-events-none" />

      {/* Sidebar */}
      <aside 
        style={glassStyle}
        className="w-[240px] h-full flex flex-col z-20 relative shadow-[1px_0_10px_rgba(0,0,0,0.02)]"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
            L
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">LINESETU</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <a
                key={item.name}
                href={`#${item.id}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-white/50 hover:text-foreground"
                }`}
              >
                {item.icon}
                <span className="font-medium text-sm">{item.name}</span>
              </a>
            );
          })}
        </nav>
        
        <div className="p-4 mt-auto">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-white/50">
            <p className="text-xs font-semibold text-primary mb-1">Platform Status</p>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              <span className="text-xs text-muted-foreground">All systems operational</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
        {/* Header */}
        <header style={headerGlassStyle} className="h-16 px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <button className="lg:hidden text-muted-foreground hover:text-foreground">
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                className="w-full pl-9 bg-white/50 border-white/80 focus-visible:ring-primary/20 rounded-xl h-9" 
                placeholder="Search clinics, doctors, or bookings..." 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-white/50">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border border-white"></span>
            </button>
            
            <div className="h-6 w-[1px] bg-border mx-2"></div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium leading-none text-foreground">Admin User</p>
                <p className="text-xs text-muted-foreground mt-0.5">Super Admin</p>
              </div>
              <Avatar className="h-9 w-9 border-2 border-white shadow-sm cursor-pointer">
                <AvatarImage src="https://i.pravatar.cc/150?u=admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-8 pb-12 relative">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}