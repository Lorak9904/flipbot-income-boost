import { VintedFieldDefinition, VintedFieldMapping } from '@/types/item';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DynamicFieldRendererProps {
  fields: VintedFieldDefinition[];
  values: Record<string, VintedFieldMapping>;  // field_code -> {attribute_id, value_id}
  onChange: (fieldCode: string, attributeId: number, valueId: number) => void;
  sectionTitle?: string;
}

/**
 * Schema-driven dynamic field renderer for Vinted attributes.
 * Renders select dropdowns based on field definitions from backend.
 */
const DynamicFieldRenderer = ({ 
  fields, 
  values, 
  onChange,
  sectionTitle = "Product Attributes"
}: DynamicFieldRendererProps) => {
  
  if (!fields || fields.length === 0) {
    return null;
  }

  const handleFieldChange = (fieldCode: string, attributeId: number, valueId: string) => {
    onChange(fieldCode, attributeId, parseInt(valueId, 10));
  };

  console.log('🎨 Dynamic fields:', { fieldsCount: fields.length, fields, values });
  
  // Debug each field in detail
  fields.forEach((field, idx) => {
    console.log(`🔍 Field ${idx}:`, {
      code: field.code,
      title: field.title,
      id: field.id,
      required: field.required,
      optionsCount: field.options?.length || 0,
      firstOption: field.options?.[0],
      currentValue: values[field.code]
    });
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-300">{sectionTitle}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => {
          const currentValue = values[field.code];
          const selectedValueId = currentValue?.value_id?.toString() || "";
          
          console.log(`🎯 Rendering field '${field.code}':`, { 
            title: field.title, 
            selectedValueId, 
            optionsCount: field.options?.length 
          });
          
          return (
            <div key={field.code} className="space-y-2">
              <Label htmlFor={`field-${field.code}`} className="text-neutral-300">
                {field.title}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              
              <Select
                value={selectedValueId}
                onValueChange={(value) => handleFieldChange(field.code, field.id, value)}
              >
                <SelectTrigger id={`field-${field.code}`} className="text-black">
                  <SelectValue placeholder={`Select ${field.title.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((option) => (
                    <SelectItem key={option.id} value={option.id.toString()}>
                      {option.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Show description if available */}
              {field.options.find(opt => opt.id.toString() === selectedValueId)?.description && (
                <p className="text-sm text-gray-500">
                  {field.options.find(opt => opt.id.toString() === selectedValueId)?.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DynamicFieldRenderer;
