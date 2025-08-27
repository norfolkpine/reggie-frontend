'use client'

import { HTMLAttributes, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandGoogle,
  IconMail,
  CheckCircle,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";
import { useRouter } from "next/navigation";
import { register } from "@/api/auth";
import { handleApiError } from "@/lib/utils/handle-api-error";
import { LinkButton } from "@/components/link-button";
import { useToast } from "@/components/ui/use-toast";

type SignUpFormProps = HTMLAttributes<HTMLDivElement>;

const formSchema = z
  .object({
    username: z.string().nonempty(),
    email: z
      .string()
      .min(1, { message: "Please enter your email" })
      .email({ message: "Invalid email address" }),
    password1: z
      .string()
      .min(1, {
        message: "Please enter your password",
      })
      .min(7, {
        message: "Password must be at least 7 characters long",
      }),
    password2: z.string(),
  })
  .refine((data) => data.password1 === data.password2, {
    message: "Passwords don't match.",
    path: ["password2"],
  });

export function SignUpForm({ className, ...props }: SignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password1: "",
      password2: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      await register({
        email: data.email,
        password2: data.password1,
        password1: data.password2,
        password: data.password1,
      });

      toast({
        title: "Success",
        description: "Account created successfully! Please verify your email.",
      });
      
      // Show success state instead of page refresh
      setIsSuccess(true);
      
      // Optionally redirect to sign-in page after a delay
      setTimeout(() => {
        router.push("/sign-in");
      }, 3000);
      
    } catch (error: any) {
      const { hasFieldErrors, message } = handleApiError(error, form.setError);

      if (!hasFieldErrors) {
        toast({
          variant: "destructive",
          title: "Error",
          description: message || "Failed to create account. Please try again.",
        });
      }else if(error.errors && error.errors.length > 0){
        toast({
          variant: "destructive",
          title: "Error",
          description: error.errors.map((error: any) => error.message).join(', ') || "Failed to create account. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Show success state if account creation was successful
  if (isSuccess) {
    return (
      <div className={cn("grid gap-6 text-center", className)} {...props}>
        <div className="flex flex-col items-center gap-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <h2 className="text-2xl font-semibold">Account Created Successfully!</h2>
          <p className="text-muted-foreground">
            Please check your email to verify your account. You will be redirected to the sign-in page shortly.
          </p>
          <Button 
            onClick={() => router.push("/sign-in")}
            variant="outline"
          >
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password1"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password2"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="mt-2" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="w-full"
                type="button"
                disabled={isLoading}
              >
                <IconBrandGoogle className="h-4 w-4" /> Google
              </Button>
              <LinkButton
                variant="outline"
                className="w-full"
                type="button"
                disabled={isLoading}
                replace
                href={"/sign-in"}
              >
                <IconMail className="h-4 w-4" /> Mail
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
