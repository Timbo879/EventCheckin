import { events, checkins, type Event, type InsertEvent, type Checkin, type InsertCheckin, type CheckinWithEvent } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Events
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: string): Promise<Event | undefined>;
  getEventByName(name: string): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
  
  // Check-ins
  createCheckin(checkin: InsertCheckin): Promise<Checkin>;
  getCheckinsByEventId(eventId: string): Promise<Checkin[]>;
  getCheckinsWithEventDetails(eventId: string): Promise<CheckinWithEvent[]>;
  getAllCheckins(): Promise<Checkin[]>;
  getCheckinByEventAndEmployee(eventId: string, employeeId: string): Promise<Checkin | undefined>;
}

export class MemStorage implements IStorage {
  private events: Map<string, Event>;
  private checkins: Map<string, Checkin>;

  constructor() {
    this.events = new Map();
    this.checkins = new Map();
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const event: Event = {
      ...insertEvent,
      id,
      passwordProtected: insertEvent.passwordProtected ?? false,
      adminPassword: insertEvent.adminPassword ?? null,
      createdAt: new Date(),
    };
    this.events.set(id, event);
    return event;
  }

  async getEvent(id: string): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getEventByName(name: string): Promise<Event | undefined> {
    return Array.from(this.events.values()).find(
      (event) => event.name === name,
    );
  }

  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async createCheckin(insertCheckin: InsertCheckin): Promise<Checkin> {
    const id = randomUUID();
    const checkin: Checkin = {
      ...insertCheckin,
      id,
      timestamp: new Date(),
    };
    this.checkins.set(id, checkin);
    return checkin;
  }

  async getCheckinsByEventId(eventId: string): Promise<Checkin[]> {
    return Array.from(this.checkins.values()).filter(
      (checkin) => checkin.eventId === eventId,
    );
  }

  async getCheckinsWithEventDetails(eventId: string): Promise<CheckinWithEvent[]> {
    const checkins = await this.getCheckinsByEventId(eventId);
    const event = await this.getEvent(eventId);
    
    if (!event) return [];
    
    return checkins.map(checkin => ({
      ...checkin,
      event,
    }));
  }

  async getAllCheckins(): Promise<Checkin[]> {
    return Array.from(this.checkins.values());
  }

  async getCheckinByEventAndEmployee(eventId: string, employeeId: string): Promise<Checkin | undefined> {
    return Array.from(this.checkins.values()).find(
      (checkin) => checkin.eventId === eventId && checkin.employeeId === employeeId,
    );
  }
}

export class DatabaseStorage implements IStorage {
  // Events
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(insertEvent)
      .returning();
    return event;
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async getEventByName(name: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.name, name));
    return event || undefined;
  }

  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  // Check-ins
  async createCheckin(insertCheckin: InsertCheckin): Promise<Checkin> {
    const [checkin] = await db
      .insert(checkins)
      .values(insertCheckin)
      .returning();
    return checkin;
  }

  async getCheckinsByEventId(eventId: string): Promise<Checkin[]> {
    return await db.select().from(checkins).where(eq(checkins.eventId, eventId));
  }

  async getCheckinsWithEventDetails(eventId: string): Promise<CheckinWithEvent[]> {
    const result = await db
      .select()
      .from(checkins)
      .innerJoin(events, eq(checkins.eventId, events.id))
      .where(eq(checkins.eventId, eventId));
    
    return result.map(row => ({
      ...row.checkins,
      event: row.events,
    }));
  }

  async getAllCheckins(): Promise<Checkin[]> {
    return await db.select().from(checkins);
  }

  async getCheckinByEventAndEmployee(eventId: string, employeeId: string): Promise<Checkin | undefined> {
    const [checkin] = await db
      .select()
      .from(checkins)
      .where(and(eq(checkins.eventId, eventId), eq(checkins.employeeId, employeeId)));
    return checkin || undefined;
  }
}

export const storage = new DatabaseStorage();
