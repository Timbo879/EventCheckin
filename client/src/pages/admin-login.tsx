import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Lock } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { type Event } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const adminLoginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export default function AdminLogin() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [loginError, setLoginError] = useState<string>("");
  const { toast } = useToast();

  const { data: event, isLoading } = useQuery<Event>({
    queryKey: ["/api/events", id],
    enabled: !!id,
  });

  const form = useForm({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      password: "",
    },
  });

  const verifyPasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof adminLoginSchema>) => {
      const response = await apiRequest("POST", `/api/events/${id}/verify-admin`, data);
      return response.json();
    },
    onSuccess: (result: { valid: boolean }) => {
      if (result.valid) {
        setLocation(`/admin/${id}`);
      } else {
        setLoginError("Invalid password. Please try again.");
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to verify password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof adminLoginSchema>) => {
    setLoginError("");
    verifyPasswordMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Event not found</p>
          <Link href="/">
            <Button variant="ghost" className="mt-4">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // If event is not password protected, redirect directly to admin
  if (!event.passwordProtected) {
    setLocation(`/admin/${id}`);
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-primary hover:text-blue-700 mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-white text-2xl h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h1>
          <p className="text-gray-600">Enter admin password to access dashboard</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter admin password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-accent text-white hover:bg-yellow-600"
                  disabled={verifyPasswordMutation.isPending}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  {verifyPasswordMutation.isPending ? "Verifying..." : "Access Dashboard"}
                </Button>
              </form>
            </Form>

            {loginError && (
              <Alert className="mt-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {loginError}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
