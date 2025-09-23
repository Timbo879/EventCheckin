import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Home, Users, Calendar, Download, RefreshCw, QrCode, Plus, ChevronDown, ChevronUp, Eye, Trash2, Archive, ArchiveRestore, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type Event, type CheckinWithEvent, type Checkin, updateEventSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface EventRowProps {
  event: Event;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  onExportCSV: () => void;
  onDeleteEvent: () => void;
  onToggleArchive: () => void;
  onEditEvent: (eventData: z.infer<typeof updateEventSchema>) => void;
}

function EventRow({ event, isExpanded, onToggleExpansion, onExportCSV, onDeleteEvent, onToggleArchive, onEditEvent }: EventRowProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(updateEventSchema),
    defaultValues: {
      name: event.name,
      date: event.date,
    },
  });

  const handleEditSubmit = (data: z.infer<typeof updateEventSchema>) => {
    onEditEvent(data);
    setIsEditOpen(false);
    form.reset({
      name: event.name,
      date: event.date,
    });
  };
  // Always fetch check-ins count for the badge display
  const { data: checkins = [], isLoading: checkinsLoading } = useQuery<Checkin[]>({
    queryKey: ["/api/events", event.id, "checkins"],
  });

  const sortedCheckins = checkins.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggleExpansion}>
      <div className="border-b border-gray-200 last:border-b-0">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-medium ${event.archived ? 'text-gray-500' : 'text-gray-900'}`}>
                    {event.name}
                  </h3>
                  {event.archived && (
                    <Badge variant="secondary" className="text-xs">
                      Archived
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{new Date(event.date + 'T12:00:00').toLocaleDateString()}</p>
              </div>
              <Badge variant="outline" className="ml-2">
                {checkins.length} check-ins
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link href={`/qr/${event.id}`}>
                <Button size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>
                  <QrCode className="mr-1 h-3 w-3" />
                  QR Code
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onExportCSV();
                }}
              >
                <Download className="mr-1 h-3 w-3" />
                Export
              </Button>
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => e.stopPropagation()}
                    data-testid={`button-edit-event-${event.id}`}
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent onClick={(e) => e.stopPropagation()}>
                  <DialogHeader>
                    <DialogTitle>Edit Event</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Name</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-edit-event-name" />
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
                              <Input {...field} type="date" data-testid="input-edit-event-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditOpen(false)}
                          data-testid="button-cancel-edit"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" data-testid="button-save-edit">
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleArchive();
                }}
                className={event.archived ? "text-green-600 hover:text-green-700 hover:bg-green-50" : "text-orange-600 hover:text-orange-700 hover:bg-orange-50"}
                data-testid={`button-${event.archived ? 'unarchive' : 'archive'}-event-${event.id}`}
              >
                {event.archived ? (
                  <>
                    <ArchiveRestore className="mr-1 h-3 w-3" />
                    Unarchive
                  </>
                ) : (
                  <>
                    <Archive className="mr-1 h-3 w-3" />
                    Archive
                  </>
                )}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => e.stopPropagation()}
                    data-testid={`button-delete-event-${event.id}`}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the event 
                      "<strong>{event.name}</strong>" and all associated check-ins.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDeleteEvent}
                      className="bg-red-600 hover:bg-red-700"
                      data-testid="button-confirm-delete"
                    >
                      Delete Event
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button size="sm" variant="ghost">
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">Check-in Details</h4>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  {checkins.length} Total
                </Badge>
              </div>
              
              {checkinsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading check-ins...</p>
                </div>
              ) : checkins.length === 0 ? (
                <div className="text-center py-4">
                  <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">No check-ins yet</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Employees can scan the QR code to check in
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {sortedCheckins.map((checkin, index) => (
                    <div 
                      key={checkin.id} 
                      className="flex items-center justify-between p-3 bg-white rounded border"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-xs font-bold">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-mono font-medium text-gray-900">
                            Employee ID: {checkin.employeeId}
                          </p>
                          <p className="text-xs text-gray-600">
                            {new Date(checkin.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Checked In
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  const { data: events = [], isLoading: eventsLoading, refetch: refetchEvents } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event Deleted",
        description: "The event and all its check-ins have been permanently deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete the event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const archiveEventMutation = useMutation({
    mutationFn: async ({ eventId, archived }: { eventId: string; archived: boolean }) => {
      const response = await fetch(`/api/events/${eventId}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived }),
      });
      if (!response.ok) throw new Error("Failed to update archive status");
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", variables.eventId, "checkins"] });
      toast({
        title: variables.archived ? "Event Archived" : "Event Unarchived",
        description: variables.archived ? "Event has been archived. Check-ins are now disabled." : "Event has been unarchived. Check-ins are now enabled.",
      });
    },
    onError: () => {
      toast({
        title: "Archive Failed",
        description: "Failed to update archive status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleEventExpansion = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const handleExportCSV = async (eventId: string, eventName: string, eventDate: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/export`);
      if (!response.ok) {
        throw new Error("Failed to export data");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Format date for filename (YYYY-MM-DD)
      const formattedDate = new Date(eventDate + 'T12:00:00').toISOString().split('T')[0];
      link.download = `${eventName}_${formattedDate}_checkins.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Check-in data has been downloaded as CSV.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export check-in data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    refetchEvents();
    toast({
      title: "Data Refreshed",
      description: "Events list has been updated.",
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteEventMutation.mutate(eventId);
  };

  const handleToggleArchive = (eventId: string, currentArchivedStatus: boolean) => {
    archiveEventMutation.mutate({ eventId, archived: !currentArchivedStatus });
  };

  const editEventMutation = useMutation({
    mutationFn: async ({ eventId, data }: { eventId: string; data: z.infer<typeof updateEventSchema> }) => {
      const response = await apiRequest("PATCH", `/api/events/${eventId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event Updated",
        description: "Event has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEditEvent = (eventId: string, data: z.infer<typeof updateEventSchema>) => {
    editEventMutation.mutate({ eventId, data });
  };

  if (eventsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingEvents = events.filter(event => new Date(event.date + 'T12:00:00') >= today);
  const pastEvents = events.filter(event => new Date(event.date + 'T12:00:00') < today);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">B-Here Admin Dashboard</h1>
            <p className="text-gray-600">Manage all events and check-ins</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleRefresh}
              variant="outline" 
              disabled={eventsLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${eventsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/">
              <Button variant="ghost" className="text-gray-500 hover:text-gray-700">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
                  <Calendar className="text-white h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center mr-3">
                  <Calendar className="text-white h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Upcoming Events</p>
                  <p className="text-2xl font-bold text-gray-900">{upcomingEvents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center mr-3">
                  <Users className="text-white h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Past Events</p>
                  <p className="text-2xl font-bold text-gray-900">{pastEvents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Create Button */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <Link href="/">
              <Button className="w-full bg-primary text-white hover:bg-blue-600">
                <Plus className="mr-2 h-4 w-4" />
                Create New Event
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {upcomingEvents.map((event) => (
                  <EventRow 
                    key={event.id} 
                    event={event} 
                    isExpanded={expandedEvents.has(event.id)}
                    onToggleExpansion={() => toggleEventExpansion(event.id)}
                    onExportCSV={() => handleExportCSV(event.id, event.name, event.date)}
                    onDeleteEvent={() => handleDeleteEvent(event.id)}
                    onToggleArchive={() => handleToggleArchive(event.id, event.archived)}
                    onEditEvent={(data) => handleEditEvent(event.id, data)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Past Events
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {pastEvents.map((event) => (
                  <EventRow 
                    key={event.id} 
                    event={event} 
                    isExpanded={expandedEvents.has(event.id)}
                    onToggleExpansion={() => toggleEventExpansion(event.id)}
                    onExportCSV={() => handleExportCSV(event.id, event.name, event.date)}
                    onDeleteEvent={() => handleDeleteEvent(event.id)}
                    onToggleArchive={() => handleToggleArchive(event.id, event.archived)}
                    onEditEvent={(data) => handleEditEvent(event.id, data)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {events.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No events yet</h3>
              <p className="text-gray-600 mb-4">Create your first event to get started with B-Here.</p>
              <Link href="/">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
