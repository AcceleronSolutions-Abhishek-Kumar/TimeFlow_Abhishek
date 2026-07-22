import * as React from "react"
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isToday } from "date-fns"
import { ChevronLeft, ChevronRight, Plus, Clock, CheckCircle2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// ─── Sample events ────────────────────────────────────────────────────────────
const EVENTS = [
  { id: 1, date: "2026-07-21", title: "Team standup",          type: "meeting",  time: "09:00", color: "bg-blue-500/20 border-blue-500/40 text-blue-400"    },
  { id: 2, date: "2026-07-21", title: "Fix auth bug deadline",  type: "deadline", time: "17:00", color: "bg-red-500/20 border-red-500/40 text-red-400"      },
  { id: 3, date: "2026-07-22", title: "Design review session",  type: "meeting",  time: "14:00", color: "bg-blue-500/20 border-blue-500/40 text-blue-400"    },
  { id: 4, date: "2026-07-22", title: "API docs delivery",      type: "deadline", time: "EOD",   color: "bg-red-500/20 border-red-500/40 text-red-400"      },
  { id: 5, date: "2026-07-24", title: "Sprint retrospective",   type: "meeting",  time: "15:00", color: "bg-blue-500/20 border-blue-500/40 text-blue-400"    },
  { id: 6, date: "2026-07-25", title: "Landing page handoff",   type: "task",     time: "12:00", color: "bg-indigo-500/20 border-indigo-500/40 text-indigo-400"},
  { id: 7, date: "2026-07-28", title: "Q3 retrospective doc",   type: "task",     time: "EOD",   color: "bg-indigo-500/20 border-indigo-500/40 text-indigo-400"},
  { id: 8, date: "2026-07-30", title: "Documentation update",   type: "task",     time: "EOD",   color: "bg-indigo-500/20 border-indigo-500/40 text-indigo-400"},
  { id: 9, date: "2026-07-15", title: "Sprint planning",        type: "meeting",  time: "10:00", color: "bg-blue-500/20 border-blue-500/40 text-blue-400"    },
  { id:10, date: "2026-07-18", title: "Stakeholder update",     type: "meeting",  time: "11:30", color: "bg-blue-500/20 border-blue-500/40 text-blue-400"    },
]

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const TYPE_ICON = {
  meeting:  <Clock className="h-3 w-3" />,
  deadline: <AlertTriangle className="h-3 w-3" />,
  task:     <CheckCircle2 className="h-3 w-3" />,
}

// ─── Calendar Page ────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const [month, setMonth] = React.useState(new Date(2026, 6, 1)) // July 2026
  const [selectedDay, setSelectedDay] = React.useState(null)
  const [selectedEvents, setSelectedEvents] = React.useState([])

  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })
  const startPad = getDay(startOfMonth(month)) // 0=Sun

  const getEvents = (day) =>
    EVENTS.filter(e => isSameDay(new Date(e.date), day))

  const handleDayClick = (day) => {
    const evs = getEvents(day)
    setSelectedDay(day)
    setSelectedEvents(evs)
  }

  const legend = [
    { color: "bg-blue-500/40", label: "Meeting" },
    { color: "bg-red-500/40",  label: "Deadline" },
    { color: "bg-indigo-500/40", label: "Task" },
  ]

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="text-sm text-muted-foreground">View deadlines, meetings and scheduled tasks.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Main Calendar */}
        <div className="glass-card p-5 lg:col-span-3">
          {/* Nav */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">{format(month, "MMMM yyyy")}</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setMonth(m => subMonths(m, 1))} id="prev-month">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setMonth(new Date(2026, 6, 1))} id="today-btn">
                Today
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setMonth(m => addMonths(m, 1))} id="next-month">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1.5">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {/* Empty padding cells */}
            {Array.from({ length: startPad }).map((_, i) => (
              <div key={`pad-${i}`} className="bg-background/40 min-h-[80px] p-1.5" />
            ))}
            {days.map(day => {
              const events = getEvents(day)
              const today = isToday(day)
              const isSelected = selectedDay && isSameDay(day, selectedDay)
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "bg-card min-h-[80px] p-1.5 text-left transition-colors hover:bg-accent/50 flex flex-col gap-1 group",
                    isSelected && "bg-primary/10",
                    today && "bg-primary/5"
                  )}
                >
                  <span className={cn(
                    "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                    today && "bg-primary text-white font-bold",
                    !today && isSelected && "bg-accent text-accent-foreground",
                    !today && !isSelected && "text-muted-foreground group-hover:text-foreground"
                  )}>
                    {format(day, "d")}
                  </span>
                  <div className="flex flex-col gap-0.5 w-full overflow-hidden">
                    {events.slice(0, 2).map(e => (
                      <span
                        key={e.id}
                        className={cn(
                          "text-[9px] leading-tight px-1 py-0.5 rounded border truncate font-medium",
                          e.color
                        )}
                      >
                        {e.title}
                      </span>
                    ))}
                    {events.length > 2 && (
                      <span className="text-[9px] text-muted-foreground pl-1">
                        +{events.length - 2} more
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4">
            {legend.map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={cn("h-2.5 w-2.5 rounded-full", l.color)} />
                <span className="text-xs text-muted-foreground">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Selected Day / Upcoming */}
        <div className="flex flex-col gap-4">
          {/* Selected day events */}
          {selectedDay ? (
            <div className="glass-card p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/20 border border-primary/30">
                  <span className="text-[9px] text-primary font-semibold uppercase">{format(selectedDay, "MMM")}</span>
                  <span className="text-sm font-bold text-primary leading-none">{format(selectedDay, "d")}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{format(selectedDay, "EEEE")}</p>
                  <p className="text-xs text-muted-foreground">{selectedEvents.length} event{selectedEvents.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              {selectedEvents.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No events on this day</p>
              ) : (
                selectedEvents.map(e => (
                  <div key={e.id} className={cn("flex items-start gap-2 p-2.5 rounded-lg border", e.color)}>
                    <div className="mt-0.5">{TYPE_ICON[e.type]}</div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-xs font-medium leading-tight">{e.title}</span>
                      <span className="text-[10px] opacity-70">{e.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="glass-card p-4 flex flex-col items-center justify-center gap-2 text-center min-h-[120px]">
              <span className="text-2xl">📅</span>
              <p className="text-xs text-muted-foreground">Click any day to see its events</p>
            </div>
          )}

          {/* Upcoming events */}
          <div className="glass-card p-4 flex flex-col gap-3">
            <span className="text-sm font-semibold">Upcoming Events</span>
            <div className="flex flex-col gap-2">
              {EVENTS
                .filter(e => new Date(e.date) >= new Date("2026-07-21"))
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 5)
                .map(e => (
                  <div key={e.id} className="flex items-center gap-2.5 group">
                    <div className={cn("h-8 w-8 shrink-0 flex items-center justify-center rounded-lg border text-xs", e.color)}>
                      {TYPE_ICON[e.type]}
                    </div>
                    <div className="flex flex-col gap-0 min-w-0">
                      <span className="text-xs font-medium truncate">{e.title}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(e.date), "MMM d")} · {e.time}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
