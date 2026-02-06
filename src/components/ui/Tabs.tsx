"use client";

import React, { useState, createContext, useContext } from "react";
import { cn } from "@/lib/utils";

// ============================================================
// Tabs Context
// ============================================================
interface TabsContextType {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs provider");
  }
  return context;
};

// ============================================================
// Tabs Root
// ============================================================
interface TabsProps {
  children: React.ReactNode;
  defaultTab: string;
  onChange?: (tab: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  children,
  defaultTab,
  onChange,
  className,
}) => {
  const [activeTab, setActiveTabState] = useState(defaultTab);

  const setActiveTab = (id: string) => {
    setActiveTabState(id);
    onChange?.(id);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
};

// ============================================================
// Tabs List
// ============================================================
interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "pills" | "underline";
}

export const TabsList: React.FC<TabsListProps> = ({
  children,
  className,
  variant = "default",
}) => {
  const variants = {
    default: "border-b border-neutral-200",
    pills: "bg-neutral-100 p-1",
    underline: "border-b-2 border-neutral-200",
  };

  return (
    <div
      className={cn(
        "flex",
        variants[variant],
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  );
};

// ============================================================
// Tabs Trigger
// ============================================================
interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  className,
  disabled = false,
}) => {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${value}`}
      disabled={disabled}
      onClick={() => setActiveTab(value)}
      className={cn(
        "px-4 py-3 text-sm font-medium transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        isActive
          ? "text-primary border-b-2 border-primary -mb-px"
          : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50",
        className
      )}
    >
      {children}
    </button>
  );
};

// ============================================================
// Tabs Content
// ============================================================
interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  className,
}) => {
  const { activeTab } = useTabs();
  const isActive = activeTab === value;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      id={`panel-${value}`}
      className={cn("mt-4", className)}
    >
      {children}
    </div>
  );
};

// ============================================================
// Pills Variant Tabs Trigger
// ============================================================
interface PillsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const PillsTrigger: React.FC<PillsTriggerProps> = ({
  value,
  children,
  className,
  disabled = false,
}) => {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => setActiveTab(value)}
      className={cn(
        "px-4 py-2 text-sm font-medium transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        isActive
          ? "bg-primary text-white"
          : "text-neutral-600 hover:bg-white hover:text-neutral-900",
        className
      )}
    >
      {children}
    </button>
  );
};

// ============================================================
// Simple Tabs (for quick usage)
// ============================================================
interface SimpleTabsProps {
  tabs: {
    id: string;
    label: string;
    content: React.ReactNode;
  }[];
  defaultTab?: string;
  onChange?: (tab: string) => void;
  className?: string;
}

export const SimpleTabs: React.FC<SimpleTabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  className,
}) => {
  const initialTab = defaultTab || tabs[0]?.id;

  return (
    <Tabs defaultTab={initialTab} onChange={onChange} className={className}>
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

// ============================================================
// Pills Tabs (for quick usage)
// ============================================================
interface PillsTabsProps {
  tabs: {
    id: string;
    label: string;
    content: React.ReactNode;
  }[];
  defaultTab?: string;
  onChange?: (tab: string) => void;
  className?: string;
}

export const PillsTabs: React.FC<PillsTabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  className,
}) => {
  const initialTab = defaultTab || tabs[0]?.id;

  return (
    <Tabs defaultTab={initialTab} onChange={onChange} className={className}>
      <TabsList variant="pills">
        {tabs.map((tab) => (
          <PillsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </PillsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default Tabs;
