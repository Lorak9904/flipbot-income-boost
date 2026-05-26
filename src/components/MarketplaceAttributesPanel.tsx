import type {
  MarketplaceAttributeField,
  MarketplaceAttributeState,
  MarketplaceAttributeValue,
  Platform,
} from '@/types/item';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface MarketplaceAttributesPanelProps {
  platform: Platform;
  platformLabel: string;
  state?: MarketplaceAttributeState;
  disabled?: boolean;
  onValueChange: (
    platform: Platform,
    field: MarketplaceAttributeField,
    value: MarketplaceAttributeValue
  ) => void;
}

function optionValue(field: MarketplaceAttributeField, rawValue: string): string | number {
  const option = (field.options || []).find((item) => String(item.value) === rawValue);
  return option?.value ?? rawValue;
}

function selectedScalar(value?: MarketplaceAttributeValue): string {
  if (!value) {
    return '';
  }
  const selected = value.value_id ?? value.value;
  return selected === undefined || selected === null ? '' : String(selected);
}

function selectedList(value?: MarketplaceAttributeValue): string[] {
  if (!value) {
    return [];
  }
  if (Array.isArray(value.value_ids)) {
    return value.value_ids.map(String);
  }
  if (Array.isArray(value.values)) {
    return value.values.map(String);
  }
  const scalar = selectedScalar(value);
  return scalar ? [scalar] : [];
}

function baseValue(field: MarketplaceAttributeField): MarketplaceAttributeValue {
  return {
    native_code: field.native_code,
    native_id: field.native_id,
  };
}

export default function MarketplaceAttributesPanel({
  platform,
  platformLabel,
  state,
  disabled = false,
  onValueChange,
}: MarketplaceAttributesPanelProps) {
  const fields = state?.fields || [];
  const values = state?.values || {};

  if (!fields.length) {
    return null;
  }

  const requiredFields = fields.filter((field) => field.required);
  const optionalFields = fields.filter((field) => !field.required);

  const renderField = (field: MarketplaceAttributeField) => {
    const currentValue = values[field.key];
    const inputType = field.input_type || field.type || 'text';
    const selected = selectedScalar(currentValue);
    const fieldId = `${platform}-attr-${field.key.replace(/[^a-zA-Z0-9_-]/g, '-')}`;

    if (inputType === 'select' && field.options?.length) {
      return (
        <Select
          value={selected}
          onValueChange={(value) =>
            onValueChange(platform, field, {
              ...baseValue(field),
              value_id: optionValue(field, value),
            })
          }
          disabled={disabled}
        >
          <SelectTrigger id={fieldId} className="text-black">
            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={String(option.value)} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (inputType === 'multi_select' && field.options?.length) {
      const selectedValues = selectedList(currentValue);
      const selectedSet = new Set(selectedValues);
      const limit = field.selection_limit;

      return (
        <div className="rounded-md border border-neutral-700 bg-neutral-900/60">
          <div className="flex items-center justify-between border-b border-neutral-800 px-3 py-2">
            <span className="text-xs text-neutral-400">
              {selectedValues.length} selected{limit ? ` / ${limit}` : ''}
            </span>
            {limit && selectedValues.length >= limit && (
              <Badge variant="secondary" className="text-[10px]">
                Limit reached
              </Badge>
            )}
          </div>
          <div className="max-h-48 space-y-1 overflow-y-auto p-2">
            {field.options.map((option) => {
              const value = String(option.value);
              const checked = selectedSet.has(value);
              const limitReached = Boolean(limit && selectedValues.length >= limit && !checked);

              return (
                <label
                  key={value}
                  className={cn(
                    'flex cursor-pointer items-start gap-2 rounded-md px-2 py-2 text-sm text-neutral-200 hover:bg-neutral-800',
                    (disabled || limitReached) && 'cursor-not-allowed opacity-60'
                  )}
                >
                  <Checkbox
                    checked={checked}
                    disabled={disabled || limitReached}
                    onCheckedChange={(nextChecked) => {
                      const isChecked = nextChecked === true;
                      const nextValues = isChecked
                        ? [...selectedValues, value]
                        : selectedValues.filter((item) => item !== value);
                      onValueChange(platform, field, {
                        ...baseValue(field),
                        value_ids: nextValues.map((item) => optionValue(field, item)),
                      });
                    }}
                  />
                  <span>
                    {option.label}
                    {option.description && (
                      <span className="block text-xs text-neutral-500">{option.description}</span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <Input
        id={fieldId}
        type={inputType === 'number' ? 'number' : 'text'}
        value={selected}
        onChange={(event) =>
          onValueChange(platform, field, {
            ...baseValue(field),
            value: event.target.value,
          })
        }
        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
        disabled={disabled}
      />
    );
  };

  const renderGroup = (groupFields: MarketplaceAttributeField[]) => (
    <div className="grid grid-cols-1 gap-3">
      {groupFields.map((field) => (
        <div key={field.key} className="space-y-1">
          <div className="flex items-center justify-between gap-3">
            <Label className="text-xs text-neutral-300">
              {field.label}
              {field.required && <span className="ml-1 text-red-400">*</span>}
            </Label>
            {field.source && (
              <span className="text-[10px] text-neutral-600">{field.source}</span>
            )}
          </div>
          {field.description && (
            <p className="text-xs text-neutral-500">{field.description}</p>
          )}
          {renderField(field)}
        </div>
      ))}
    </div>
  );

  return (
    <Card className="border-neutral-700 bg-neutral-800/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-300">
          {platformLabel} attributes
          <Badge variant="outline" className="border-neutral-600 text-[10px] text-neutral-400">
            {fields.length}
          </Badge>
        </CardTitle>
        <CardDescription className="text-xs text-neutral-500">
          Category-specific values used only for this marketplace.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {requiredFields.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-neutral-400">
              Required attributes ({requiredFields.length})
            </p>
            {renderGroup(requiredFields)}
          </div>
        )}

        {optionalFields.length > 0 && (
          <details className="space-y-3">
            <summary className="cursor-pointer text-xs font-medium text-neutral-500 hover:text-neutral-400">
              Optional attributes ({optionalFields.length})
            </summary>
            <div className="pt-3">{renderGroup(optionalFields)}</div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
