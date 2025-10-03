"use client"
import React, { useEffect, useState } from "react";
import { FlipWords } from "@/components/ui/flip-words";
import { SparklesCore } from "@/components/ui/sparkles";
import { BackgroundLines } from "@/components/ui/background-lines";
import AnimatedSubmitButton from "@/components/ui/customSubmitButton";
import { useTheme } from "next-themes";

function HomePage() {
  const words = ["faster", "smarter", "easier", "better", "deeper", "together"];

  const [sparkleColor, setSparkleColor] = useState("#ffffff"); // fallback color

  const { theme, systemTheme } = useTheme()


  useEffect(() => {
    if (!theme) return // ← prevent undefined theme error
    const timeout = setTimeout(() => {
      const color = getComputedStyle(document.documentElement)
        .getPropertyValue("--sparkle-color")
        .trim()
      setSparkleColor(color)
    }, 50) // small delay ensures class is applied
  
    return () => clearTimeout(timeout)
  }, [theme, systemTheme])

  return (
    <div className="flex w-full flex-col items-center justify-center px-4">
      <BackgroundLines className="flex w-full flex-col px-4">
        {/* Slogan styled like "Aceternity" */}
        <div className="mt-30 mb-10 flex w-full flex-col items-center justify-center overflow-hidden rounded-md bg-transparent">
          <h1 className="relative z-20 w-[55rem] px-4 text-center text-3xl font-bold text-[--foreground] md:text-5xl lg:text-4xl">
            “No need to study cruddy — just use your Buddy!”
          </h1>

          <div className="relative mt-4 h-20 w-[70rem] z-10">
            {/* Sparkles effect */}
            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={1200}
              className="h-full w-full"
              particleColor={sparkleColor}
            />

            {/* Radial Gradient to prevent sharp edges */}
            <div
              className="absolute inset-0 h-full w-full"
              style={{
                background: "var(--background)",
                maskImage:
                  "radial-gradient(350px 200px at top, transparent 20%, white)",
                WebkitMaskImage:
                  "radial-gradient(350px 200px at top, transparent 20%, white)",
              }}
            ></div>
          </div>
        </div>

        {/* FlipWords hero text */}
        <div className="flex items-center justify-center px-4">
          <div className="mx-auto text-center text-5xl leading-tight font-semibold text-neutral-600 sm:text-5xl lg:text-6xl dark:text-neutral-300">
            Study <FlipWords words={words} /> <br />
            every day with{" "}
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              Study Buddy
            </span>
          </div>
        </div>
        <div className="mt-10 flex justify-center">
          <div className="w-[30rem]">
            <AnimatedSubmitButton href="/notes">
              Start Studying
            </AnimatedSubmitButton>
          </div>
        </div>
      </BackgroundLines>
    </div>
  );
}

export default HomePage;
