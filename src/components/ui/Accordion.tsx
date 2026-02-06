"use client";

import React, { useState, createContext, useContext } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

// ============================================================
// Accordion Context
// ============================================================
interface AccordionContextType {
  openItems: string[];
  toggleItem: (id: string) => void;
  allowMultiple: boolean;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within an Accordion");
  }
  return context;
};

// ============================================================
// Accordion Root
// ============================================================
interface AccordionProps {
  children: React.ReactNode;
  defaultOpen?: string[];
  allowMultiple?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  children,
  defaultOpen = [],
  allowMultiple = false,
  className,
}) => {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (allowMultiple) {
        return [...prev, id];
      }
      return [id];
    });
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, allowMultiple }}>
      <div className={cn("border border-neutral-200 divide-y divide-neutral-200", className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

// ============================================================
// Accordion Item
// ============================================================
interface AccordionItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  id,
  children,
  className,
}) => {
  return <div className={cn("", className)}>{children}</div>;
};

// ============================================================
// Accordion Trigger
// ============================================================
interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export const AccordionTrigger: React.FC<AccordionTriggerProps> = ({
  children,
  className,
}) => {
  const accordion = useAccordion();
  const itemId = React.useContext(AccordionItemContext);
  const isOpen = accordion.openItems.includes(itemId);

  return (
    <button
      type="button"
      onClick={() => accordion.toggleItem(itemId)}
      className={cn(
        "w-full flex items-center justify-between px-6 py-4 text-left",
        "bg-white hover:bg-neutral-50 transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary",
        className
      )}
    >
      <span className="font-medium text-neutral-900">{children}</span>
      <ChevronDown
        className={cn(
          "w-5 h-5 text-neutral-500 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </button>
  );
};

// ============================================================
// Accordion Content
// ============================================================
interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

const AccordionItemContext = createContext<string>("");

export const AccordionContent: React.FC<AccordionContentProps> = ({
  children,
  className,
}) => {
  const accordion = useAccordion();
  const itemId = React.useContext(AccordionItemContext);
  const isOpen = accordion.openItems.includes(itemId);

  return (
    <div
      className={cn(
        "overflow-hidden transition-all duration-200",
        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}
    >
      <div className={cn("px-6 py-4 bg-neutral-50", className)}>{children}</div>
    </div>
  );
};

// ============================================================
// Complete Accordion Item Wrapper
// ============================================================
interface AccordionItemCompleteProps {
  id: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const AccordionItemComplete: React.FC<AccordionItemCompleteProps> = ({
  id,
  trigger,
  children,
  className,
}) => {
  return (
    <AccordionItemContext.Provider value={id}>
      <AccordionItem id={id} className={className}>
        <AccordionTrigger>{trigger}</AccordionTrigger>
        <AccordionContent>{children}</AccordionContent>
      </AccordionItem>
    </AccordionItemContext.Provider>
  );
};

// ============================================================
// Simple Accordion (for quick usage)
// ============================================================
interface SimpleAccordionProps {
  items: {
    id: string;
    trigger: React.ReactNode;
    content: React.ReactNode;
  }[];
  defaultOpen?: string[];
  allowMultiple?: boolean;
  className?: string;
}

export const SimpleAccordion: React.FC<SimpleAccordionProps> = ({
  items,
  defaultOpen,
  allowMultiple,
  className,
}) => {
  return (
    <Accordion
      defaultOpen={defaultOpen}
      allowMultiple={allowMultiple}
      className={className}
    >
      {items.map((item) => (
        <AccordionItemComplete
          key={item.id}
          id={item.id}
          trigger={item.trigger}
        >
          {item.content}
        </AccordionItemComplete>
      ))}
    </Accordion>
  );
};

export default Accordion;
