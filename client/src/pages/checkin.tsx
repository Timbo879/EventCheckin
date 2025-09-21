import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { insertCheckinSchema, type Event, type Checkin } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const checkinFormSchema = insertCheckinSchema.pick({ employeeId: true });

export default function CheckIn() {
  const { id } = useParams<{ id: string }>();
  const [checkedInEmployee, setCheckedInEmployee] = useState<Checkin | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: event, isLoading } = useQuery<Event>({
    queryKey: ["/api/events", id],
    enabled: !!id,
  });

  const form = useForm({
    resolver: zodResolver(checkinFormSchema),
    defaultValues: {
      employeeId: "",
    },
  });

  const checkinMutation = useMutation({
    mutationFn: async (data: z.infer<typeof checkinFormSchema>) => {
      const response = await apiRequest("POST", "/api/checkins", {
        ...data,
        eventId: id,
      });
      return response.json();
    },
    onSuccess: (checkin: Checkin) => {
      setCheckedInEmployee(checkin);
      queryClient.invalidateQueries({ queryKey: ["/api/events", id, "checkins"] });
      toast({
        title: "Check-in Successful!",
        description: `Employee ${checkin.employeeId} has been checked in.`,
      });
    },
    onError: (error: any) => {
      let message = "Failed to check in. Please try again.";
      if (error.message && error.message.includes("already checked in")) {
        message = "You've already checked in for this event.";
      }
      toast({
        title: "Check-in Failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof checkinFormSchema>) => {
    checkinMutation.mutate(data);
  };

  const resetForm = () => {
    setCheckedInEmployee(null);
    form.reset();
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
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <Alert>
              <AlertDescription>
                Event not found. Please check the QR code or contact event organizers.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if event is archived
  if (event.archived) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Archive className="text-white text-2xl h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">B-Here Check-in</h1>
            <p className="text-gray-600">{event.name}</p>
            <p className="text-sm text-gray-500">{event.date}</p>
          </div>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Archive className="text-white text-2xl h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Check-in is Closed</h3>
              <p className="text-gray-600 mb-4">
                Check-in is closed for this event.
              </p>
              <p className="text-sm text-gray-500">
                Please contact event organizers if you need assistance.
              </p>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Having trouble? Contact event organizers for assistance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (checkedInEmployee) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-white text-2xl h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">B-Here Check-in</h1>
            <p className="text-gray-600">{event.name}</p>
            <p className="text-sm text-gray-500">{event.date}</p>
          </div>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-white text-2xl h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Check-in Successful!</h3>
              <p className="text-gray-600 mb-4">
                Employee ID: <span className="font-mono font-semibold">{checkedInEmployee.employeeId}</span>
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Timestamp: {new Date(checkedInEmployee.timestamp).toLocaleString()}
              </p>
              
              <Button onClick={resetForm} variant="outline" className="w-full">
                Check in another employee
              </Button>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Having trouble? Contact event organizers for assistance.
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
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-white text-2xl h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">B-Here Check-in</h1>
          <p className="text-gray-600">{event.name}</p>
          <p className="text-sm text-gray-500">{event.date}</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee ID</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          maxLength={6}
                          className="text-lg text-center py-4"
                          placeholder="123456"
                          onChange={(e) => {
                            // Only allow digits
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <p className="text-xs text-gray-500">Enter your 6-digit employee ID</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-secondary text-white hover:bg-emerald-600 py-4 text-lg font-semibold"
                  disabled={checkinMutation.isPending}
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  {checkinMutation.isPending ? "Checking In..." : "Check In"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Having trouble? Contact event organizers for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
