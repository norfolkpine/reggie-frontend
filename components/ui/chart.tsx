"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

export function ChartContainer({ config, className, children, ...props }: ChartContainerProps) {
  return (
    <div
      className={cn("chart-container", className)}
      style={Object.fromEntries(
        Object.entries(config).flatMap(([key, value]) => [
          [`--color-${key}`, value.color],
          [`--label-${key}`, value.label],
        ]),
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface ChartTooltipProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ChartTooltip({ className, ...props }: ChartTooltipProps) {
  return <div className={cn("chart-tooltip", className)} {...props} />
}

interface ChartTooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    payload: {
      [key: string]: any
    }
  }>
  label?: string
  formatters?: {
    [key: string]: (value: number) => string
  }
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  formatters = {},
  ...props
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className={cn("rounded-lg border bg-background p-2 shadow-sm", className)} {...props}>
      <div className="grid gap-2">
        <div className="grid gap-1">
          <p className="text-sm font-medium">{label}</p>
        </div>
        <div className="grid gap-1">
          {payload.map((item, index) => {
            const formatter = formatters[item.name] || ((value: number) => `${value}`)
            return (
              <div key={`item-${index}`} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: `var(--color-${item.name})`,
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    {`var(--label-${item.name})` in document.documentElement.style
                      ? getComputedStyle(document.documentElement).getPropertyValue(`--label-${item.name}`).trim()
                      : item.name}
                  </p>
                </div>
                <p className="text-xs font-medium">{formatter(item.value)}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

