import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Download, Printer, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { generateQRCode, downloadQRCode } from "@/lib/qr-code";
import { type Event } from "@shared/schema";

export default function QRDisplay() {
  const { id } = useParams<{ id: string }>();
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const { data: event, isLoading } = useQuery<Event>({
    queryKey: ["/api/events", id],
    enabled: !!id,
  });

  useEffect(() => {
    if (event) {
      const checkinUrl = `${window.location.origin}/checkin/${event.id}`;
      generateQRCode(checkinUrl)
        .then(setQrDataUrl)
        .catch(console.error);
    }
  }, [event]);

  const handleDownload = () => {
    if (qrDataUrl && event) {
      downloadQRCode(qrDataUrl, `${event.name}_QR_Code.png`);
    }
  };

  const handlePrint = () => {
    window.print();
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="text-center mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-primary hover:text-blue-700 mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{event.name}</h2>
          <p className="text-gray-600">{event.date}</p>
        </div>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="mb-4">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code" className="mx-auto" />
              ) : (
                <div className="w-[200px] h-[200px] bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">Employees can scan this QR code to check in</p>
            
            <div className="space-y-3">
              <Button 
                onClick={handleDownload} 
                className="w-full bg-secondary text-white hover:bg-emerald-600"
                disabled={!qrDataUrl}
              >
                <Download className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
              <Button 
                onClick={handlePrint} 
                variant="outline" 
                className="w-full"
              >
                <Printer className="mr-2 h-4 w-4" />
                Print QR Code
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <Info className="inline mr-2 h-4 w-4" />
            Share this QR code with event staff or display it at the venue for employee check-ins.
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link href="/admin">
            <Button variant="ghost" className="text-primary hover:text-blue-700">
              View Admin Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
