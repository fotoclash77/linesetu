import React, { useState } from "react";
import { AdminLayout } from "./_shared/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Filter, MoreHorizontal, Edit, Eye, MapPin, X, Building2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function Clinics() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClinic, setNewClinic] = useState({ name: "", city: "", doctorName: "", phone: "" });

  const glassStyle = {
    backdropFilter: "blur(12px)",
    background: "rgba(255,255,255,0.7)",
    border: "1px solid rgba(255,255,255,0.8)",
    boxShadow: "0 8px 32px rgba(31,38,135,0.04)"
  };

  const clinics = [
    { id: "CL-001", name: "Apollo Clinics Delhi", city: "New Delhi", doctors: 12, queues: 5, status: "Active", joined: "12 Jan 2024" },
    { id: "CL-002", name: "CareWell Hospital", city: "Mumbai", doctors: 8, queues: 3, status: "Active", joined: "05 Feb 2024" },
    { id: "CL-003", name: "Sanjivani Polyclinic", city: "Pune", doctors: 4, queues: 1, status: "Inactive", joined: "22 Feb 2024" },
    { id: "CL-004", name: "City Health Center", city: "Bangalore", doctors: 15, queues: 6, status: "Active", joined: "10 Mar 2024" },
    { id: "CL-005", name: "MediLife Care", city: "Hyderabad", doctors: 6, queues: 2, status: "Active", joined: "18 Apr 2024" },
    { id: "CL-006", name: "Niramay Clinic", city: "Chennai", doctors: 3, queues: 1, status: "Active", joined: "02 May 2024" },
  ];

  return (
    <AdminLayout currentPage="Clinics">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Clinics Management</h1>
            <p className="text-muted-foreground mt-1">Manage onboarded clinics, doctors, and subscription status.</p>
          </div>
          <Button className="rounded-xl shadow-md" size="lg" onClick={() => setShowAddModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Add Clinic
          </Button>
        </div>

        {/* Filters */}
        <Card style={glassStyle} className="rounded-2xl border-none">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                className="w-full pl-9 bg-white/50 border-white/80 rounded-xl" 
                placeholder="Search by clinic name or ID..." 
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button variant="outline" className="rounded-xl bg-white/50 w-full sm:w-auto">
                <MapPin className="w-4 h-4 mr-2" />
                City
              </Button>
              <Button variant="outline" className="rounded-xl bg-white/50 w-full sm:w-auto">
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
                  <TableHead className="font-semibold text-foreground py-4">Clinic Name</TableHead>
                  <TableHead className="font-semibold text-foreground">Location</TableHead>
                  <TableHead className="font-semibold text-foreground">Doctors</TableHead>
                  <TableHead className="font-semibold text-foreground">Active Queues</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clinics.map((clinic) => (
                  <TableRow key={clinic.id} className="border-border/30 hover:bg-white/40 transition-colors">
                    <TableCell className="font-medium py-4">
                      <div>
                        <div className="text-foreground">{clinic.name}</div>
                        <div className="text-xs text-muted-foreground font-normal">{clinic.id} • Joined {clinic.joined}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 mr-1" />
                        {clinic.city}
                      </div>
                    </TableCell>
                    <TableCell>{clinic.doctors}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${clinic.queues > 0 ? 'bg-secondary' : 'bg-muted-foreground'}`}></div>
                        {clinic.queues} queues
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={clinic.status === "Active" ? "secondary" : "outline"}
                        className={clinic.status === "Active" ? "bg-secondary/15 text-secondary hover:bg-secondary/25" : ""}
                      >
                        {clinic.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-white/80 bg-white/90 backdrop-blur-md">
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" /> Edit Clinic
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
            <div>Showing 1-6 of 48 clinics</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-lg h-8 bg-white/50" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="rounded-lg h-8 bg-white/50">Next</Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Add Clinic Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/20"
            style={{ backdropFilter: "blur(4px)" }}
            onClick={() => setShowAddModal(false)}
          />
          <div
            className="relative z-10 w-full max-w-md rounded-3xl p-6"
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.95)",
              boxShadow: "0 24px 64px rgba(31,38,135,0.12)",
            }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Add New Clinic</h2>
                  <p className="text-xs text-muted-foreground">Onboard a new clinic to the platform</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Clinic Name *</label>
                <Input
                  placeholder="e.g. Apollo Clinics Delhi"
                  value={newClinic.name}
                  onChange={(e) => setNewClinic({ ...newClinic, name: e.target.value })}
                  className="rounded-xl bg-white/70 border-gray-200"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">City *</label>
                <Input
                  placeholder="e.g. New Delhi"
                  value={newClinic.city}
                  onChange={(e) => setNewClinic({ ...newClinic, city: e.target.value })}
                  className="rounded-xl bg-white/70 border-gray-200"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Primary Doctor Name</label>
                <Input
                  placeholder="e.g. Dr. Ananya Sharma"
                  value={newClinic.doctorName}
                  onChange={(e) => setNewClinic({ ...newClinic, doctorName: e.target.value })}
                  className="rounded-xl bg-white/70 border-gray-200"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Contact Phone</label>
                <Input
                  placeholder="+91 98765 43210"
                  value={newClinic.phone}
                  onChange={(e) => setNewClinic({ ...newClinic, phone: e.target.value })}
                  className="rounded-xl bg-white/70 border-gray-200"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl shadow-lg shadow-primary/25"
                onClick={() => setShowAddModal(false)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Clinic
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}