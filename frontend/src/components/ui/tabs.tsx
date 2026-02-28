import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

// ─── Context ─────────────────────────────────────────────────────────────────

interface TabsContextValue {
  activeValue: string;
  onChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue>({
  activeValue: '',
  onChange: () => {},
});

// ─── Tabs (root) ─────────────────────────────────────────────────────────────

interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, value: controlledValue, defaultValue = '', onValueChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const activeValue = controlledValue ?? internalValue;

    const onChange = React.useCallback(
      (v: string) => {
        if (controlledValue === undefined) setInternalValue(v);
        onValueChange?.(v);
      },
      [controlledValue, onValueChange]
    );

    return (
      <TabsContext.Provider value={{ activeValue, onChange }}>
        <div ref={ref} className={cn('w-full', className)} {...props} />
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = 'Tabs';

// ─── TabsList ────────────────────────────────────────────────────────────────

const tabsListVariants = cva(
  'inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground'
);

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(tabsListVariants(), className)} {...props} />
  )
);
TabsList.displayName = 'TabsList';

// ─── TabsTrigger ─────────────────────────────────────────────────────────────

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value?: string;
  /** Manual active override — inferred automatically when used inside <Tabs> */
  active?: boolean;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value = '', active: activeProp, onClick, ...props }, ref) => {
    const { activeValue, onChange } = React.useContext(TabsContext);
    const isActive = activeProp ?? activeValue === value;

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          isActive && 'bg-background text-foreground shadow',
          className
        )}
        onClick={(e) => {
          onChange(value);
          onClick?.(e);
        }}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = 'TabsTrigger';

// ─── TabsContent ─────────────────────────────────────────────────────────────

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const { activeValue } = React.useContext(TabsContext);
    // If no value provided, always show; otherwise only show when active
    if (value !== undefined && value !== activeValue) return null;

    return (
      <div
        ref={ref}
        className={cn(
          'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className
        )}
        {...props}
      />
    );
  }
);
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };

