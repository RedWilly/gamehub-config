/**
 * GeneralConfigFields Component
 * Handles the general configuration fields for game settings
 */

import { UseFormReturn } from "react-hook-form";
import { DirectXHubType } from "@prisma/client";

import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {type ConfigFormValues } from "@/lib/validations/config";


// Common resolution presets
const RESOLUTION_PRESETS = [
  {label: "800 x 600", value: "800x600"},
  { label: "960 x 544", value: "960x544" },
  { label: "1280 x 720", value: "1280x720" },
  { label: "1920 x 1080", value: "1920x1080" },
  { label: "Custom", value: "custom" } // Custom resolution format: "width x height"
];

// Language presets
const LANGUAGE_PRESETS = [
  { label: "English (US)", value: "en_US" },
  { label: "English (UK)", value: "en_GB" },
  { label: "French", value: "fr_FR" },
  { label: "German", value: "de_DE" },
  { label: "Spanish", value: "es_ES" },
  { label: "Italian", value: "it_IT" },
  { label: "Japanese", value: "ja_JP" },
  { label: "Korean", value: "ko_KR" },
  { label: "Russian", value: "ru_RU" },
  { label: "Chinese (Simplified)", value: "zh_CN" },
  { label: "Chinese (Traditional)", value: "zh_TW" },
  { label: "Custom", value: "custom" } // Custom language code
];

interface GeneralConfigFieldsProps {
  form: UseFormReturn<ConfigFormValues>;
}

/**
 * GeneralConfigFields component for the general section of the config form
 * 
 * @param props - Component props
 * @returns React component
 */
export function GeneralConfigFields({ form }: GeneralConfigFieldsProps): JSX.Element {
  // Get the current value of the resolution field
  const resolutionValue = form.watch("details.gameResolution");
  const isCustomResolution = !RESOLUTION_PRESETS.some(preset => preset.value === resolutionValue);
  
  // Get the current value of the language field
  const languageValue = form.watch("details.language");
  const isCustomLanguage = languageValue && !LANGUAGE_PRESETS.some(preset => preset.value === languageValue);

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="gamehubVersion"
        render={({ field }) => (
          <FormItem>
            <FormLabel>GameHub Version</FormLabel>
            <FormControl>
              <Input placeholder="e.g., 1.2.3" {...field} />
            </FormControl>
            <FormDescription>
              The version of GameHub emulator used for this configuration
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="details.language"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Language</FormLabel>
            <Select
              onValueChange={(value) => {
                if (value === "custom") {
                  // If custom is selected, don't update the field yet
                  return;
                }
                field.onChange(value);
              }}
              value={isCustomLanguage ? "custom" : field.value || ""}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {LANGUAGE_PRESETS.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              The language setting for the game (optional)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Show custom language input if "Custom" is selected */}
      {isCustomLanguage && (
        <FormItem>
          <FormLabel>Custom Language</FormLabel>
          <FormControl>
            <Input
              placeholder="e.g., pt_BR"
              value={languageValue || ""}
              onChange={(e) => form.setValue("details.language", e.target.value)}
            />
          </FormControl>
          <FormDescription>
            Enter a custom language code (e.g., pt_BR for Brazilian Portuguese)
          </FormDescription>
        </FormItem>
      )}

      <FormField
        control={form.control}
        name="details.gameResolution"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Game Resolution</FormLabel>
            <Select
              onValueChange={(value) => {
                if (value === "custom") {
                  // If custom is selected, don't update the field yet
                  return;
                }
                field.onChange(value);
              }}
              value={isCustomResolution ? "custom" : field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select resolution" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {RESOLUTION_PRESETS.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              The resolution at which the game will run
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Show custom resolution input if "Custom" is selected or if the current value is not in presets */}
      {isCustomResolution && (
        <FormItem>
          <FormLabel>Custom Resolution</FormLabel>
          <FormControl>
            <Input
              placeholder="e.g., 1366x768"
              value={resolutionValue}
              onChange={(e) => form.setValue("details.gameResolution", e.target.value)}
            />
          </FormControl>
          <FormDescription>
            Enter a custom resolution in the format widthxheight (e.g., 1366x768)
          </FormDescription>
        </FormItem>
      )}

      <FormField
        control={form.control}
        name="details.directxHub"
        render={({ field }) => (
          <FormItem>
            <FormLabel>DirectX Hub</FormLabel>
            <Select
              onValueChange={(value) => field.onChange(value as DirectXHubType)}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select DirectX Hub option" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={DirectXHubType.DISABLE}>Disable</SelectItem>
                <SelectItem value={DirectXHubType.SIMPLE}>Simple</SelectItem>
                <SelectItem value={DirectXHubType.COMPLETE}>Complete</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              DirectX Hub configuration for the game
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="details.envVars"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Environment Variables</FormLabel>
            <FormControl>
              <Textarea
                placeholder="e.g., WINEDEBUG=-all"
                className="resize-y"
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormDescription>
              Optional environment variables for the game (one per line)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="details.commandLine"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Command Line</FormLabel>
            <FormControl>
              <Textarea
                placeholder="e.g., -windowed -novid"
                className="resize-y"
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormDescription>
              Optional command line arguments for the game
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="videoUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Video URL</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., https://youtube.com/watch?v=..."
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormDescription>
              Optional YouTube or other video URL showing your config in action
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
