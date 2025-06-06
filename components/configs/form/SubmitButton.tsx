/**
 * SubmitButton Component
 * Button for submitting config forms with loading state
 */

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";

interface SubmitButtonProps extends ButtonProps {
  isSubmitting: boolean;
  isEditing?: boolean;
}

/**
 * SubmitButton component for form submission with loading state
 * 
 * @param props - Component props
 * @returns React component
 */
export function SubmitButton({
  isSubmitting,
  isEditing = false,
  className,
  ...props
}: SubmitButtonProps): JSX.Element {
  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      className={className}
      {...props}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isEditing ? "Updating..." : "Saving..."}
        </>
      ) : (
        <>{isEditing ? "Update Configuration" : "Save Configuration"}</>
      )}
    </Button>
  );
}
