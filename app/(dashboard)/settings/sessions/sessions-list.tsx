"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MapPin, Monitor, Smartphone, Trash2 } from "lucide-react"
// import Link from "next/link"

interface Session {
  id: string;
  location: string;
  ip: string;
  device: "desktop" | "mobile";
  isCurrent: boolean;
}

const mockSessions: Session[] = [
  { id: "1", location: "Denpasar", ip: "202.58.195.167", device: "desktop", isCurrent: true },
  { id: "2", location: "Jakarta", ip: "103.105.34.55", device: "mobile", isCurrent: false },
  { id: "3", location: "Singapore", ip: "128.106.12.11", device: "desktop", isCurrent: false },
];

export default function SessionsList() {
  const [sessions, setSessions] = useState<Session[]>(mockSessions)

  const handleRevoke = (id: string) => {
    setSessions(sessions.filter(session => session.id !== id))
  }

  return (
    <ScrollArea className="w-full h-[600px] pr-4">
      {sessions.map(session => (
        <Card key={session.id} className="w-full mb-4">
          <CardHeader>
            <CardTitle className="flex items-center">
              {session.device === "desktop" ? (
                <Monitor className="h-6 w-6 text-gray-500 mr-2" />
              ) : (
                <Smartphone className="h-6 w-6 text-gray-500 mr-2" />
              )}
              {session.location}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">
                  IP: {session.ip}
                </p>
                {session.isCurrent && <p className="text-sm text-green-600">Your current session</p>}
                <p className="text-sm text-gray-500">
                  Seen in {session.location.split(",")[1] || session.location},{" "}
                  {session.location.split(",")[0] || "Unknown"}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {/* <Link href={`/sessions/${session.id}`} passHref> */}
                <Button variant="ghost" size="sm">
                  <MapPin className="mr-2 h-4 w-4" />
                  See more
                </Button>
                {/* </Link> */}
                {!session.isCurrent && (
                  <Button variant="destructive" size="sm" onClick={() => handleRevoke(session.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Revoke
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </ScrollArea>
  )
}
