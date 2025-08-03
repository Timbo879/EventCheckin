import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Home, Users, Calendar, Download, RefreshCw, QrCode, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Event, type CheckinWithEvent } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { toast } = useToast();

  const { data: events = [], isLoading: eventsLoading, refetch: refetchEvents } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const handleExportCSV = async (eventId: string, eventName: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/export`);
      if (!response.ok) {
        throw new Error("Failed to export data");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${eventName}_checkins.csv`;
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
  
  const upcomingEvents = events.filter(event => new Date(event.date) >= today);
  const pastEvents = events.filter(event => new Date(event.date) < today);

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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {upcomingEvents.map((event) => (
                      <tr key={event.id}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {event.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(event.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm space-x-2">
                          <Link href={`/qr/${event.id}`}>
                            <Button size="sm" variant="outline">
                              <QrCode className="mr-1 h-3 w-3" />
                              QR Code
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExportCSV(event.id, event.name)}
                          >
                            <Download className="mr-1 h-3 w-3" />
                            Export
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pastEvents.map((event) => (
                      <tr key={event.id}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {event.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(event.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExportCSV(event.id, event.name)}
                          >
                            <Download className="mr-1 h-3 w-3" />
                            Export Data
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
