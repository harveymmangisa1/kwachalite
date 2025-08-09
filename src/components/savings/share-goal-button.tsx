
'use client';

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Share2 } from "lucide-react";

export function ShareGoalButton({ goalId }: { goalId: string }) {
    const { toast } = useToast();

    const handleShare = () => {
        const shareLink = `${window.location.origin}/savings/invite/${goalId}`;
        navigator.clipboard.writeText(shareLink);
        toast({
            title: "Link Copied!",
            description: "A shareable link has been copied to your clipboard.",
        });
    }

    return (
        <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
        </Button>
    )
}
