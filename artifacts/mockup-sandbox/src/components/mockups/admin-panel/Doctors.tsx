import React from "react";
import { AdminLayout } from "./_shared/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Filter, MoreHorizontal, Star, Building2, Stethoscope } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function Doctors() {
  const glassStyle = {
    backdropFilter: "blur(12px)",
    background: "rgba(255,255,255,0.7)",
    border: "1px solid rgba(255,255,255,0.8)",
    boxShadow: "0 8px 32px rgba(31,38,135,0.04)"
  };

  const doctors = [
    { id: "DR-101", name: "Dr. Ananya Sharma", spec: "Cardiologist", clinic: "Apollo Clinics Delhi", patients: 24, rating: 4.8, status: "Active", img: "https://i.pravatar.cc/150?u=a1" },
    { id: "DR-102", name: "Dr. Rajesh Kumar", spec: "Pediatrician", clinic: "CareWell Hospital", patients: 32, rating: 4.9, status: "Active", img: "https://i.pravatar.cc/150?u=a2" },
    { id: "DR-103", name: "Dr. Sneha Desai", spec: "Dermatologist", clinic: "City Health Center", patients: 15, rating: 4.6, status: "Active", img: "https://i.pravatar.cc/150?u=a3" },
    { id: "DR-104", name: "Dr. Vikram Singh", spec: "Orthopedic", clinic: "MediLife Care", patients: 0, rating: 4.7, status: "On Leave", img: "https://i.pravatar.cc/150?u=a4" },
    { id: "DR-105", name: "Dr. Pooja Mehta", spec: "Gynecologist", clinic: "Apollo Clinics Delhi", patients: 28, rating: 4.9, status: "Active", img: "https://i.pravatar.cc/150?u=a5" },
    { id: "DR-106", name: "Dr. Rahul Verma", spec: "General Physician", clinic: "Niramay Clinic", patients: 45, rating: 4.5, status: "Active", img: "https://i.pravatar.cc/150?u=a6" },
  ];

  return (
    <AdminLayout currentPage="Doctors">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Doctors Management</h1>
            <p className="text-muted-foreground mt-1">Manage doctor profiles and their clinic assignments.</p>
          </div>
          <Button className="rounded-xl shadow-md" size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Add Doctor
          </Button>
        </div>

        {/* Filters */}
        <Card style={glassStyle} className="rounded-2xl border-none">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                className="w-full pl-9 bg-white/50 border-white/80 rounded-xl" 
                placeholder="Search by doctor name, specialty or ID..." 
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
              <Button variant="outline" className="rounded-xl bg-white/50 whitespace-nowrap">
                <Stethoscope className="w-4 h-4 mr-2" />
                Specialization
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
        <Card style={glassStyle} className="rounded-2xl overflow-hidden border-none">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/40">
                <TableRow className="border-border/50">
                  <TableHead className="font-semibold text-foreground py-4 pl-6">Doctor Profile</TableHead>
                  <TableHead className="font-semibold text-foreground">Assigned Clinic</TableHead>
                  <TableHead className="font-semibold text-foreground">Patients Today</TableHead>
                  <TableHead className="font-semibold text-foreground">Rating</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="text-right font-semibold text-foreground pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.map((doc) => (
                  <TableRow key={doc.id} className="border-border/30 hover:bg-white/40 transition-colors">
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-white shadow-sm">
                          <AvatarImage src={doc.img} />
                          <AvatarFallback>{doc.name.split(' ').map(n=>n[0]).join('').substring(0,2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">{doc.name}</div>
                          <div className="text-xs text-primary font-medium bg-primary/10 inline-block px-1.5 rounded mt-0.5">{doc.spec}</div>
                          <span className="text-[10px] text-muted-foreground ml-2">{doc.id}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Building2 className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                        {doc.clinic}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{doc.patients}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm font-medium">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 mr-1" />
                        {doc.rating}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={doc.status === "Active" ? "secondary" : "outline"}
                        className={doc.status === "Active" ? "bg-secondary/15 text-secondary hover:bg-secondary/25" : ""}
                      >
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg bg-white/50 hover:bg-white/80">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-white/80 bg-white/90 backdrop-blur-md w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="cursor-pointer">View Profile</DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">Edit Details</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer font-medium text-primary">
                            Assign to Clinic
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="p-4 border-t border-border/30 bg-white/20 flex items-center justify-between text-sm text-muted-foreground">
            <div>Showing 1-6 of 124 doctors</div>
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