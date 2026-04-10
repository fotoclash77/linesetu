import React from "react";
import { AdminLayout } from "./_shared/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Calendar, Filter, Building2, ExternalLink } from "lucide-react";

export function Transactions() {
  const glassStyle = {
    backdropFilter: "blur(12px)",
    background: "rgba(255,255,255,0.7)",
    border: "1px solid rgba(255,255,255,0.8)",
    boxShadow: "0 8px 32px rgba(31,38,135,0.04)"
  };

  const txns = [
    { id: "TXN-89012", patient: "Rahul Sharma", doctor: "Dr. Ananya Sharma", clinic: "Apollo Delhi", method: "UPI (PhonePe)", time: "10:15 AM, May 12", status: "Success" },
    { id: "TXN-89011", patient: "Priya Singh", doctor: "Dr. Rajesh Kumar", clinic: "CareWell Hospital", method: "Credit Card", time: "10:02 AM, May 12", status: "Success" },
    { id: "TXN-89010", patient: "Amit Patel", doctor: "Dr. Sneha Desai", clinic: "City Health", method: "UPI (GPay)", time: "09:45 AM, May 12", status: "Success" },
    { id: "TXN-89009", patient: "Neha Gupta", doctor: "Dr. Ananya Sharma", clinic: "Apollo Delhi", method: "Net Banking", time: "09:30 AM, May 12", status: "Failed" },
    { id: "TXN-89008", patient: "Vikram Reddy", doctor: "Dr. Rajesh Kumar", clinic: "CareWell Hospital", method: "UPI (Paytm)", time: "09:15 AM, May 12", status: "Success" },
    { id: "TXN-89007", patient: "Sanjay Mishra", doctor: "Dr. Pooja Mehta", clinic: "Apollo Delhi", method: "Debit Card", time: "08:50 AM, May 12", status: "Pending" },
    { id: "TXN-89006", patient: "Kavita Jain", doctor: "Dr. Rahul Verma", clinic: "Niramay Clinic", method: "UPI (PhonePe)", time: "08:30 AM, May 12", status: "Success" },
    { id: "TXN-89005", patient: "Arjun Das", doctor: "Dr. Sneha Desai", clinic: "City Health", method: "UPI (GPay)", time: "08:15 AM, May 12", status: "Success" },
    { id: "TXN-89004", patient: "Meera Nair", doctor: "Dr. Vikram Singh", clinic: "MediLife Care", method: "Credit Card", time: "18:45 PM, May 11", status: "Success" },
    { id: "TXN-89003", patient: "Karan Johar", doctor: "Dr. Pooja Mehta", clinic: "Apollo Delhi", method: "UPI (Paytm)", time: "18:20 PM, May 11", status: "Failed" },
  ];

  return (
    <AdminLayout currentPage="Transactions">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Transactions</h1>
            <p className="text-muted-foreground mt-1">View all token fee payments (₹10) across the platform.</p>
          </div>
          <Button className="rounded-xl shadow-md bg-white hover:bg-white/90 text-foreground border border-border" size="lg">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card style={glassStyle} className="rounded-2xl border-none">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                className="w-full pl-9 bg-white/50 border-white/80 rounded-xl" 
                placeholder="Search by Transaction ID, Patient..." 
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <Button variant="outline" className="rounded-xl bg-white/50 whitespace-nowrap">
                <Calendar className="w-4 h-4 mr-2" />
                Date Range
              </Button>
              <Button variant="outline" className="rounded-xl bg-white/50 whitespace-nowrap">
                <Building2 className="w-4 h-4 mr-2" />
                Clinic
              </Button>
              <Button variant="outline" className="rounded-xl bg-white/50 whitespace-nowrap">
                <Filter className="w-4 h-4 mr-2" />
                Status
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table Area */}
        <Card style={glassStyle} className="rounded-2xl overflow-hidden border-none shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/60 backdrop-blur-md">
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="font-semibold text-foreground py-4 pl-6">Transaction ID</TableHead>
                  <TableHead className="font-semibold text-foreground">User Details</TableHead>
                  <TableHead className="font-semibold text-foreground">Payment Info</TableHead>
                  <TableHead className="font-semibold text-foreground">Date & Time</TableHead>
                  <TableHead className="font-semibold text-foreground text-right pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {txns.map((txn, idx) => (
                  <TableRow key={idx} className="border-border/30 hover:bg-white/50 transition-colors">
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-2 group cursor-pointer">
                        <span className="font-mono text-sm font-medium text-foreground">{txn.id}</span>
                        <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground text-sm">{txn.patient}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{txn.doctor} • {txn.clinic}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">₹10.00</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-white/50 font-normal">
                          {txn.method}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {txn.time}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Badge 
                        variant="outline" 
                        className={`
                          ${txn.status === "Success" ? "bg-secondary/15 text-secondary border-secondary/20" : ""}
                          ${txn.status === "Failed" ? "bg-destructive/15 text-destructive border-destructive/20" : ""}
                          ${txn.status === "Pending" ? "bg-amber-500/15 text-amber-600 border-amber-500/20" : ""}
                        `}
                      >
                        {txn.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="p-4 border-t border-border/30 bg-white/30 flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground gap-4">
            <div>Showing 1-10 of 12,450 transactions</div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="w-8 h-8 rounded-lg bg-white/50 border-white/80" disabled>
                <span className="sr-only">Previous page</span>
                &lt;
              </Button>
              <Button variant="outline" size="icon" className="w-8 h-8 rounded-lg bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-white">
                1
              </Button>
              <Button variant="outline" size="icon" className="w-8 h-8 rounded-lg bg-white/50 border-white/80">
                2
              </Button>
              <Button variant="outline" size="icon" className="w-8 h-8 rounded-lg bg-white/50 border-white/80">
                3
              </Button>
              <span className="px-2">...</span>
              <Button variant="outline" size="icon" className="w-8 h-8 rounded-lg bg-white/50 border-white/80">
                <span className="sr-only">Next page</span>
                &gt;
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}