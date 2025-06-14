/**
 * Config Preset Constants
 * 
 * This file centralizes all preset constants used across config forms and validation.
 * It provides a single source of truth for preset values that can be used in both
 * form components and validation schemas.
 */

/**
 * Interface for preset option with label and value
 */
export interface PresetOption {
  label: string;
  value: string;
}

/**
 * Interface for tag preset with id and label
 */
export interface TagPreset {
  id: string;
  label: string;
}

/**
 * Common resolution presets
 */
export const RESOLUTION_PRESETS: PresetOption[] = [
  { label: "800 x 600", value: "800x600" },
  { label: "960 x 544", value: "960x544" },
  { label: "1280 x 720", value: "1280x720" },
  { label: "1920 x 1080", value: "1920x1080" },
  { label: "Custom", value: "custom" } // Custom resolution format: "width x height"
];

/**
 * Language presets
 */
export const LANGUAGE_PRESETS: PresetOption[] = [
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

/**
 * Predefined tags for configs
 */
export const PREDEFINED_TAGS: TagPreset[] = [
  { id: "optimized-fps", label: "Optimized for FPS" },
  { id: "low-end-devices", label: "Low-end Devices" },
];

/**
 * Compatibility layer presets
 */
export const COMPAT_LAYER_PRESETS: PresetOption[] = [
  { label: "Proton 9.0-arm64x-2", value: "Proton9.0-arm64x-2" },
  { label: "Proton 9.0-x64-2", value: "Proton9.0-x64-2" },
  { label: "Wine 10.0-x64-1", value: "wine10.0-x64-1" },
  { label: "Wine 9.5.0-x64-1", value: "wine9.5.0-x64-1" },
  { label: "Wine 9.16-x64-1", value: "wine9.16-x64-1" },
];

/**
 * CPU translator presets
 */
export const CPU_TRANSLATOR_PRESETS: PresetOption[] = [
  { label: "Box64-0.35", value: "Box64-0.35" },
  { label: "Box64-0.32.1", value: "Box64-0.32.1" },
  { label: "Box64-0.28", value: "Box64-0.28" },
];

/**
 * VKD3D translator presets
 */
export const VKD3D_TRANSLATOR_PRESETS: PresetOption[] = [
  { label: "Vkd3d-proton-2.14.1", value: "vkd3d-proton-2.14.1" },
  { label: "Vkd3d-2.13", value: "vkd3d-2.13" },
  { label: "Vkd3d-2.12", value: "vkd3d-2.12" },
  { label: "None", value: "none" }
];

/**
 * DXVK translator presets
 */
export const DXVK_TRANSLATOR_PRESETS: PresetOption[] = [
  { label: "Dxvk-2.6.1-async", value: "dxvk-2.6.1-async" },
  { label: "Dxvk-2.6", value: "dxvk-2.6" },
  { label: "Dxvk-2.5.3", value: "dxvk-2.5.3" },
  { label: "Dxvk-2.4", value: "dxvk-2.4" },
  { label: "Dxvk-2.3.1", value: "dxvk-2.3.1" },
  { label: "Dxvk-2.2", value: "dxvk-2.2" },
  { label: "None", value: "none" }
];

/**
 * CPU core limit options
 */
export const CPU_CORE_LIMITS: PresetOption[] = [
  { label: "No Limit", value: "No Limit" },
  { label: "1 Core", value: "1 Core" },
  { label: "2 Cores", value: "2 Cores" },
  { label: "3 Cores", value: "3 Cores" },
  { label: "4 Cores", value: "4 Cores" },
  { label: "5 Cores", value: "5 Cores" },
  { label: "6 Cores", value: "6 Cores" },
  { label: "7 Cores", value: "7 Cores" }
];

/**
 * VRAM limit options
 */
export const VRAM_LIMITS: PresetOption[] = [
  { label: "No Limit", value: "No Limit" },
  { label: "512MB", value: "512MB" },
  { label: "1GB", value: "1GB" },
  { label: "2GB", value: "2GB" },
  { label: "3GB", value: "3GB" },
  { label: "4GB", value: "4GB" }
];

// Extract values for validation
export const RESOLUTION_VALUES = RESOLUTION_PRESETS.map(preset => preset.value);
export const LANGUAGE_VALUES = LANGUAGE_PRESETS.map(preset => preset.value);
export const COMPAT_LAYER_VALUES = COMPAT_LAYER_PRESETS.map(preset => preset.value);
export const CPU_TRANSLATOR_VALUES = CPU_TRANSLATOR_PRESETS.map(preset => preset.value);
export const VKD3D_VALUES = VKD3D_TRANSLATOR_PRESETS.map(preset => preset.value);
export const DXVK_VALUES = DXVK_TRANSLATOR_PRESETS.map(preset => preset.value);
export const CPU_CORE_LIMIT_VALUES = CPU_CORE_LIMITS.map(preset => preset.value);
export const VRAM_LIMIT_VALUES = VRAM_LIMITS.map(preset => preset.value);
export const TAG_IDS = PREDEFINED_TAGS.map(tag => tag.id);

/**
 * Common tags for filtering in search interfaces
 */
export const COMMON_TAGS = [
  "Optimized for FPS",
  "Low-end Devices",
];

/**
 * Sort options for config listings
 */
export const SORT_OPTIONS = [
  { label: "Most Popular", value: "popular" },
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Recently Updated", value: "updated" }
];
