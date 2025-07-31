import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter";
import { QrCode, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { insertEventSchema, type Event } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [createdEvent, setCreatedEvent] = useState<Event | null>(null);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(insertEventSchema),
    defaultValues: {
      name: "",
      date: "",
      passwordProtected: false,
      adminPassword: "",
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: typeof insertEventSchema._type) => {
      const response = await apiRequest("POST", "/api/events", data);
      return response.json();
    },
    onSuccess: (event: Event) => {
      setCreatedEvent(event);
      toast({
        title: "Event Created",
        description: "QR code generated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const passwordProtected = form.watch("passwordProtected");

  const onSubmit = (data: typeof insertEventSchema._type) => {
    createEventMutation.mutate(data);
  };

  if (createdEvent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-md">
          <div className="text-center mb-6">
            <Button
              variant="ghost"
              className="text-primary hover:text-blue-700 mb-4"
              onClick={() => {
                setCreatedEvent(null);
                form.reset();
              }}
            >
              ← Back to Home
            </Button>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{createdEvent.name}</h2>
            <p className="text-gray-600">{createdEvent.date}</p>
          </div>

          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-gray-600 mb-4">Event created successfully!</p>
              <div className="space-y-3">
                <Link href={`/qr/${createdEvent.id}`}>
                  <Button className="w-full bg-secondary text-white hover:bg-emerald-600">
                    <QrCode className="mr-2 h-4 w-4" />
                    View QR Code
                  </Button>
                </Link>
                <Link href={`/admin-login/${createdEvent.id}`}>
                  <Button variant="outline" className="w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              ℹ️ Share the QR code with event staff or display it at the venue for employee check-ins.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="text-white text-2xl h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Check-in</h1>
          <p className="text-gray-600">Generate QR codes for charity event check-ins</p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Annual Charity Gala 2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="passwordProtected"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Password protect admin access</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {passwordProtected && (
                  <FormField
                    control={form.control}
                    name="adminPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter admin password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createEventMutation.isPending}
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  {createEventMutation.isPending ? "Creating..." : "Generate QR Code"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">Already have an event?</p>
          <Button variant="ghost" className="text-primary font-medium hover:text-blue-700">
            <Settings className="mr-2 h-4 w-4" />
            Access Admin Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
