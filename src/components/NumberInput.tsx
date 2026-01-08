import { Input } from '@heroui/react';
import { NumericFormat } from 'react-number-format';
import { forwardRef } from 'react';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  labelPlacement?: 'inside' | 'outside' | 'outside-left';
  placeholder?: string;
  variant?: 'flat' | 'bordered' | 'faded' | 'underlined';
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  description?: string;
  className?: string;
  min?: number;
  max?: number;
  decimalScale?: number;
  allowNegative?: boolean;
}

/**
 * Custom number input component that:
 * - Accepts both . and , as decimal delimiters
 * - Limits decimal places (default: 2)
 * - Integrates with HeroUI's Input component
 * - Works with react-number-format for proper number formatting
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      onChange,
      label,
      labelPlacement = 'outside',
      placeholder = '0.00',
      variant = 'flat',
      startContent,
      endContent,
      description,
      className,
      min,
      max,
      decimalScale = 2,
      allowNegative = false,
    },
    ref
  ) => {
    return (
      <NumericFormat
        value={value}
        onValueChange={(values) => {
          const numValue = values.floatValue || 0;

          // Apply min/max constraints
          let constrainedValue = numValue;
          if (min !== undefined && constrainedValue < min) {
            constrainedValue = min;
          }
          if (max !== undefined && constrainedValue > max) {
            constrainedValue = max;
          }

          onChange(constrainedValue);
        }}
        // Handle both . and , as decimal separators during input
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          // Replace comma with period for decimal input
          if (e.key === ',') {
            e.preventDefault();
            const input = e.currentTarget;
            const start = input.selectionStart || 0;
            const end = input.selectionEnd || 0;
            const currentValue = input.value;

            // Check if there's already a decimal separator
            if (!currentValue.includes('.')) {
              const newValue =
                currentValue.substring(0, start) +
                '.' +
                currentValue.substring(end);

              // Manually trigger the input change
              const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype,
                'value'
              )?.set;

              if (nativeInputValueSetter) {
                nativeInputValueSetter.call(input, newValue);
                const event = new Event('input', { bubbles: true });
                input.dispatchEvent(event);

                // Set cursor position after the inserted period
                setTimeout(() => {
                  input.setSelectionRange(start + 1, start + 1);
                }, 0);
              }
            }
          }
        }}
        customInput={Input}
        getInputRef={ref}
        // Use . as the decimal separator (comma will be converted)
        thousandSeparator={false}
        decimalSeparator="."
        // Validate input values
        isAllowed={(values) => {
          const { floatValue } = values;

          // Allow empty value
          if (floatValue === undefined) return true;

          // Apply min/max validation during typing
          if (min !== undefined && floatValue < min) return false;
          if (max !== undefined && floatValue > max) return false;

          return true;
        }}
        decimalScale={decimalScale}
        fixedDecimalScale={false}
        allowNegative={allowNegative}
        // HeroUI Input props
        label={label}
        labelPlacement={labelPlacement}
        placeholder={placeholder}
        variant={variant}
        startContent={startContent}
        endContent={endContent}
        description={description}
        className={className}
      />
    );
  }
);

NumberInput.displayName = 'NumberInput';
