/**
 * CompatibilityConfigFields Component
 * Handles the compatibility configuration fields for game settings
 */

import { UseFormReturn } from "react-hook-form";
import { AudioDriverType } from "@prisma/client";
import { useState, useEffect } from "react";

import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { type ConfigFormValues } from "@/lib/validations/config";
import { 
  COMPAT_LAYER_PRESETS,
  CPU_TRANSLATOR_PRESETS,
  VKD3D_TRANSLATOR_PRESETS,
  DXVK_TRANSLATOR_PRESETS,
  CPU_CORE_LIMITS,
  VRAM_LIMITS
} from "@/lib/constants/config-presets";

interface CompatibilityConfigFieldsProps {
  form: UseFormReturn<ConfigFormValues>;
}

/**
 * CompatibilityConfigFields component for the compatibility section of the config form
 * 
 * @param props - Component props
 * @returns React component
 */
export function CompatibilityConfigFields({ form }: CompatibilityConfigFieldsProps): JSX.Element {
  // Get current values for custom fields
  const compatLayerValue = form.watch("details.compatLayer");
  const isCustomCompatLayer = !COMPAT_LAYER_PRESETS.some(preset => preset.value === compatLayerValue);
  
  const cpuTranslatorValue = form.watch("details.cpuTranslator");
  const isCustomCpuTranslator = !CPU_TRANSLATOR_PRESETS.some(preset => preset.value === cpuTranslatorValue);

  // Use explicit state for custom version checkboxes
  const [isCustomVkd3dVersion, setIsCustomVkd3dVersion] = useState(false);
  const [isCustomDxvkVersion, setIsCustomDxvkVersion] = useState(false);

  // Initialize with default values from presets if not set
  useEffect(() => {
    if (!form.getValues("details.dxvkVersion")) {
      form.setValue("details.dxvkVersion", DXVK_TRANSLATOR_PRESETS[0].value);
    }
    if (!form.getValues("details.vkd3dVersion")) {
      form.setValue("details.vkd3dVersion", VKD3D_TRANSLATOR_PRESETS[0].value);
    }
  }, [form]);

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="details.compatLayer"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Compatibility Layer</FormLabel>
            <Select
              onValueChange={(value) => {
                if (value === "custom") {
                  // If custom is selected, don't update the field yet
                  return;
                }
                field.onChange(value);
              }}
              value={isCustomCompatLayer ? "custom" : (field.value || "")}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select compatibility layer" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {COMPAT_LAYER_PRESETS.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              The compatibility layer used to run the game
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Show custom compatibility layer input if needed */}
      {isCustomCompatLayer && (
        <FormItem>
          <FormLabel>Custom Compatibility Layer</FormLabel>
          <FormControl>
            <Input 
              placeholder="Enter custom compatibility layer" 
              value={compatLayerValue || ""}
              onChange={(e) => form.setValue("details.compatLayer", e.target.value)}
              className="mt-2"
            />
          </FormControl>
          <FormDescription>
            Enter a custom compatibility layer
          </FormDescription>
        </FormItem>
      )}

      <FormField
        control={form.control}
        name="details.gpuDriver"
        render={({ field }) => (
          <FormItem>
            <FormLabel>GPU Driver</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter GPU driver" 
                value={field.value || ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            </FormControl>
            <FormDescription>
              The GPU driver used for the game
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="details.audioDriver"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Audio Driver</FormLabel>
            <Select
              onValueChange={(value) => field.onChange(value as AudioDriverType)}
              value={field.value || ""}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select audio driver" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={AudioDriverType.PULSE}>Pulse</SelectItem>
                <SelectItem value={AudioDriverType.ALSA}>Alsa</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              The audio driver used for the game
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="details.dxvkVersion"
        render={({ field }) => (
          <FormItem>
            <FormLabel>DXVK Version</FormLabel>
            <FormControl>
              {isCustomDxvkVersion ? (
                <Input 
                  placeholder="e.g., 1.9.4" 
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              ) : (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || ""}
                  value={field.value || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select DXVK version" />
                  </SelectTrigger>
                  <SelectContent>
                    {DXVK_TRANSLATOR_PRESETS.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormControl>
            <div className="flex items-center mt-2">
              <Checkbox
                id="custom-dxvk-version"
                checked={isCustomDxvkVersion}
                onCheckedChange={(checked) => {
                  if (checked) {
                    form.setValue("details.dxvkVersion", "");
                  } else {
                    form.setValue("details.dxvkVersion", DXVK_TRANSLATOR_PRESETS[0].value);
                  }
                  setIsCustomDxvkVersion(!!checked);
                }}
              />
              <label
                htmlFor="custom-dxvk-version"
                className="text-sm font-medium leading-none ml-2 cursor-pointer"
              >
                Use custom DXVK version
              </label>
            </div>
            <FormDescription>
              The DXVK version used (enter N/A if set yours as None)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="details.vkd3dVersion"
        render={({ field }) => (
          <FormItem>
            <FormLabel>VKD3D Version</FormLabel>
            <FormControl>
              {isCustomVkd3dVersion ? (
                <Input 
                  placeholder="e.g., 2.8" 
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              ) : (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || ""}
                  value={field.value || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select VKD3D version" />
                  </SelectTrigger>
                  <SelectContent>
                    {VKD3D_TRANSLATOR_PRESETS.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormControl>
            <div className="flex items-center mt-2">
              <Checkbox
                id="custom-vkd3d-version"
                checked={isCustomVkd3dVersion}
                onCheckedChange={(checked) => {
                  if (checked) {
                    form.setValue("details.vkd3dVersion", "");
                  } else {
                    form.setValue("details.vkd3dVersion", VKD3D_TRANSLATOR_PRESETS[0].value);
                  }
                  setIsCustomVkd3dVersion(!!checked);
                }}
              />
              <label
                htmlFor="custom-vkd3d-version"
                className="text-sm font-medium leading-none ml-2 cursor-pointer"
              >
                Use custom VKD3D version
              </label>
            </div>
            <FormDescription>
              The VKD3D version used (enter N/A if set yours as None)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="details.cpuTranslator"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CPU Translator</FormLabel>
            <Select
              onValueChange={(value) => {
                if (value === "custom") {
                  // If custom is selected, don't update the field yet
                  return;
                }
                field.onChange(value);
              }}
              value={isCustomCpuTranslator ? "custom" : (field.value || "")}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select CPU translator" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {CPU_TRANSLATOR_PRESETS.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              The CPU translator used for the game
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Show custom CPU translator input if needed */}
      {isCustomCpuTranslator && (
        <FormItem>
          <FormLabel>Custom CPU Translator</FormLabel>
          <FormControl>
            <Input 
              placeholder="Enter custom CPU translator" 
              value={cpuTranslatorValue || ""}
              onChange={(e) => form.setValue("details.cpuTranslator", e.target.value)}
              className="mt-2"
            />
          </FormControl>
          <FormDescription>
            Enter a custom CPU translator
          </FormDescription>
        </FormItem>
      )}

      <FormField
        control={form.control}
        name="details.cpuCoreLimit"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CPU Core Limit</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value || ""}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select CPU core limit" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {CPU_CORE_LIMITS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              Limit the number of CPU cores used by the game
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="details.vramLimit"
        render={({ field }) => (
          <FormItem>
            <FormLabel>VRAM Limit</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value || ""}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select VRAM limit" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {VRAM_LIMITS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              Limit the amount of video memory used by the game
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="details.notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Notes</FormLabel>
            <FormControl>
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Add any additional notes, tips, or context about this configuration... translation params, etc."
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormDescription>
              Optional notes about specific settings, Translation Params, or other details that might help
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
