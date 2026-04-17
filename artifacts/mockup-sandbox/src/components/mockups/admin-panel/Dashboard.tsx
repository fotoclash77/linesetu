import React from "react";
import { AdminLayout } from "./_shared/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Stethoscope, Clock, IndianRupee, TrendingUp, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function Dashboard() {
  const glassCardStyle = {
    backdropFilter: "blur(12px)",
    background: "rgba(255,255,255,0.7)",
    border: "1px solid rgba(255,255,255,0.8)",
    boxShadow: "0 8px 32px rgba(31,38,135,0.04)"
  };

  const metrics = [
    { title: "Total Clinics", value: "48", icon: <Building2 className="w-5 h-5 text-primary" />, trend: "+12%", positive: true },
    { title: "Active Doctors", value: "124", icon: <Stethoscope className="w-5 h-5 text-accent" />, trend: "+5%", positive: true },
    { title: "Today's Bookings", value: "892", icon: <Clock className="w-5 h-5 text-secondary" />, trend: "-2%", positive: false },
    { title: "Platform Revenue", value: "₹8,920", icon: <IndianRupee className="w-5 h-5 text-primary" />, trend: "+18%", positive: true },
  ];

  const recentTransactions = [
    { id: "TXN-001", patient: "Rahul Sharma", amount: "₹10", time: "2 mins ago", status: "Success" },
    { id: "TXN-002", patient: "Priya Singh", amount: "₹10", time: "15 mins ago", status: "Success" },
    { id: "TXN-003", patient: "Amit Patel", amount: "₹10", time: "1 hour ago", status: "Pending" },
    { id: "TXN-004", patient: "Neha Gupta", amount: "₹10", time: "2 hours ago", status: "Success" },
    { id: "TXN-005", patient: "Vikram Reddy", amount: "₹10", time: "3 hours ago", status: "Failed" },
  ];

  return (
    <AdminLayout currentPage="Dashboard">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome back. Here's what's happening on LINESETU today.</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, idx) => (
            <Card key={idx} style={glassCardStyle} className="rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{metric.title}</p>
                    <h3 className="text-3xl font-bold tracking-tight text-foreground">{metric.value}</h3>
                  </div>
                  <div className="p-3 bg-white rounded-xl shadow-sm border border-border/50">
                    {metric.icon}
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className={`flex items-center font-medium ${metric.positive ? 'text-secondary' : 'text-destructive'}`}>
                    {metric.positive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                    {metric.trend}
                  </span>
                  <span className="text-muted-foreground ml-2">vs last week</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card style={glassCardStyle} className="rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Weekly Bookings Trend</h3>
                    <p className="text-sm text-muted-foreground">Tokens generated across all clinics</p>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">This Week</Badge>
                </div>
                
                {/* SVG Area Chart Placeholder */}
                <div className="h-[280px] w-full relative flex items-end pt-8">
                  {/* Y-axis grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pt-8 pb-[20px] pointer-events-none">
                    <div className="w-full border-t border-border/50 border-dashed"></div>
                    <div className="w-full border-t border-border/50 border-dashed"></div>
                    <div className="w-full border-t border-border/50 border-dashed"></div>
                    <div className="w-full border-t border-border/50 border-dashed"></div>
                  </div>
                  
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 bottom-[20px] flex flex-col justify-between pt-6 text-[10px] text-muted-foreground">
                    <span>1000</span>
                    <span>750</span>
                    <span>500</span>
                    <span>250</span>
                    <span>0</span>
                  </div>

                  {/* Chart Bars - Simulated area chart using divs */}
                  <div className="w-full h-full flex items-end justify-between px-8 z-10 relative">
                    {[120, 240, 480, 892, 560, 320, 400].map((height, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 group w-full px-2">
                        <div 
                          className="w-full max-w-[40px] bg-gradient-to-t from-primary/80 to-accent/80 rounded-t-sm transition-all duration-500 group-hover:from-primary group-hover:to-accent"
                          style={{ height: `${(height / 1000) * 100}%` }}
                        ></div>
                        <span className="text-xs text-muted-foreground">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card style={glassCardStyle} className="rounded-2xl">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-4 rounded-full bg-accent/10">
                    <Clock className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Peak Booking Hour</p>
                    <h4 className="text-xl font-bold text-foreground">10:00 - 11:00 AM</h4>
                  </div>
                </CardContent>
              </Card>
              <Card style={glassCardStyle} className="rounded-2xl">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Most Active Clinic</p>
                    <h4 className="text-xl font-bold text-foreground">Apollo Delhi</h4>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Activity Feed Section */}
          <div className="lg:col-span-1">
            <Card style={glassCardStyle} className="rounded-2xl h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
                  <button className="text-sm text-primary font-medium hover:underline">View all</button>
                </div>
                
                <div className="space-y-6">
                  {recentTransactions.map((txn, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-border shrink-0 shadow-sm">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {txn.patient.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {txn.patient} booked a token
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground mt-1 gap-2">
                          <span>{txn.time}</span>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                          <span>Fee: {txn.amount}</span>
                        </div>
                      </div>
                      <div>
                        <Badge variant={txn.status === "Success" ? "secondary" : txn.status === "Pending" ? "outline" : "destructive"} className="text-[10px] px-1.5 py-0">
                          {txn.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}