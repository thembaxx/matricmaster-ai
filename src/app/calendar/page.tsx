"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight,
  Clock, Trash2, Edit
} from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  eventType: "exam" | "study" | "lesson" | "reminder" | "personal";
  subject?: string;
  isCompleted?: boolean;
}

const EVENT_TYPES = [
  { value: "exam", label: "Exam", color: "bg-red-100 text-red-800" },
  { value: "study", label: "Study Session", color: "bg-blue-100 text-blue-800" },
  { value: "lesson", label: "Lesson", color: "bg-green-100 text-green-800" },
  { value: "reminder", label: "Reminder", color: "bg-yellow-100 text-yellow-800" },
  { value: "personal", label: "Personal", color: "bg-purple-100 text-purple-800" },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function CalendarPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: "1",
      title: "Mathematics Paper 1",
      description: "Grade 12 Final Exam",
      startTime: new Date(2026, 2, 15, 9, 0),
      endTime: new Date(2026, 2, 15, 12, 0),
      eventType: "exam",
      subject: "Mathematics",
    },
    {
      id: "2",
      title: "Physics Study Group",
      startTime: new Date(2026, 2, 18, 14, 0),
      endTime: new Date(2026, 2, 18, 16, 0),
      eventType: "study",
      subject: "Physical Sciences",
    },
  ]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    eventType: "study" as const,
    subject: "",
    reminder: "30",
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDay = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDay = (day: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.getDate() === day && 
        eventDate.getMonth() === month && 
        eventDate.getFullYear() === year;
    });
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.startTime || !newEvent.endTime) return;

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description,
      startTime: new Date(newEvent.startTime),
      endTime: new Date(newEvent.endTime),
      eventType: newEvent.eventType,
      subject: newEvent.subject,
    };

    setEvents([...events, event]);
    setShowEventForm(false);
    setNewEvent({
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      eventType: "study",
      subject: "",
      reminder: "30",
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border bg-muted/30" />);
    }

    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      const dayEvents = getEventsForDay(day);

      days.push(
        <div 
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-24 border p-1 cursor-pointer hover:bg-accent transition-colors ${
            isToday ? "bg-blue-50" : ""
          } ${isSelected ? "ring-2 ring-primary" : ""}`}
        >
          <div className={`text-sm font-medium mb-1 ${
            isToday ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center" : ""
          }`}>
            {day}
          </div>
          <div className="space-y-1 overflow-hidden">
            {dayEvents.slice(0, 2).map(event => (
              <div 
                key={event.id}
                className={`text-xs px-1 py-0.5 rounded truncate ${
                  EVENT_TYPES.find(t => t.value === event.eventType)?.color || "bg-gray-100"
                }`}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-muted-foreground">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const selectedDateEvents = selectedDate 
    ? events.filter(e => new Date(e.startTime).toDateString() === selectedDate.toDateString())
    : [];

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="text-muted-foreground">Schedule and manage your study time</p>
          </div>
        </div>
        <Button onClick={() => setShowEventForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-xl font-semibold">
                    {MONTHS[month]} {year}
                  </h2>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="outline" onClick={goToToday}>
                  Today
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Days header */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar grid */}
              <div className="grid grid-cols-7 border">
                {renderCalendarDays()}
              </div>

              {/* Legend */}
              <div className="flex gap-4 mt-4 flex-wrap">
                {EVENT_TYPES.map(type => (
                  <div key={type.value} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${type.color.split(" ")[0]}`} />
                    <span className="text-xs">{type.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Selected Day Events */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate 
                  ? selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
                  : "Select a date"
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map(event => (
                    <div 
                      key={event.id}
                      className={`p-3 rounded-lg border ${
                        EVENT_TYPES.find(t => t.value === event.eventType)?.color.split(" ")[0]
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-sm">{event.title}</h3>
                          {event.subject && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              {event.subject}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(event.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-xs text-muted-foreground mt-2">{event.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No events for this day</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* External Calendar Sync */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Connect Calendars</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <svg viewBox="0 0 24 24" className="h-4 w-4 mr-2" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Connect Google Calendar
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <svg viewBox="0 0 24 24" className="h-4 w-4 mr-2" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#FA3F00"/>
                </svg>
                Connect Apple Calendar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Event Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                <Input
                  placeholder="Event title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Textarea
                  placeholder="Optional description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Start Time</label>
                  <Input
                    type="datetime-local"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">End Time</label>
                  <Input
                    type="datetime-local"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Event Type</label>
                <div className="flex gap-2 flex-wrap">
                  {EVENT_TYPES.map(type => (
                    <Badge
                      key={type.value}
                      variant={newEvent.eventType === type.value ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setNewEvent({...newEvent, eventType: type.value as any})}
                    >
                      {type.label}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Subject (Optional)</label>
                <Input
                  placeholder="e.g., Mathematics"
                  value={newEvent.subject}
                  onChange={(e) => setNewEvent({...newEvent, subject: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowEventForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEvent}>
                  Add Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
