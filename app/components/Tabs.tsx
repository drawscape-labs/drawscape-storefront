import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useId,
  type ReactNode,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
} from 'react';

interface TabsContextValue {
  activeValue: string;
  setActiveValue: (value: string) => void;
  triggers: Map<string, HTMLButtonElement>;
  registerTrigger: (value: string, ref: HTMLButtonElement | null) => void;
  orientation: 'horizontal';
  fullWidth: boolean;
}

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a <Tabs> parent');
  }
  return context;
};

interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  ariaLabel?: string;
  fullWidth?: boolean;
  children: ReactNode;
}

function Tabs({
  defaultValue,
  value,
  onValueChange,
  ariaLabel,
  fullWidth = true,
  children,
  className = '',
  ...props
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const triggers = useRef(new Map<string, HTMLButtonElement>()).current;
  const isControlled = value !== undefined;
  const activeValue = isControlled ? value : internalValue;

  const setActiveValue = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  const registerTrigger = (value: string, ref: HTMLButtonElement | null) => {
    if (ref) {
      triggers.set(value, ref);
    } else {
      triggers.delete(value);
    }
  };

  useEffect(() => {
    if (!activeValue && triggers.size > 0) {
      const firstValue = Array.from(triggers.keys())[0];
      setActiveValue(firstValue);
    }
  }, [activeValue, triggers]);

  const contextValue: TabsContextValue = {
    activeValue,
    setActiveValue,
    triggers,
    registerTrigger,
    orientation: 'horizontal',
    fullWidth,
  };

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

interface TabsListProps extends HTMLAttributes<HTMLDivElement> {}

function TabsList({ className = '', children, ...props }: TabsListProps) {
  const { orientation, fullWidth } = useTabsContext();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const { triggers, activeValue, setActiveValue } = useTabsContext();
    const triggerValues = Array.from(triggers.keys());
    const currentIndex = triggerValues.indexOf(activeValue);

    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        if (orientation === 'horizontal' && e.key === 'ArrowUp') return;
        e.preventDefault();
        newIndex = currentIndex - 1;
        if (newIndex < 0) newIndex = triggerValues.length - 1;
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        if (orientation === 'horizontal' && e.key === 'ArrowDown') return;
        e.preventDefault();
        newIndex = currentIndex + 1;
        if (newIndex >= triggerValues.length) newIndex = 0;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = triggerValues.length - 1;
        break;
      default:
        return;
    }

    const newValue = triggerValues[newIndex];
    const trigger = triggers.get(newValue);
    if (trigger && !trigger.disabled) {
      setActiveValue(newValue);
      trigger.focus();
    } else {
      // Find next non-disabled trigger
      let attempts = 0;
      while (attempts < triggerValues.length) {
        newIndex = e.key === 'ArrowLeft' || e.key === 'ArrowUp'
          ? (newIndex - 1 + triggerValues.length) % triggerValues.length
          : (newIndex + 1) % triggerValues.length;
        const nextValue = triggerValues[newIndex];
        const nextTrigger = triggers.get(nextValue);
        if (nextTrigger && !nextTrigger.disabled) {
          setActiveValue(nextValue);
          nextTrigger.focus();
          break;
        }
        attempts++;
      }
    }
  };

  return (
    <div
      role="tablist"
      aria-orientation={orientation}
      className={`border-b border-gray-200 dark:border-white/10 -mb-px flex ${fullWidth ? '' : 'gap-6 sm:gap-8'} ${className}`}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  value: string;
}

function TabsTrigger({
  value,
  className = '',
  children,
  disabled,
  ...props
}: TabsTriggerProps) {
  const { activeValue, setActiveValue, registerTrigger, fullWidth } = useTabsContext();
  const ref = useRef<HTMLButtonElement>(null);
  const triggerId = useId();
  const contentId = `${triggerId}-content`;
  const isSelected = activeValue === value;

  useEffect(() => {
    registerTrigger(value, ref.current);
    return () => registerTrigger(value, null);
  }, [value, registerTrigger]);

  const handleClick = () => {
    if (!disabled) {
      setActiveValue(value);
    }
  };

  const baseClasses = 'px-1 py-4 text-center text-sm font-medium border-b-2';
  const stateClasses = isSelected
    ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-white/20 dark:hover:text-gray-300';
  const widthClass = fullWidth ? 'flex-1' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      ref={ref}
      role="tab"
      type="button"
      id={triggerId}
      aria-selected={isSelected}
      aria-controls={contentId}
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      className={`${baseClasses} ${stateClasses} ${widthClass} ${disabledClass} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  unmount?: boolean;
}

function TabsContent({
  value,
  unmount = true,
  className = '',
  children,
  ...props
}: TabsContentProps) {
  const { activeValue } = useTabsContext();
  const isSelected = activeValue === value;
  const triggerId = useId();
  const contentId = `${triggerId}-content`;

  if (unmount && !isSelected) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={contentId}
      aria-labelledby={triggerId}
      hidden={!isSelected}
      aria-hidden={!isSelected}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}

Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;

export default Tabs;