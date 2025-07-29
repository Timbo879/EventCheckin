import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { LogOut, Users, Clock, Calendar, Download, RefreshCw, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Event, type CheckinWithEvent } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const { data: event, isLoading: eventLoading } = useQuery<Event>({
    queryKey: ["/api/events", id],
    enabled: !!id,
  });

  const { data: checkins = [], isLoading: checkinsLoading, refetch: refetchCheckins } = useQuery<CheckinWithEvent[]>({
    queryKey: ["/api/events", id, "checkins"],
    enabled: !!id,
  });

  const handleExportCSV = async () => {
    try {
      const response = await fetch(`/api/events/${id}/export`);
      if (!response.ok) {
        throw new Error("Failed to export data");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${event?.name || 'event'}_checkins.csv`;
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
    refetchCheckins();
    toast({
      title: "Data Refreshed",
      description: "Check-in data has been updated.",
    });
  };

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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

  const sortedCheckins = checkins.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const lastCheckin = sortedCheckins[0];
  const lastCheckinTime = lastCheckin 
    ? new Date(lastCheckin.timestamp).toLocaleString()
    : "No check-ins yet";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">{event.name}</p>
          </div>
          <Link href="/">
            <Button variant="ghost" className="text-gray-500 hover:text-gray-700">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center mr-3">
                  <Users className="text-white h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Check-ins</p>
                  <p className="text-2xl font-bold text-gray-900">{checkins.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
                  <Clock className="text-white h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Check-in</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {lastCheckin ? `${Math.floor((Date.now() - new Date(lastCheckin.timestamp).getTime()) / 60000)} min ago` : "Never"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center mr-3">
                  <Calendar className="text-white h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Event Date</p>
                  <p className="text-sm font-semibold text-gray-900">{event.date}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleExportCSV}
                className="flex-1 bg-secondary text-white hover:bg-emerald-600"
                disabled={checkins.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button 
                onClick={handleRefresh}
                variant="outline" 
                className="flex-1"
                disabled={checkinsLoading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${checkinsLoading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
              <Link href={`/qr/${event.id}`}>
                <Button variant="outline" className="flex-1 w-full">
                  <QrCode className="mr-2 h-4 w-4" />
                  Show QR Code
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Check-in List */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Check-ins</h3>
            </div>
            
            {checkinsLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading check-ins...</p>
              </div>
            ) : checkins.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">No check-ins yet</p>
                <p className="text-sm text-gray-500 mt-2">Check-ins will appear here as employees scan the QR code</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check-in Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedCheckins.map((checkin) => (
                      <tr key={checkin.id}>
                        <td className="px-4 py-3 text-sm font-mono text-gray-900">
                          {checkin.employeeId}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(checkin.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Checked In
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {checkins.length > 0 && (
              <div className="p-4 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-500">
                  Showing {checkins.length} total check-ins
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
