// Square UI Components - Blueground Style
// All components have border-radius: 0 (square design)

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================
// Re-export all UI components
// ============================================================
export { default as DatePicker } from './DatePicker';
export { default as RangeSlider } from './RangeSlider';
export { default as Accordion, AccordionItem, AccordionTrigger, AccordionContent, AccordionItemComplete, SimpleAccordion } from './Accordion';
export { default as Tabs, TabsList, TabsTrigger, TabsContent, PillsTrigger, SimpleTabs, PillsTabs } from './Tabs';
export { default as ToastProvider, useToast, useToastHelpers, Toast } from './Toast';
export { default as Loading, PageLoading, InlineLoading, LoadingCard, LoadingTable, LoadingGrid, LoadingContent } from './Loading';
export { default as Error, ErrorPage, NotFoundPage, NetworkErrorPage, InlineError, ErrorBoundaryFallback, EmptyState } from './Error';
export { default as Button } from './Button';
export { default as Modal } from './Modal';
export { default as SearchBar } from './SearchBar';
export { default as LanguageSwitcher } from './LanguageSwitcher';

// ============================================================
// Button - 方形按钮
// ============================================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const UIButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 border-0 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-700 focus:ring-primary',
      secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus:ring-neutral-400',
      outline: 'bg-transparent border border-neutral-300 text-neutral-900 hover:bg-neutral-50 focus:ring-neutral-400',
      ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-400',
      danger: 'bg-error text-white hover:bg-red-700 focus:ring-red-500',
    };
    
    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };
    
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            加载中...
          </>
        ) : children}
      </button>
    );
  }
);
UIButton.displayName = 'UIButton';

// ============================================================
// Card - 方形卡片
// ============================================================
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white border border-neutral-200 overflow-hidden',
          hover && 'transition-shadow duration-200 hover:shadow-lg',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6 border-b border-neutral-200', className)} {...props}>{children}</div>
);

export const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6', className)} {...props}>{children}</div>
);

export const CardFooter = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-6 py-4 border-t border-neutral-200 bg-neutral-50', className)} {...props}>{children}</div>
);

// ============================================================
// Input - 方形输入框
// ============================================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-3 border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400',
              'transition-all duration-200',
              'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary',
              'disabled:bg-neutral-100 disabled:cursor-not-allowed',
              icon && 'pl-12',
              error && 'border-error focus:border-error focus:ring-error',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-error">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ============================================================
// Select - 方形选择框
// ============================================================
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full px-4 py-3 border border-neutral-300 bg-white text-neutral-900',
            'appearance-none cursor-pointer',
            'transition-all duration-200',
            'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary',
            'disabled:bg-neutral-100 disabled:cursor-not-allowed',
            error && 'border-error focus:border-error focus:ring-error',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-2 text-sm text-error">{error}</p>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';

// ============================================================
// TextArea - 方形文本域
// ============================================================
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full px-4 py-3 border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400',
            'transition-all duration-200 resize-none',
            'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary',
            'disabled:bg-neutral-100 disabled:cursor-not-allowed',
            error && 'border-error focus:border-error focus:ring-error',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-error">{error}</p>
        )}
      </div>
    );
  }
);
TextArea.displayName = 'TextArea';

// ============================================================
// Badge - 方形标签
// ============================================================
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
}

export const Badge = ({ className, variant = 'default', children, ...props }: BadgeProps) => {
  const variants = {
    default: 'bg-neutral-100 text-neutral-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    error: 'bg-red-100 text-red-800',
  };
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

// ============================================================
// Container - 方形容器
// ============================================================
export const Container = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8', className)} {...props}>
    {children}
  </div>
);

// ============================================================
// Section - 方形区块
// ============================================================
interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  bg?: 'white' | 'neutral' | 'dark';
}

export const Section = ({ className, bg = 'white', children, ...props }: SectionProps) => {
  const bgStyles = {
    white: 'bg-white',
    neutral: 'bg-neutral-50',
    dark: 'bg-neutral-900 text-white',
  };
  
  return (
    <section className={cn('py-16 md:py-24', bgStyles[bg], className)} {...props}>
      <Container>{children}</Container>
    </section>
  );
};

// ============================================================
// ImageContainer - 方形图片容器
// ============================================================
interface ImageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  aspectRatio?: 'square' | '4-3' | '16-9' | '3-2';
}

export const ImageContainer = ({ 
  className, 
  aspectRatio = 'square', 
  children, 
  ...props 
}: ImageContainerProps) => {
  const ratios = {
    'square': 'aspect-square',
    '4-3': 'aspect-[4/3]',
    '16-9': 'aspect-video',
    '3-2': 'aspect-[3/2]',
  };
  
  return (
    <div 
      className={cn('relative overflow-hidden bg-neutral-100', ratios[aspectRatio], className)} 
      {...props}
    >
      {children}
    </div>
  );
};

// ============================================================
// Divider - 分割线
// ============================================================
export const Divider = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('w-full h-px bg-neutral-200', className)} {...props} />
);

// ============================================================
// Skeleton - 加载骨架屏
// ============================================================
export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={cn('animate-pulse bg-neutral-200', className)} 
    {...props} 
  />
);

// ============================================================
// Modal - 方形弹窗
// ============================================================
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const UIModal = ({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) => {
  if (!isOpen) return null;
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-neutral-900 opacity-50" />
        </div>
        <div className={cn(
          'inline-block w-full text-left align-bottom bg-white shadow-xl transform transition-all sm:my-8 sm:align-middle',
          sizes[size]
        )}>
          {title && (
            <div className="px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-medium text-neutral-900">{title}</h3>
            </div>
          )}
          <div className="px-6 py-4">{children}</div>
          {footer && (
            <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Checkbox - 方形复选框
// ============================================================
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          ref={ref}
          className={cn(
            'w-4 h-4 border border-neutral-300 text-primary focus:ring-primary',
            className
          )}
          {...props}
        />
        {label && <span className="text-sm text-neutral-700">{label}</span>}
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';

// ============================================================
// Radio - 方形单选框
// ============================================================
interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          ref={ref}
          className={cn(
            'w-4 h-4 border border-neutral-300 text-primary focus:ring-primary',
            className
          )}
          {...props}
        />
        {label && <span className="text-sm text-neutral-700">{label}</span>}
      </label>
    );
  }
);
Radio.displayName = 'Radio';

// ============================================================
// Toggle Switch - 方形开关
// ============================================================
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className,
}) => {
  return (
    <label className={cn('flex items-center gap-3 cursor-pointer', disabled && 'cursor-not-allowed opacity-50', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          checked ? 'bg-primary' : 'bg-neutral-200'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform bg-white transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
      {label && <span className="text-sm text-neutral-700">{label}</span>}
    </label>
  );
};

// ============================================================
// Tooltip - 工具提示
// ============================================================
interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className,
}) => {
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className={cn('relative inline-block group', className)}>
      {children}
      <div className={cn(
        'absolute z-50 px-3 py-2 bg-neutral-900 text-white text-sm whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all',
        positions[position]
      )}>
        {content}
      </div>
    </div>
  );
};

// ============================================================
// Avatar - 方形头像
// ============================================================
interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  className,
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <div
      className={cn(
        'flex items-center justify-center bg-primary text-white font-medium overflow-hidden',
        sizes[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={alt || name} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
};
