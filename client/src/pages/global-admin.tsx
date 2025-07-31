import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Home, Calendar, Users, Clock, QrCode, Settings, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Event } from "@shared/schema";

export default function GlobalAdmin() {
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const sortedEvents = events.sort((a, b) => 
    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Events</h1>
            <p className="text-gray-600">Overview of all created events and their check-ins</p>
          </div>
          <Link href="/">
            <Button variant="ghost" className="text-gray-500 hover:text-gray-700">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
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
                  <Users className="text-white h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Protected Events</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {events.filter(e => e.passwordProtected).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center mr-3">
                  <Clock className="text-white h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Recent Events</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {events.filter(e => {
                      const eventDate = new Date(e.date);
                      const today = new Date();
                      const diffTime = today.getTime() - eventDate.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return diffDays <= 7;
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        {events.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Events Created</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first event</p>
              <Link href="/">
                <Button className="bg-primary text-white hover:bg-blue-600">
                  Create First Event
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sortedEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {event.name}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {event.date}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Created {event.createdAt ? new Date(event.createdAt).toLocaleDateString() : 'Unknown'}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {event.passwordProtected && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Protected
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/qr/${event.id}`}>
                      <Button size="sm" variant="outline" className="flex items-center">
                        <QrCode className="h-4 w-4 mr-1" />
                        QR Code
                      </Button>
                    </Link>
                    <Link href={`/checkin/${event.id}`}>
                      <Button size="sm" variant="outline" className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        Check-in Page
                      </Button>
                    </Link>
                    <Link href={`/admin-login/${event.id}`}>
                      <Button size="sm" variant="outline" className="flex items-center">
                        <Settings className="h-4 w-4 mr-1" />
                        Admin Dashboard
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/">
            <Button className="bg-primary text-white hover:bg-blue-600">
              Create New Event
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}