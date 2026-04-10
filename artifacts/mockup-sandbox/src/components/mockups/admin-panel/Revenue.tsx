import React from "react";
import { AdminLayout } from "./_shared/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IndianRupee, TrendingUp, Calendar, ArrowUpRight, Download, CreditCard, Banknote } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function Revenue() {
  const glassStyle = {
    backdropFilter: "blur(12px)",
    background: "rgba(255,255,255,0.7)",
    border: "1px solid rgba(255,255,255,0.8)",
    boxShadow: "0 8px 32px rgba(31,38,135,0.04)"
  };

  const cards = [
    { title: "Total Revenue", amount: "₹1,24,890", subtitle: "All time platform fees", icon: <Banknote className="w-5 h-5 text-primary" /> },
    { title: "This Month", amount: "₹28,430", subtitle: "+14% vs last month", icon: <TrendingUp className="w-5 h-5 text-secondary" />, highlight: true },
    { title: "This Week", amount: "₹7,120", subtitle: "Mon - Sun", icon: <Calendar className="w-5 h-5 text-accent" /> },
    { title: "Today", amount: "₹892", subtitle: "89 bookings", icon: <IndianRupee className="w-5 h-5 text-primary" /> },
  ];

  const payouts = [
    { date: "May 10, 2024", clinic: "Apollo Clinics Delhi", amount: "₹12,400", type: "Settlement", status: "Completed", txId: "SET-8912" },
    { date: "May 10, 2024", clinic: "City Health Center", amount: "₹8,250", type: "Settlement", status: "Completed", txId: "SET-8913" },
    { date: "May 09, 2024", clinic: "CareWell Hospital", amount: "₹5,100", type: "Settlement", status: "Processing", txId: "SET-8890" },
    { date: "May 08, 2024", clinic: "MediLife Care", amount: "₹3,420", type: "Settlement", status: "Completed", txId: "SET-8854" },
  ];

  // SVG Chart Data
  const monthlyData = [45, 60, 80, 55, 90, 110, 85, 120, 100, 130, 140, 160];
  const maxMonthly = Math.max(...monthlyData);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const pieData = [
    { clinic: "Apollo Delhi", val: 40, color: "bg-primary" },
    { clinic: "City Health", val: 25, color: "bg-accent" },
    { clinic: "CareWell", val: 20, color: "bg-secondary" },
    { clinic: "Others", val: 15, color: "bg-muted-foreground" },
  ];

  return (
    <AdminLayout currentPage="Revenue">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Revenue Dashboard</h1>
            <p className="text-muted-foreground mt-1">Platform fee collection and financial analytics.</p>
          </div>
          <Button variant="outline" className="rounded-xl bg-white/50 backdrop-blur-sm" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, idx) => (
            <Card key={idx} style={glassStyle} className="rounded-2xl border-none">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-white rounded-xl shadow-sm border border-border/50 shrink-0">
                    {card.icon}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-muted-foreground mb-1">{card.title}</p>
                    <h3 className="text-2xl font-bold text-foreground font-mono tracking-tight">{card.amount}</h3>
                  </div>
                </div>
                <p className={`text-xs mt-4 font-medium ${card.highlight ? 'text-secondary flex items-center justify-end' : 'text-muted-foreground text-right'}`}>
                  {card.highlight && <ArrowUpRight className="w-3 h-3 mr-1" />}
                  {card.subtitle}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2">
            <Card style={glassStyle} className="rounded-2xl border-none h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-semibold text-foreground">Monthly Revenue Growth</h3>
                  <Badge variant="outline" className="bg-white/50">2024</Badge>
                </div>
                
                <div className="flex-1 min-h-[250px] w-full flex items-end justify-between gap-2 relative z-10 pt-6">
                  {/* Y Axis grid */}
                  <div className="absolute inset-0 flex flex-col justify-between pb-6 pointer-events-none z-0">
                    <div className="w-full border-t border-border/50 border-dashed"></div>
                    <div className="w-full border-t border-border/50 border-dashed"></div>
                    <div className="w-full border-t border-border/50 border-dashed"></div>
                    <div className="w-full border-t border-border/50 border-dashed"></div>
                    <div className="w-full border-t border-border/50 border-dashed"></div>
                  </div>
                  
                  {/* Bars */}
                  {monthlyData.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full z-10 group relative">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-xs py-1 px-2 rounded font-mono font-medium pointer-events-none whitespace-nowrap shadow-lg">
                        ₹{val}K
                      </div>
                      
                      <div 
                        className="w-full max-w-[32px] bg-primary/80 rounded-t-md hover:bg-primary transition-colors cursor-pointer"
                        style={{ height: `${(val / maxMonthly) * 100}%` }}
                      ></div>
                      <span className="text-[10px] sm:text-xs text-muted-foreground mt-3 font-medium">{months[i]}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pie Chart / Breakdown */}
          <div className="lg:col-span-1">
            <Card style={glassStyle} className="rounded-2xl border-none h-full">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">Revenue by Clinic</h3>
                
                {/* SVG Donut Chart Placeholder */}
                <div className="relative w-48 h-48 mx-auto my-6">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="20" />
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="150" className="text-primary" />
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="200" className="text-accent" transform="rotate(144 50 50)" />
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="200" className="text-secondary" transform="rotate(234 50 50)" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-sm text-muted-foreground font-medium">Top</span>
                    <span className="text-xl font-bold">Apollo</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {pieData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <span className="text-sm font-medium text-foreground">{item.clinic}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{item.val}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payouts Table */}
        <Card style={glassStyle} className="rounded-2xl border-none overflow-hidden">
          <div className="p-6 pb-0 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Recent Clinic Payouts</h3>
            <Button variant="link" className="text-primary h-auto p-0">View all</Button>
          </div>
          <div className="p-0 mt-4 overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/40">
                <TableRow className="border-border/50">
                  <TableHead className="py-4 pl-6 font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Clinic</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Amount</TableHead>
                  <TableHead className="font-semibold">TxID</TableHead>
                  <TableHead className="pr-6 text-right font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((row, i) => (
                  <TableRow key={i} className="border-border/30 hover:bg-white/40">
                    <TableCell className="py-4 pl-6 text-muted-foreground">{row.date}</TableCell>
                    <TableCell className="font-medium text-foreground">{row.clinic}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <CreditCard className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                        {row.type}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono font-medium">{row.amount}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px] bg-white/50">{row.txId}</Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Badge variant={row.status === "Completed" ? "secondary" : "outline"} className={row.status === "Completed" ? "bg-secondary/10 text-secondary border-secondary/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}>
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}