"use client";
import { useState, useEffect } from "react";

interface CountdownResult {
  hours:   number;
  minutes: number;
  seconds: number;
  total:   number;   // total seconds remaining
  expired: boolean;
  label:   string;   // e.g. "23h 14m" or "Expired"
}

export function useCountdown(targetDate: string | Date | null): CountdownResult {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!targetDate) return;

    function calc() {
      const diff = Math.max(0, new Date(targetDate!).getTime() - Date.now());
      setRemaining(Math.floor(diff / 1000));
    }

    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const hours   = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  const expired = remaining <= 0;

  let label = "Expired";
  if (!expired) {
    if (hours > 0) label = `${hours}h ${minutes}m`;
    else if (minutes > 0) label = `${minutes}m ${seconds}s`;
    else label = `${seconds}s`;
  }

  return { hours, minutes, seconds, total: remaining, expired, label };
}
