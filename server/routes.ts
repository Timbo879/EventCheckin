import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertCheckinSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create event
  app.post("/api/events", async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid event data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create event" });
      }
    }
  });

  // Get event by ID
  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        res.status(404).json({ message: "Event not found" });
        return;
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to get event" });
    }
  });

  // Get event by name
  app.get("/api/events/by-name/:name", async (req, res) => {
    try {
      const event = await storage.getEventByName(decodeURIComponent(req.params.name));
      if (!event) {
        res.status(404).json({ message: "Event not found" });
        return;
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to get event" });
    }
  });

  // Create check-in
  app.post("/api/checkins", async (req, res) => {
    try {
      const checkinData = insertCheckinSchema.parse(req.body);
      
      // Verify event exists
      const event = await storage.getEvent(checkinData.eventId);
      if (!event) {
        res.status(404).json({ message: "Event not found" });
        return;
      }

      // Check if event is archived
      if (event.archived) {
        res.status(403).json({ message: "Check-ins are closed for this event" });
        return;
      }

      // Check for duplicate check-in
      const existingCheckin = await storage.getCheckinByEventAndEmployee(checkinData.eventId, checkinData.employeeId);
      if (existingCheckin) {
        res.status(409).json({ message: "You've already checked in for this event." });
        return;
      }

      const checkin = await storage.createCheckin(checkinData);
      res.json(checkin);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid check-in data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create check-in" });
      }
    }
  });

  // Get check-ins by event ID
  app.get("/api/events/:id/checkins", async (req, res) => {
    try {
      const checkins = await storage.getCheckinsWithEventDetails(req.params.id);
      res.json(checkins);
    } catch (error) {
      res.status(500).json({ message: "Failed to get check-ins" });
    }
  });

  // Get all events for admin dashboard
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to get events" });
    }
  });

  // Export check-ins as CSV
  app.get("/api/events/:id/export", async (req, res) => {
    try {
      const checkins = await storage.getCheckinsWithEventDetails(req.params.id);
      
      if (checkins.length === 0) {
        res.status(404).json({ message: "No check-ins found" });
        return;
      }

      const csvHeader = "Employee ID,Check-in Time,Event Name\n";
      const csvData = checkins.map(checkin => 
        `${checkin.employeeId},${checkin.timestamp.toISOString()},${checkin.event.name}`
      ).join("\n");
      
      const csv = csvHeader + csvData;
      
      // Format date for filename (YYYY-MM-DD)
      const formattedDate = new Date(checkins[0].event.date + 'T12:00:00').toISOString().split('T')[0];
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${checkins[0].event.name}_${formattedDate}_checkins.csv"`);
      res.send(csv);
    } catch (error) {
      res.status(500).json({ message: "Failed to export check-ins" });
    }
  });

  // Toggle event archive status
  app.patch("/api/events/:id/archive", async (req, res) => {
    try {
      const archiveSchema = z.object({ archived: z.boolean() });
      const result = archiveSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ message: "archived field must be a boolean" });
        return;
      }

      const { archived } = result.data;

      const updatedEvent = await storage.updateEventArchiveStatus(req.params.id, archived);
      if (!updatedEvent) {
        res.status(404).json({ message: "Event not found" });
        return;
      }
      res.json(updatedEvent);
    } catch (error) {
      res.status(500).json({ message: "Failed to update archive status" });
    }
  });

  // Delete event
  app.delete("/api/events/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteEvent(req.params.id);
      if (!deleted) {
        res.status(404).json({ message: "Event not found" });
        return;
      }
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
