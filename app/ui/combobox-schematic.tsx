'use client'

import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import { useState, useRef, useEffect } from 'react'

export function ComboboxSchematic<T>({
  options,
  displayValue,
  filter,
  anchor = 'bottom',
  className,
  placeholder,
  autoFocus,
  'aria-label': ariaLabel,
  children,
  value,
  onChange,
  ...props
}: {
  options: T[]
  displayValue: (value: T | null) => string | undefined
  filter?: (value: T, query: string) => boolean
  className?: string
  placeholder?: string
  autoFocus?: boolean
  'aria-label'?: string
  children: (value: NonNullable<T>) => React.ReactElement
  value?: T | null
  onChange?: (value: T | null) => void
} & Omit<Headless.ComboboxProps<T | null, false>, 'as' | 'multiple' | 'children' | 'value' | 'onChange' | 'virtual' | 'onClose'> & { anchor?: 'top' | 'bottom' }) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [shouldShowQuery, setShouldShowQuery] = useState(false)
  const previousValueRef = useRef<T | null>(value ?? null)
  const inputRef = useRef<HTMLInputElement>(null)
  const justSelectedRef = useRef(false)

  // Track when user opens the combobox
  useEffect(() => {
    if (isOpen) {
      // Store the current value when opening
      previousValueRef.current = value ?? null
      // Clear the input so user can type from scratch
      setQuery('')
      // Reset the selection flag
      justSelectedRef.current = false
      // Show query in the input
      setShouldShowQuery(true)
    } else {
      // When closed, show the selected value
      setShouldShowQuery(false)
    }
  }, [isOpen, value])

  const filteredOptions: (T | null)[] =
    query === ''
      ? options
      : options.filter((option) =>
          filter ? filter(option, query) : displayValue(option)?.toLowerCase().includes(query.toLowerCase())
        )

  const handleChange = (newValue: T | null) => {
    // User selected something, update the value
    onChange?.(newValue)
    setQuery('')
    setShouldShowQuery(false)
    // Mark that we just made a selection
    justSelectedRef.current = true
  }

  const handleClose = () => {
    setIsOpen(false)

    // If user just made a selection, blur the input
    if (justSelectedRef.current) {
      setTimeout(() => {
        inputRef.current?.blur()
      }, 0)
      justSelectedRef.current = false
    } else if (query !== '' && value === previousValueRef.current) {
      // If query is not empty and no selection was made, restore previous value
      // User was typing but didn't select anything, keep the previous value
      onChange?.(previousValueRef.current)
    }

    setQuery('')
    setShouldShowQuery(false)
  }

  return (
    <Headless.Combobox
      value={value}
      onChange={handleChange}
      multiple={false}
      immediate={true}
      virtual={{ options: filteredOptions as any }}
      onClose={handleClose}
      {...props}
    >
      {({ open }) => {
        // Track open state
        if (open !== isOpen) {
          setIsOpen(open)
        }

        return (
          <>
            <span
              data-slot="control"
              className={clsx([
                className,
                // Basic layout
                'relative block w-full',
                // Background color + shadow applied to inset pseudo element, so shadow blends with border in light mode
                'before:absolute before:inset-px before:rounded-[calc(var(--radius-lg)-1px)] before:bg-white before:shadow-sm',
                // Background color is moved to control and shadow is removed in dark mode so hide `before` pseudo
                'dark:before:hidden',
                // Focus ring
                'after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-transparent after:ring-inset sm:focus-within:after:ring-2 sm:focus-within:after:ring-blue-500',
                // Disabled state
                'has-data-disabled:opacity-50 has-data-disabled:before:bg-zinc-950/5 has-data-disabled:before:shadow-none',
                // Invalid state
                'has-data-invalid:before:shadow-red-500/10',
              ])}
            >
              <Headless.ComboboxInput
                ref={inputRef}
                autoFocus={autoFocus}
                data-slot="control"
                aria-label={ariaLabel}
                displayValue={(option: T) => {
                  // When dropdown is open OR we want to show query, show the query
                  console.log('displayValue called:', { open, shouldShowQuery, query, option: displayValue(option) })
                  if (open || shouldShowQuery) {
                    return query
                  }
                  // Otherwise show the selected value
                  return displayValue(option) ?? ''
                }}
                onChange={(event) => {
                  console.log('onChange called:', event.target.value)
                  setQuery(event.target.value)
                }}
                onFocus={() => {
                  console.log('onFocus called. open:', open, 'shouldShowQuery:', shouldShowQuery)
                  // Clear query and show it immediately when focused
                  // The 'immediate' prop on Combobox will handle opening the dropdown
                  setQuery('')
                  setShouldShowQuery(true)
                }}
                placeholder={placeholder}
                className={clsx([
                  className,
                  // Basic layout
                  'relative block w-full appearance-none rounded-lg py-[calc(--spacing(2.5)-1px)] sm:py-[calc(--spacing(1.5)-1px)]',
                  // Horizontal padding
                  'pr-[calc(--spacing(10)-1px)] pl-[calc(--spacing(3.5)-1px)] sm:pr-[calc(--spacing(9)-1px)] sm:pl-[calc(--spacing(3)-1px)]',
                  // Typography
                  'text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white',
                  // Border
                  'border border-zinc-950/10 data-hover:border-zinc-950/20 dark:border-white/10 dark:data-hover:border-white/20',
                  // Background color
                  'bg-transparent dark:bg-white/5',
                  // Hide default focus styles
                  'focus:outline-hidden',
                  // Invalid state
                  'data-invalid:border-red-500 data-invalid:data-hover:border-red-500 dark:data-invalid:border-red-500 dark:data-invalid:data-hover:border-red-500',
                  // Disabled state
                  'data-disabled:border-zinc-950/20 dark:data-disabled:border-white/15 dark:data-disabled:bg-white/2.5 dark:data-hover:data-disabled:border-white/15',
                  // System icons
                  'dark:scheme-dark',
                ])}
              />
              <Headless.ComboboxButton className="group absolute inset-y-0 right-0 flex items-center px-2">
                <svg
                  className="size-5 stroke-zinc-500 group-data-disabled:stroke-zinc-600 group-data-hover:stroke-zinc-700 sm:size-4 dark:stroke-zinc-400 dark:group-data-hover:stroke-zinc-300 forced-colors:stroke-[CanvasText]"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                  fill="none"
                >
                  <path d="M5.75 10.75L8 13L10.25 10.75" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10.25 5.25L8 3L5.75 5.25" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Headless.ComboboxButton>
            </span>
            <Headless.ComboboxOptions
              transition
              anchor={anchor}
              className={clsx(
                // Anchor positioning
                '[--anchor-gap:--spacing(2)] [--anchor-padding:--spacing(4)] sm:data-[anchor~=start]:[--anchor-offset:-4px]',
                // Base styles - increased min width for mobile
                'isolate z-50 min-w-[calc(var(--input-width)+24px)] sm:min-w-[calc(var(--input-width)+8px)] scroll-py-1 rounded-xl p-1 select-none empty:invisible',
                // Max height for scrolling
                'max-h-60',
                // Invisible border that is only visible in `forced-colors` mode for accessibility purposes
                'outline outline-transparent focus:outline-hidden',
                // Handle scrolling when menu won't fit in viewport
                'overflow-y-scroll overscroll-contain',
                // Popover background
                'bg-white/75 backdrop-blur-xl dark:bg-zinc-800/75',
                // Shadows
                'shadow-lg ring-1 ring-zinc-950/10 dark:ring-white/10 dark:ring-inset',
                // Transitions
                'transition-opacity duration-100 ease-in data-closed:data-leave:opacity-0 data-transition:pointer-events-none'
              )}
            >
              {({ option }) => children(option)}
            </Headless.ComboboxOptions>
          </>
        )
      }}
    </Headless.Combobox>
  )
}

export function ComboboxSchematicOption<T>({
  children,
  className,
  ...props
}: { className?: string; children?: React.ReactNode } & Omit<
  Headless.ComboboxOptionProps<'div', T>,
  'as' | 'className'
>) {
  let sharedClasses = clsx(
    // Base
    'flex min-w-0 items-center',
    // Icons
    '*:data-[slot=icon]:size-5 *:data-[slot=icon]:shrink-0 sm:*:data-[slot=icon]:size-4',
    '*:data-[slot=icon]:text-zinc-500 group-data-focus/option:*:data-[slot=icon]:text-white dark:*:data-[slot=icon]:text-zinc-400',
    'forced-colors:*:data-[slot=icon]:text-[CanvasText] forced-colors:group-data-focus/option:*:data-[slot=icon]:text-[Canvas]',
    // Avatars
    '*:data-[slot=avatar]:-mx-0.5 *:data-[slot=avatar]:size-6 sm:*:data-[slot=avatar]:size-5'
  )

  return (
    <Headless.ComboboxOption
      {...props}
      className={clsx(
        // Basic layout - adjusted padding for mobile
        'group/option grid w-full cursor-default grid-cols-[1fr_--spacing(5)] items-baseline gap-x-2 rounded-lg py-2 pr-2 pl-3 sm:grid-cols-[1fr_--spacing(4)] sm:py-1.5 sm:pr-2 sm:pl-3',
        // Typography - smaller text on mobile
        'text-sm/5 text-zinc-950 sm:text-sm/6 dark:text-white forced-colors:text-[CanvasText]',
        // Focus
        'outline-hidden data-focus:bg-blue-500 data-focus:text-white',
        // Forced colors mode
        'forced-color-adjust-none forced-colors:data-focus:bg-[Highlight] forced-colors:data-focus:text-[HighlightText]',
        // Disabled
        'data-disabled:opacity-50'
      )}
    >
      <span className={clsx(className, sharedClasses)}>{children}</span>
      <svg
        className="relative col-start-2 hidden size-5 self-center stroke-current group-data-selected/option:inline sm:size-4"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path d="M4 8.5l3 3L12 4" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Headless.ComboboxOption>
  )
}

export function ComboboxSchematicLabel({ className, ...props }: React.ComponentPropsWithoutRef<'span'>) {
  return <span {...props} className={clsx(className, 'ml-0 truncate first:ml-0 sm:ml-2 sm:first:ml-0')} />
}

export function ComboboxSchematicDescription({ className, children, ...props }: React.ComponentPropsWithoutRef<'span'>) {
  return (
    <span
      {...props}
      className={clsx(
        className,
        'flex flex-1 overflow-hidden text-zinc-500 group-data-focus/option:text-white before:w-2 before:min-w-0 before:shrink dark:text-zinc-400'
      )}
    >
      <span className="flex-1 truncate">{children}</span>
    </span>
  )
}
