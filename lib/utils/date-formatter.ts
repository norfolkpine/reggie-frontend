import { format, formatDistanceToNow, isWithinInterval, subDays } from "date-fns";

export const formatDateVariants = {
    short: (date: string | number | Date) => {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "2-digit"
      });
    },
    medium: (date: string | number | Date) => {
      return new Date(date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      });
    },
    dateOnly: (date: string | number | Date) => {
      return format(new Date(date), 'yyyy-MM-dd');
    },
    long: (date: string | number | Date) => {
      return new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
      });
    },
    iso: (date: string | number | Date) => {
      return new Date(date).toISOString();
    },
    time: (date: string | number | Date) => {
      return new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      });
    },
    dateTime: (date: string | number | Date) => {
      return new Date(date).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    },
    dateAgo: (date: string | number | Date) => {
      const dateObj = new Date(date)
      const now = new Date()
      const thirtyDaysAgo = subDays(now, 30)
    
      if (isWithinInterval(dateObj, { start: thirtyDaysAgo, end: now })) {
        return formatDistanceToNow(dateObj, { addSuffix: true })
      }
      return dateObj.toLocaleDateString("en-US", {
        year: 'numeric',
      month: 'short',
      day: 'numeric'
      });
    },
    dateAgoShort: (date: string | number | Date) => {
      const dateObj = new Date(date)
      const now = new Date()
      const diffMs = now.getTime() - dateObj.getTime()
      const diffSec = Math.floor(diffMs / 1000)
      const diffMin = Math.floor(diffSec / 60)
      const diffHr = Math.floor(diffMin / 60)
      const diffDay = Math.floor(diffHr / 24)
  
      if (diffSec < 60) {
        return `${diffSec}s`
      } else if (diffMin < 60) {
        const sec = diffSec % 60
        return `${diffMin}min ${sec}s`
      } else if (diffHr < 24) {
        const min = diffMin % 60
        return `${diffHr}h ${min}min`
      } else if (diffDay < 7) {
        return `${diffDay}d ${diffHr % 24}h`
      } else {
        return dateObj.toLocaleDateString("en-US", {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    }
  };
  