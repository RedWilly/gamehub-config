/**
 * CompatibilityConfigFields Component
 * Handles the compatibility configuration fields for game settings
 */

import { UseFormReturn } from "react-hook-form";
import { AudioDriverType } from "@prisma/client";

import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { ConfigFormValues } from "./ConfigForm";

// Compatibility layer presets
const COMPAT_LAYER_PRESETS = [
  { label: "Proton 9.0-x64-2", value: "Proton9.0-x64-2" },
  { label: "Proton 8.0-x64", value: "Proton8.0-x64" },
  { label: "Proton 7.0-x64", value: "Proton7.0-x64" },
  { label: "Proton Experimental", value: "ProtonExperimental" },
  { label: "Wine 9.0", value: "Wine9.0" },
  { label: "Wine 8.0", value: "Wine8.0" },
  { label: "Custom", value: "custom" }
];

// CPU translator presets
const CPU_TRANSLATOR_PRESETS = [
  { label: "fastpipe", value: "fastpipe" },
  { label: "qemu", value: "qemu" },
  { label: "box86", value: "box86" },
  { label: "box64", value: "box64" },
  { label: "Custom", value: "custom" }
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
              <Input 
                placeholder="e.g., 1.9.4" 
                value={field.value || ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            </FormControl>
            <FormDescription>
              The DXVK version used (enter N/A if not applicable)
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
              <Input 
                placeholder="e.g., 2.8" 
                value={field.value || ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            </FormControl>
            <FormDescription>
              The VKD3D version used (enter N/A if not applicable)
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
