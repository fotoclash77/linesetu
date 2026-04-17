import React, { useState } from "react";
import {
  GlassCard,
  GlassButton,
  InputField,
  Badge,
  Modal,
  Tabs,
  ListItem,
} from "../_design-system/GlassComponents";
import { Bell, Heart, User, Settings, ChevronRight, Lock } from "lucide-react";

export function Showcase() {
  const [activeTab, setActiveTab] = useState("components");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen p-8 space-y-10" style={{ background: "#F8FAFC" }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-[#4F46E5] mb-1">LINESETU</h1>
          <p className="text-gray-500 text-sm font-medium">Design System — Glassmorphic Light Theme</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Tabs</h2>
          <Tabs
            items={[
              { id: "components", label: "Components" },
              { id: "patterns", label: "Patterns", count: 3 },
              { id: "tokens", label: "Tokens" },
            ]}
            active={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {/* GlassCard */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">GlassCard</h2>
          <div className="grid grid-cols-2 gap-4">
            <GlassCard>
              <p className="text-sm font-semibold text-gray-800">Standard Glass</p>
              <p className="text-xs text-gray-500 mt-1">rgba(255,255,255,0.7) · blur(12px)</p>
            </GlassCard>
            <GlassCard strong>
              <p className="text-sm font-semibold text-gray-800">Strong Glass</p>
              <p className="text-xs text-gray-500 mt-1">rgba(255,255,255,0.85) · blur(20px)</p>
            </GlassCard>
          </div>
        </div>

        {/* GlassButton */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">GlassButton</h2>
          <div className="flex flex-wrap gap-3">
            <GlassButton variant="primary" icon={<Lock />}>Primary</GlassButton>
            <GlassButton variant="secondary">Secondary</GlassButton>
            <GlassButton variant="accent">Accent</GlassButton>
            <GlassButton variant="ghost">Ghost</GlassButton>
            <GlassButton variant="danger">Danger</GlassButton>
          </div>
          <div className="mt-3 flex gap-3">
            <GlassButton variant="primary" size="sm">Small</GlassButton>
            <GlassButton variant="primary" size="md">Medium</GlassButton>
            <GlassButton variant="primary" size="lg">Large</GlassButton>
          </div>
          <div className="mt-3">
            <GlassButton variant="primary" fullWidth size="lg">Full Width Button</GlassButton>
          </div>
        </div>

        {/* InputField */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">InputField</h2>
          <GlassCard className="space-y-4">
            <InputField label="Phone Number" placeholder="Enter your mobile number" icon={<User className="w-4 h-4" />} />
            <InputField label="Password" type="password" placeholder="Enter OTP" icon={<Lock className="w-4 h-4" />} />
            <InputField label="Search" placeholder="Search doctors, clinics..." error="No results found" />
          </GlassCard>
        </div>

        {/* Badge */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Badge</h2>
          <div className="flex flex-wrap gap-2">
            <Badge variant="primary">Indigo</Badge>
            <Badge variant="secondary" pulse>Live</Badge>
            <Badge variant="accent">Cyan</Badge>
            <Badge variant="success">Active</Badge>
            <Badge variant="warning">Pending</Badge>
            <Badge variant="danger">Failed</Badge>
            <Badge variant="neutral">Walk-in</Badge>
          </div>
        </div>

        {/* Modal */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Modal</h2>
          <GlassButton variant="primary" onClick={() => setModalOpen(true)}>Open Modal</GlassButton>
          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Booking Confirmed">
            <p className="text-sm text-gray-600 mb-4">Your token #57 has been booked with Dr. Ananya Sharma.</p>
            <GlassButton variant="primary" fullWidth onClick={() => setModalOpen(false)}>Done</GlassButton>
          </Modal>
        </div>

        {/* ListItem */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">ListItem</h2>
          <div className="space-y-2">
            <ListItem icon={<Bell className="w-5 h-5" />} label="Notifications" sublabel="Manage your alerts" right={<ChevronRight className="w-4 h-4" />} onClick={() => {}} />
            <ListItem icon={<Heart className="w-5 h-5" />} label="My Bookings" sublabel="3 active bookings" right={<Badge variant="primary">3</Badge>} onClick={() => {}} />
            <ListItem icon={<Settings className="w-5 h-5" />} label="Settings" sublabel="Account & preferences" right={<ChevronRight className="w-4 h-4" />} onClick={() => {}} />
          </div>
        </div>

        {/* Color Palette */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Color Palette</h2>
          <GlassCard>
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: "Primary", color: "#4F46E5", label: "Indigo" },
                { name: "Secondary", color: "#22C55E", label: "Green" },
                { name: "Accent", color: "#06B6D4", label: "Cyan" },
              ].map((c) => (
                <div key={c.name} className="text-center">
                  <div className="w-full h-16 rounded-2xl mb-2 shadow-lg" style={{ background: c.color }} />
                  <p className="text-xs font-bold text-gray-700">{c.name}</p>
                  <p className="text-[10px] text-gray-400">{c.color}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
