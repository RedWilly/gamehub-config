/**
 * ConfigForm Component
 * Main form component for creating and editing game configurations
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DirectXHubType, AudioDriverType } from "@prisma/client";
import Image from "next/image";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

import { GeneralConfigFields } from "./GeneralConfigFields";
import { CompatibilityConfigFields } from "./CompatibilityConfigFields";
import { ComponentsConfigFields } from "./ComponentsConfigFields";
import { TagsConfigFields } from "./TagsConfigFields";
import { SubmitButton } from "./SubmitButton";
import { configFormSchema, type ConfigFormValues } from "@/lib/validations/config";

interface ConfigFormProps {
  gameId: string;
  gameName: string;
  gameImageUrl?: string;
  configId?: string;
  defaultValues?: Partial<ConfigFormValues>;
  isEditing?: boolean;
}

/**
 * ConfigForm component for creating and editing game configurations
 * 
 * @param props - Component props
 * @returns React component
 */
export function ConfigForm({
  gameId,
  gameName,
  gameImageUrl,
  configId,
  defaultValues,
  isEditing = false
}: ConfigFormProps): JSX.Element {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("general");
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize form with default values
  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configFormSchema),
    defaultValues: defaultValues || {
      gameId,
      gamehubVersion: "",
      videoUrl: "",
      tags: [],
      changeSummary: "",
      details: {
        language: "",
        gameResolution: "1280x720",
        directxHub: DirectXHubType.DISABLE,
        envVars: "",
        commandLine: "",
        compatLayer: "Proton8.0-x64",
        gpuDriver: "Turnip_v24.4.0",
        audioDriver: AudioDriverType.PULSE,
        dxvkVersion: "",
        vkd3dVersion: "",
        cpuTranslator: "fastpipe",
        cpuCoreLimit: "No Limit",
        vramLimit: "No Limit",
        components: [],
      },
    },
  });

  /**
   * Handle form submission
   * 
   * @param values - Form values
   */
  const onSubmit = async (values: ConfigFormValues): Promise<void> => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare request URL and method based on whether we're creating or editing
      const url = isEditing ? `/api/configs/${configId}` : "/api/configs";
      const method = isEditing ? "PATCH" : "POST";

      // Send request to API with values as is (changeSummary is now part of the form)
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        // Handle error response
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save configuration");
      }

      // Get the saved config data
      const savedConfig = await response.json();

      // Show success message with redirect info
      toast.success(
        isEditing ? "Configuration updated successfully" : "Configuration created successfully",
        {
          description: "Redirecting to configuration page...",
          duration: 2000
        }
      );

      setTimeout(() => {
        router.push(`/configs/${savedConfig.id}`);
      }, 500);
    } catch (error: any) {
      console.error("Error saving configuration:", error);
      setSubmitError(error.message || "Failed to save configuration");
      toast.error(error.message || "Failed to save configuration");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Game Info Card */}
      <div className="flex items-center gap-4 p-4 border rounded-lg bg-card">
        {gameImageUrl && (
          <div className="relative h-16 w-12 overflow-hidden rounded-md">
            <Image
              src={gameImageUrl}
              alt={gameName}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div>
          <h3 className="font-medium">{gameName}</h3>
          <p className="text-sm text-muted-foreground">
            {isEditing ? "Editing configuration" : "Creating new configuration"}
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {submitError && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
              <TabsTrigger value="components">Components</TabsTrigger>
              <TabsTrigger value="tags">Tags</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4 mt-6">
              <GeneralConfigFields form={form} />
            </TabsContent>
            
            <TabsContent value="compatibility" className="space-y-4 mt-6">
              <CompatibilityConfigFields form={form} />
            </TabsContent>
            
            <TabsContent value="components" className="space-y-4 mt-6">
              <ComponentsConfigFields form={form} />
            </TabsContent>
            
            <TabsContent value="tags" className="space-y-4 mt-6">
              <TagsConfigFields form={form} />
              
              {/* Change Summary Field - Only shown when editing */}
              {isEditing && (
                <div className="space-y-2 mt-6">
                  <div className="flex items-center justify-between">
                    <label htmlFor="changeSummary" className="text-sm font-medium">
                      Change Summary
                    </label>
                    <span className="text-xs text-muted-foreground">
                      {form.watch("changeSummary")?.length || 0}/60
                    </span>
                  </div>
                  <input
                    id="changeSummary"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    placeholder="Brief summary of your changes (max 60 characters)"
                    {...form.register("changeSummary")}
                    maxLength={60}
                  />
                  {form.formState.errors.changeSummary && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.changeSummary.message}
                    </p>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            
            <div className="flex gap-2">
              {activeTab !== "general" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const tabs = ["general", "compatibility", "components", "tags"];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex > 0) {
                      setActiveTab(tabs[currentIndex - 1]);
                    }
                  }}
                >
                  Previous
                </Button>
              )}
              
              {activeTab !== "tags" ? (
                <Button
                  type="button"
                  onClick={() => {
                    const tabs = ["general", "compatibility", "components", "tags"];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex < tabs.length - 1) {
                      setActiveTab(tabs[currentIndex + 1]);
                    }
                  }}
                >
                  Next
                </Button>
              ) : (
                <SubmitButton isSubmitting={isSubmitting} isEditing={isEditing} />
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
