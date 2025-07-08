import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: { type: string; text: string }) => void;
  messageId: string;
  feedbackType: 'good' | 'bad';
}

export function FeedbackForm({ isOpen, onClose, onSubmit, messageId, feedbackType }: FeedbackFormProps) {
  const [feedbackCategory, setFeedbackCategory] = useState("general");
  const [feedbackText, setFeedbackText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ type: feedbackCategory, text: feedbackText });
    setFeedbackText("");
    onClose();
  };

  const handleCancel = () => {
    setFeedbackText("");
    onClose();
  };

  const getTitle = () => {
    return feedbackType === 'good' ? 'What did you like?' : 'What went wrong?';
  };

  const getDescription = () => {
    return feedbackType === 'good' 
      ? 'Help us improve by telling us what you found helpful about this response.'
      : 'Help us improve by telling us what went wrong with this response.';
  };

  const getCategories = () => {
    if (feedbackType === 'good') {
      return [
        { value: "helpful", label: "Very helpful and informative" },
        { value: "accurate", label: "Accurate and correct information" },
        { value: "clear", label: "Clear and easy to understand" },
        { value: "complete", label: "Complete and comprehensive" },
        { value: "other", label: "Other" }
      ];
    } else {
      return [
        { value: "incorrect", label: "Incorrect or inaccurate information" },
        { value: "incomplete", label: "Incomplete or missing information" },
        { value: "unhelpful", label: "Not helpful or relevant" },
        { value: "confusing", label: "Confusing or unclear" },
        { value: "other", label: "Other" }
      ];
    }
  };

  const getPlaceholder = () => {
    return feedbackType === 'good'
      ? "Please provide more specific details about what you found helpful..."
      : "Please provide more specific details about what went wrong...";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            {getDescription()}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <RadioGroup value={feedbackCategory} onValueChange={setFeedbackCategory}>
              {getCategories().map((category) => (
                <div key={category.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={category.value} id={category.value} />
                  <Label htmlFor={category.value}>{category.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="feedback-text">Additional details (optional)</Label>
            <Textarea
              id="feedback-text"
              placeholder={getPlaceholder()}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Submit Feedback
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 