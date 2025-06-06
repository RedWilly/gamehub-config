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

import { ConfigFormValues } from "./ConfigForm";

// Compatibility layer presets
const COMPAT_LAYER_PRESETS = [
  { label: "Proton 9.0-arm64x-2", value: "Proton9.0-arm64x-2" },
  { label: "Proton 9.0-x64-2", value: "Proton9.0-x64-2" },
  { label: "Proton 7.0-x64", value: "Proton7.0-x64" },
  { label: "Wine 10.0-x64-1", value: "wine10.0-x64-1" },
  { label: "Wine 9.5.0-x64-1", value: "wine9.5.0-x64-1" },
  { label: "Wine 9.16-x64-1", value: "wine9.16-x64-1" },
];

// CPU translator presets
const CPU_TRANSLATOR_PRESETS = [
  { label: "Box64-0.35", value: "Box64-0.35" },
  { label: "Box64-0.32.1", value: "Box64-0.32.1" },
  { label: "Box64-0.28", value: "Box64-0.28" },
];

// VKD3D translator presets
const VKD3D_TRANSLATOR_PRESETS = [
  { label: "Vkd3d-proton-2.14.1", value: "vkd3d-proton-2.14.1" },
  { label: "Vkd3d-2.13", value: "vkd3d-2.13" },
  { label: "Vkd3d-2.12", value: "vkd3d-2.12" },
  { label: "None", value: "none" }
];

// DXVK translator presets
const DXVK_TRANSLATOR_PRESETS = [
  { label: "Dxvk-2.6.1-async", value: "dxvk-2.6.1-async" },
  { label: "Dxvk-2.6", value: "dxvk-2.6" },
  { label: "Dxvk-2.5.3", value: "dxvk-2.5.3" },
  { label: "Dxvk-2.4", value: "dxvk-2.4" },
  { label: "Dxvk-2.3.1", value: "dxvk-2.3.1" },
  { label: "Dxvk-2.2", value: "dxvk-2.2" },
  { label: "None", value: "none" }
];

// CPU core limit options
const CPU_CORE_LIMITS = [
  { label: "No Limit", value: "No Limit" },
  { label: "1 Core", value: "1 Core" },
  { label: "2 Cores", value: "2 Cores" },
  { label: "3 Cores", value: "3 Cores" },
  { label: "4 Cores", value: "4 Cores" },
  { label: "5 Cores", value: "5 Cores" },
  { label: "6 Cores", value: "6 Cores" },
  { label: "7 Cores", value: "7 Cores" }
];

// VRAM limit options
const VRAM_LIMITS = [
  { label: "No Limit", value: "No Limit" },
  { label: "512MB", value: "512MB" },
  { label: "1GB", value: "1GB" },
  { label: "2GB", value: "2GB" },
  { label: "3GB", value: "3GB" },
  { label: "4GB", value: "4GB" }
];

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
    </div>
  );
}
