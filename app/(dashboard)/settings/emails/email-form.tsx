'use client'

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";

const emailFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

type EmailFormValues = z.infer<typeof emailFormSchema>;

// Default values for the form
const defaultValues: Partial<EmailFormValues> = {
  email: "",
};

// Mock data for verified emails
const verifiedEmails = [
  { id: 1, email: "user@example.com", primary: true },
  { id: 2, email: "secondary@example.com", primary: false },
];

export function EmailSettingsForm() {
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues,
  });

  function onSubmit(data: EmailFormValues) {
    toast({
      title: "Email added",
      description: "Verification email sent to " + data.email,
    });
    form.reset();
  }

  return (
    <div className="space-y-8">
      {/* Email Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Add Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="new@example.com" {...field} />
                </FormControl>
                <FormDescription>
                  Enter a new email address to add to your account.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Add Email</Button>
        </form>
      </Form>

      {/* Verified Emails Section */}
      <Card className="w-full max-w-2xl">
        <CardContent>
          <div>
            <h3 className="text-lg font-medium">Verified Email Addresses</h3>
            <ul className="mt-4 space-y-4">
              {verifiedEmails.map((email) => (
                <li key={email.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{email.email}</p>
                    {email.primary && (
                      <span className="text-sm text-muted-foreground">Primary</span>
                    )}
                  </div>
                  {!email.primary && (
                    <Button variant="outline" size="sm">
                      Make Primary
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
