import React from "react";
import { cn } from "@/lib/utils";

const GLASS_STYLE = {
  background: "rgba(255,255,255,0.7)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.8)",
  boxShadow: "0 8px 32px rgba(31,38,135,0.08)",
} as React.CSSProperties;

const STRONG_GLASS_STYLE = {
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.95)",
  boxShadow: "0 8px 40px rgba(31,38,135,0.10)",
} as React.CSSProperties;

// ──────────────────────────────────────────────
// GlassCard — frosted glass container card
// ──────────────────────────────────────────────
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
  style?: React.CSSProperties;
}

export function GlassCard({ children, className, strong = false, style }: GlassCardProps) {
  return (
    <div
      className={cn("rounded-3xl p-5", className)}
      style={{ ...(strong ? STRONG_GLASS_STYLE : GLASS_STYLE), ...style }}
    >
      {children}
    </div>
  );
}

// ──────────────────────────────────────────────
// GlassButton — indigo / green / accent CTA
// ──────────────────────────────────────────────
type GlassButtonVariant = "primary" | "secondary" | "accent" | "ghost" | "danger";

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GlassButtonVariant;
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const BUTTON_VARIANTS: Record<GlassButtonVariant, string> = {
  primary:   "bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-lg shadow-[#4F46E5]/30",
  secondary: "bg-[#22C55E] hover:bg-[#16A34A] text-white shadow-lg shadow-[#22C55E]/25",
  accent:    "bg-[#06B6D4] hover:bg-[#0891B2] text-white shadow-lg shadow-[#06B6D4]/25",
  ghost:     "bg-white/60 hover:bg-white/80 text-gray-700 border border-gray-200",
  danger:    "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25",
};

const BUTTON_SIZES: Record<string, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-12 px-6 text-sm font-semibold",
  lg: "h-14 px-8 text-base font-bold",
};

export function GlassButton({
  children,
  variant = "primary",
  size = "md",
  icon,
  fullWidth = false,
  className,
  ...props
}: GlassButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed",
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      {children}
    </button>
  );
}

// ──────────────────────────────────────────────
// InputField — glassmorphic text input
// ──────────────────────────────────────────────
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export function InputField({ label, icon, error, className, ...props }: InputFieldProps) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-gray-600">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4">
            {icon}
          </span>
        )}
        <input
          className={cn(
            "w-full rounded-2xl px-4 py-3 text-sm outline-none transition-all duration-200",
            "placeholder:text-gray-400 text-gray-800",
            "border border-gray-200 focus:border-[#4F46E5]/50 focus:ring-2 focus:ring-[#4F46E5]/10",
            icon && "pl-10",
            className
          )}
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(8px)",
          }}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ──────────────────────────────────────────────
// Badge — status / type indicator pill
// ──────────────────────────────────────────────
type BadgeVariant = "primary" | "secondary" | "accent" | "success" | "warning" | "danger" | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  pulse?: boolean;
  className?: string;
}

const BADGE_VARIANTS: Record<BadgeVariant, string> = {
  primary:   "bg-[#4F46E5]/10 text-[#4F46E5] border-[#4F46E5]/20",
  secondary: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20",
  accent:    "bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20",
  success:   "bg-green-50 text-green-700 border-green-200",
  warning:   "bg-amber-50 text-amber-700 border-amber-200",
  danger:    "bg-red-50 text-red-600 border-red-200",
  neutral:   "bg-gray-100 text-gray-600 border-gray-200",
};

export function Badge({ children, variant = "neutral", pulse = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        BADGE_VARIANTS[variant],
        className
      )}
    >
      {pulse && (
        <span className={cn(
          "w-1.5 h-1.5 rounded-full animate-pulse",
          variant === "success" || variant === "secondary" ? "bg-[#22C55E]" :
          variant === "primary" ? "bg-[#4F46E5]" : "bg-current"
        )} />
      )}
      {children}
    </span>
  );
}

// ──────────────────────────────────────────────
// Modal — glassmorphic overlay modal
// ──────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/20"
        style={{ backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      <div
        className={cn("relative z-10 rounded-3xl p-6 w-full max-w-sm", className)}
        style={STRONG_GLASS_STYLE}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Tabs — simple tab switcher
// ──────────────────────────────────────────────
interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  items: TabItem[];
  active: string;
  onChange?: (id: string) => void;
  className?: string;
}

export function Tabs({ items, active, onChange, className }: TabsProps) {
  return (
    <div
      className={cn("inline-flex rounded-2xl p-1 gap-1", className)}
      style={{
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.8)",
      }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange?.(item.id)}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
            active === item.id
              ? "bg-[#4F46E5] text-white shadow-md shadow-[#4F46E5]/25"
              : "text-gray-500 hover:text-gray-800"
          )}
        >
          {item.label}
          {item.count !== undefined && (
            <span className={cn(
              "ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
              active === item.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
            )}>
              {item.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────
// ListItem — row with icon + text + action
// ──────────────────────────────────────────────
interface ListItemProps {
  icon?: React.ReactNode;
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ListItem({ icon, label, sublabel, right, onClick, className }: ListItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center justify-between p-4 rounded-2xl transition-all duration-200",
        onClick && "cursor-pointer hover:bg-white/80 active:scale-[0.99]",
        className
      )}
      style={GLASS_STYLE}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-[#4F46E5]/10 flex items-center justify-center text-[#4F46E5]">
            {icon}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          {sublabel && <p className="text-xs text-gray-500 mt-0.5">{sublabel}</p>}
        </div>
      </div>
      {right && <div className="text-gray-400">{right}</div>}
    </div>
  );
}

// ──────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────
export const LinsetuDesignSystem = {
  GlassCard,
  GlassButton,
  InputField,
  Badge,
  Modal,
  Tabs,
  ListItem,
};

export default LinsetuDesignSystem;
