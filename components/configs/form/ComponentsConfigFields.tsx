/**
 * ComponentsConfigFields Component
 * Handles the optional components list for game configurations
 */

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { X, Plus } from "lucide-react";

import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {type ConfigFormValues } from "@/lib/validations/config";

interface ComponentsConfigFieldsProps {
  form: UseFormReturn<ConfigFormValues>;
}

/**
 * ComponentsConfigFields component for managing the list of additional components
 * 
 * @param props - Component props
 * @returns React component
 */
export function ComponentsConfigFields({ form }: ComponentsConfigFieldsProps): JSX.Element {
  const [newComponent, setNewComponent] = useState<string>("");
  
  // Get the current components from the form
  const components = form.watch("details.components") || [];

  /**
   * Adds a new component to the list
   */
  const addComponent = (): void => {
    if (!newComponent.trim()) return;
    
    // Check if component already exists (case insensitive)
    const exists = components.some(
      (comp) => comp.toLowerCase() === newComponent.trim().toLowerCase()
    );
    
    if (!exists) {
      const updatedComponents = [...components, newComponent.trim()];
      form.setValue("details.components", updatedComponents);
    }
    
    setNewComponent("");
  };

  /**
   * Removes a component from the list
   * 
   * @param index - Index of the component to remove
   */
  const removeComponent = (index: number): void => {
    const updatedComponents = [...components];
    updatedComponents.splice(index, 1);
    form.setValue("details.components", updatedComponents);
  };

  /**
   * Handles key press events in the input field
   * 
   * @param e - Keyboard event
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      e.preventDefault();
      addComponent();
    }
  };

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="details.components"
        render={() => (
          <FormItem>
            <FormLabel>Additional Components</FormLabel>
            <FormDescription className="mb-2">
              List any additional components or libraries required for this configuration
            </FormDescription>
            
            <div className="flex space-x-2 mb-4">
              <FormControl>
                <Input
                  placeholder="e.g., DirectX 11 Runtime"
                  value={newComponent}
                  onChange={(e) => setNewComponent(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </FormControl>
              <Button 
                type="button" 
                size="icon" 
                onClick={addComponent}
                disabled={!newComponent.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <FormMessage />
            
            {components.length > 0 ? (
              <div className="border rounded-md p-4 mt-2">
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-2">
                    {components.map((component, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{component}</span>
                        <Badge
                          variant="outline"
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeComponent(index)}
                        >
                          <X className="h-3 w-3" />
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground mt-2">
                No components added yet
              </div>
            )}
          </FormItem>
        )}
      />
    </div>
  );
}
