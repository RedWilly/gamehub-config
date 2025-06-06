/**
 * TagsConfigFields Component
 * Handles the tags selection for game configurations
 */

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { X, Plus } from "lucide-react";

import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { ConfigFormValues } from "./ConfigForm";

// Predefined tags that users can select from
const PREDEFINED_TAGS = [
  { id: "optimized-fps", label: "Optimized for FPS" },
  { id: "low-end-devices", label: "Low-end Devices" },
];

interface TagsConfigFieldsProps {
  form: UseFormReturn<ConfigFormValues>;
}

/**
 * TagsConfigFields component for managing configuration tags
 * 
 * @param props - Component props
 * @returns React component
 */
export function TagsConfigFields({ form }: TagsConfigFieldsProps): JSX.Element {
  const [customTag, setCustomTag] = useState<string>("");
  
  // Get the current tags from the form
  const selectedTags = form.watch("tags") || [];

  /**
   * Toggles a predefined tag selection
   * 
   * @param checked - Whether the tag is checked
   * @param tagLabel - The tag label to toggle
   */
  const togglePredefinedTag = (checked: boolean, tagLabel: string): void => {
    const updatedTags = checked
      ? [...selectedTags, tagLabel]
      : selectedTags.filter(tag => tag !== tagLabel);
    
    form.setValue("tags", updatedTags);
  };

  /**
   * Adds a custom tag to the list
   */
  const addCustomTag = (): void => {
    if (!customTag.trim()) return;
    
    // Check if tag already exists (case insensitive)
    const exists = selectedTags.some(
      tag => tag.toLowerCase() === customTag.trim().toLowerCase()
    );
    
    if (!exists) {
      const updatedTags = [...selectedTags, customTag.trim()];
      form.setValue("tags", updatedTags);
    }
    
    setCustomTag("");
  };

  /**
   * Removes a tag from the list
   * 
   * @param tagToRemove - The tag to remove
   */
  const removeTag = (tagToRemove: string): void => {
    const updatedTags = selectedTags.filter(tag => tag !== tagToRemove);
    form.setValue("tags", updatedTags);
  };

  /**
   * Handles key press events in the input field
   * 
   * @param e - Keyboard event
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomTag();
    }
  };

  /**
   * Checks if a predefined tag is selected
   * 
   * @param tagLabel - The tag label to check
   * @returns Whether the tag is selected
   */
  const isTagSelected = (tagLabel: string): boolean => {
    return selectedTags.includes(tagLabel);
  };

  /**
   * Gets custom tags that are not in the predefined list
   * 
   * @returns Array of custom tags
   */
  const getCustomTags = (): string[] => {
    const predefinedLabels = PREDEFINED_TAGS.map(tag => tag.label);
    return selectedTags.filter(tag => !predefinedLabels.includes(tag));
  };

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="tags"
        render={() => (
          <FormItem>
            <FormLabel>Tags</FormLabel>
            <FormDescription className="mb-4">
              Select tags that describe your configuration. These help with discoverability and SEO.
            </FormDescription>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {PREDEFINED_TAGS.map((tag) => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={tag.id}
                      checked={isTagSelected(tag.label)}
                      onCheckedChange={(checked) => togglePredefinedTag(!!checked, tag.label)}
                    />
                    <label
                      htmlFor={tag.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {tag.label}
                    </label>
                  </div>
                ))}
              </div>
              
              <div>
                <FormLabel className="text-sm">Custom Tags</FormLabel>
                <div className="flex space-x-2 mt-1">
                  <FormControl>
                    <Input
                      placeholder="Add custom tag"
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                  </FormControl>
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={addCustomTag}
                    disabled={!customTag.trim()}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
              
              {selectedTags.length > 0 && (
                <div className="border rounded-md p-4">
                  <FormLabel className="text-sm mb-2 block">Selected Tags</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {PREDEFINED_TAGS.filter(tag => isTagSelected(tag.label)).map((tag) => (
                      <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
                        {tag.label}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-destructive" 
                          onClick={() => removeTag(tag.label)} 
                        />
                      </Badge>
                    ))}
                    
                    {getCustomTags().map((tag, index) => (
                      <Badge key={`custom-${index}`} variant="outline" className="flex items-center gap-1">
                        {tag}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-destructive" 
                          onClick={() => removeTag(tag)} 
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
