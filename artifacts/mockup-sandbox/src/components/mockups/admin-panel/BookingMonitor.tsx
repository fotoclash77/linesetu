import React from "react";
import { AdminLayout } from "./_shared/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Calendar, Activity, Building2, User, Clock } from "lucide-react";

export function BookingMonitor() {
  const glassStyle = {
    backdropFilter: "blur(12px)",
    background: "rgba(255,255,255,0.7)",
    border: "1px solid rgba(255,255,255,0.8)",
    boxShadow: "0 8px 32px rgba(31,38,135,0.04)"
  };

  const statusColors: Record<string, string> = {
    "Active": "bg-primary/10 text-primary border-primary/20",
    "Completed": "bg-secondary/15 text-secondary border-secondary/20",
    "Cancelled": "bg-destructive/10 text-destructive border-destructive/20",
    "In Queue": "bg-amber-500/10 text-amber-600 border-amber-500/20"
  };

  const bookings = [
    { token: "T-042", patient: "Rahul Sharma", doc: "Dr. Ananya Sharma", clinic: "Apollo Delhi", time: "10:15 AM", status: "Active", fee: "₹10" },
    { token: "T-043", patient: "Priya Singh", doc: "Dr. Rajesh Kumar", clinic: "CareWell", time: "10:20 AM", status: "In Queue", fee: "₹10" },
    { token: "T-040", patient: "Amit Patel", doc: "Dr. Sneha Desai", clinic: "City Health", time: "09:45 AM", status: "Completed", fee: "₹10" },
    { token: "T-044", patient: "Neha Gupta", doc: "Dr. Ananya Sharma", clinic: "Apollo Delhi", time: "10:25 AM", status: "In Queue", fee: "₹10" },
    { token: "T-041", patient: "Vikram Reddy", doc: "Dr. Rajesh Kumar", clinic: "CareWell", time: "09:50 AM", status: "Cancelled", fee: "₹10" },
    { token: "T-045", patient: "Sanjay Mishra", doc: "Dr. Pooja Mehta", clinic: "Apollo Delhi", time: "10:30 AM", status: "In Queue", fee: "₹10" },
    { token: "T-039", patient: "Kavita Jain", doc: "Dr. Rahul Verma", clinic: "Niramay", time: "09:30 AM", status: "Completed", fee: "₹10" },
    { token: "T-046", patient: "Arjun Das", doc: "Dr. Sneha Desai", clinic: "City Health", time: "10:45 AM", status: "In Queue", fee: "₹10" },
  ];

  return (
    <AdminLayout currentPage="BookingMonitor">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            Booking Monitor
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
            </span>
          </h1>
          <p className="text-muted-foreground mt-1">Live tracking of token generation and queue status across all clinics.</p>
        </div>

        {/* Live Metrics Strip */}
        <div className="flex flex-wrap gap-4">
          <Card style={{...glassStyle, background: "rgba(79, 70, 229, 0.05)", border: "1px solid rgba(79, 70, 229, 0.2)"}} className="rounded-xl flex-1 min-w-[200px]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary/80">Live Now</p>
                <h4 className="text-2xl font-bold text-primary">47 Active Queues</h4>
              </div>
            </CardContent>
          </Card>
          <Card style={glassStyle} className="rounded-xl flex-1 min-w-[200px]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-white/60 rounded-lg">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Patients Waiting</p>
                <h4 className="text-2xl font-bold text-foreground">184</h4>
              </div>
            </CardContent>
          </Card>
          <Card style={glassStyle} className="rounded-xl flex-1 min-w-[200px]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <Activity className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Wait Time</p>
                <h4 className="text-2xl font-bold text-foreground">24 mins</h4>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card style={glassStyle} className="rounded-2xl border-none">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                className="w-full pl-9 bg-white/50 border-white/80 rounded-xl" 
                placeholder="Search token or patient..." 
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <Button variant="outline" className="rounded-xl bg-white/50 h-9">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                Today
              </Button>
              <Button variant="outline" className="rounded-xl bg-white/50 h-9">
                <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                All Clinics
              </Button>
              <div className="flex bg-white/40 p-1 rounded-xl border border-white/80 ml-2">
                {["All", "Active", "Completed", "Cancelled"].map((tab) => (
                  <button 
                    key={tab}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${tab === "All" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table Area */}
        <Card style={glassStyle} className="rounded-2xl overflow-hidden border-none">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/40">
                <TableRow className="border-border/50">
                  <TableHead className="font-semibold text-foreground py-4 pl-6">Token / Time</TableHead>
                  <TableHead className="font-semibold text-foreground">Patient</TableHead>
                  <TableHead className="font-semibold text-foreground">Doctor</TableHead>
                  <TableHead className="font-semibold text-foreground">Clinic</TableHead>
                  <TableHead className="font-semibold text-foreground">Platform Fee</TableHead>
                  <TableHead className="font-semibold text-foreground pr-6 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking, idx) => (
                  <TableRow key={idx} className="border-border/30 hover:bg-white/40 transition-colors">
                    <TableCell className="py-3 pl-6">
                      <div className="font-bold text-foreground font-mono bg-white/50 inline-block px-2 py-1 rounded-md border border-border/50">
                        {booking.token}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> {booking.time}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{booking.patient}</TableCell>
                    <TableCell className="text-muted-foreground">{booking.doc}</TableCell>
                    <TableCell className="text-muted-foreground">{booking.clinic}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono bg-white text-muted-foreground">{booking.fee}</Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Badge variant="outline" className={`${statusColors[booking.status]}`}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="p-4 border-t border-border/30 bg-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div>Showing live bookings for Today</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-lg h-8 bg-white/50" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="rounded-lg h-8 bg-white/50">Next</Button>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}