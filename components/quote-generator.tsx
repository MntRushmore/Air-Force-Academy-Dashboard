"use client"

import { useEffect, useState } from "react"
import { Quote } from "lucide-react"

const quotes = [
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
  },
  {
    text: "If you set your goals ridiculously high and it's a failure, you will fail above everyone else's success.",
    author: "James Cameron",
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
  },
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
  },
  {
    text: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    author: "Winston Churchill",
  },
  {
    text: "Aim for the sky, but move slowly, enjoying every step along the way.",
    author: "Chanda Kochhar",
  },
  {
    text: "The only limit to our realization of tomorrow will be our doubts of today.",
    author: "Franklin D. Roosevelt",
  },
]

export function QuoteGenerator() {
  const [quote, setQuote] = useState(quotes[0])

  useEffect(() => {
    // Get a random quote on initial load
    const randomIndex = Math.floor(Math.random() * quotes.length)
    setQuote(quotes[randomIndex])
  }, [])

  return (
    <div className="flex flex-col items-center text-center space-y-4">
      <Quote className="h-8 w-8 text-primary" />
      <p className="text-lg italic">"{quote.text}"</p>
      <p className="text-sm text-muted-foreground">— {quote.author}</p>
    </div>
  )
}
