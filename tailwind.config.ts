import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "var(--color-bg-primary)",
          secondary: "var(--color-bg-secondary)",
          tertiary: "var(--color-bg-tertiary)",
        },
        accent: {
          cyan: "var(--color-accent-cyan)",
          orange: "var(--color-accent-orange)",
          green: "var(--color-accent-green)",
          gold: "var(--color-accent-gold)",
          red: "var(--color-accent-red)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
        },
        agent: {
          scout: "var(--color-agent-scout)",
          insider: "var(--color-agent-insider)",
          referee: "var(--color-agent-referee)",
          tactic: "var(--color-agent-tactic)",
          context: "var(--color-agent-context)",
          momentum: "var(--color-agent-momentum)",
          wall: "var(--color-agent-wall)",
          goal: "var(--color-agent-goal)",
          corner: "var(--color-agent-corner)",
          card: "var(--color-agent-card)",
          crowd: "var(--color-agent-crowd)",
          live: "var(--color-agent-live)",
          debate: "var(--color-agent-debate)",
          debrief: "var(--color-agent-debrief)",
        },
      },
      spacing: {
        1: "var(--spacing-1)",
        2: "var(--spacing-2)",
        4: "var(--spacing-4)",
        6: "var(--spacing-6)",
        8: "var(--spacing-8)",
        12: "var(--spacing-12)",
        16: "var(--spacing-16)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      fontFamily: {
        body: "var(--font-body)",
        display: "var(--font-display)",
        mono: "var(--font-mono)",
      },
      fontSize: {
        xs: "var(--text-xs)",
        sm: "var(--text-sm)",
        base: "var(--text-base)",
        lg: "var(--text-lg)",
        xl: "var(--text-xl)",
        "2xl": "var(--text-2xl)",
        "3xl": "var(--text-3xl)",
      },
      fontWeight: {
        normal: "var(--font-normal)",
        medium: "var(--font-medium)",
        semibold: "var(--font-semibold)",
        bold: "var(--font-bold)",
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-4px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(4px)" },
        },
      },
      animation: {
        shake: "shake 0.5s ease-in-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
