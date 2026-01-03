# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GearCast is a weather-aware outfit planning app for running and skiing. It fetches live weather data from Open-Meteo and provides personalized gear recommendations based on temperature, wind, precipitation, and user comfort preferences.

## Development Commands

```bash
# Install dependencies
pnpm install

# Development server (uses HTTPS for geolocation)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Linting
pnpm lint          # Check for issues
pnpm lint:fix      # Auto-fix issues

# Formatting
pnpm format        # Check formatting
pnpm format:write  # Auto-format files

# Testing
pnpm test          # Run tests in watch mode
pnpm test:run      # Run tests once
```

## Stack and Tooling

- **Build**: Vite with React plugin, TypeScript
- **UI**: React 19, Tailwind CSS, shadcn/ui (Radix primitives)
- **Routing**: React Router v7
- **State**: Zustand for global state
- **Linting**: Oxlint (replaces ESLint, significantly faster)
- **Formatting**: Oxfmt (replaces Prettier)
- **Testing**: Vitest + Testing Library, jsdom environment
- **Package Manager**: pnpm (required, specified in package.json engines)

## Architecture

### State Management

The app uses Zustand for global state management. The main store is `useHomeStore` (src/features/home/store/useHomeStore.ts), which holds:

- Current sport (running/skiing)
- Selected location and time
- Weather forecast data
- Comfort profile settings (temperature preference, wind sensitivity, precipitation preference)
- Activity context (exertion level, trip duration)
- Pack and wear item customizations (checked items, custom items, removed items)
- Active plan ID for saved plans

State is managed through setter functions, not actions. Some setters accept function arguments to support functional updates.

### Feature Structure

The codebase follows a feature-based organization:

```
src/
  features/
    home/
      components/     # Feature-specific UI components
      hooks/          # Custom hooks for this feature
      store/          # Zustand store
      types.ts        # Feature-specific types
      utils/          # Utilities for this feature
  components/ui/      # Shared shadcn/ui components
  lib/                # Core business logic and utilities
  pages/              # Route components
```

### Core Business Logic (src/lib/)

**gear.ts**: The gear recommendation engine. Contains:

- `getWearPlan()`: Main function that computes layering recommendations
- Effective temperature calculation that adjusts for sport, exertion, duration, comfort profile, wind, precipitation, cloud cover
- Temperature thresholds for different sports (running: 20/35/50/65°F, skiing: 10/25/40°F)
- Body zone coverage system (feet, legs, torso, hands, neckFace, head, eyes)
- Confidence scoring based on proximity to threshold temperatures
- `getGearSuggestions()`: Combines wear plan with pack list recommendations

**weather.ts**: Weather data fetching and geocoding:

- `fetchForecast()`: Gets hourly weather from Open-Meteo API
- `fetchGeocoding()`: Searches locations using both Open-Meteo and Nominatim (OpenStreetMap), merges results
- `fetchReverseGeocoding()`: Converts coordinates to location names
- `fetchIpLocation()`: Falls back to IP-based location (ipapi.co)
- Area code support: Detects numeric queries (3-6 digits) and uses Nominatim postal code search
- Weather code mapping (WMO standard codes 0-99)
- Heat index and wind chill calculations

**geolocation.ts**: Browser geolocation with fallback to IP location

**time.ts**: Time utilities and formatting

### Data Flow

1. **Initial Location**: `useInitialLocation` hook attempts browser geolocation, falls back to IP location
2. **Location Search**: `useLocationSearch` hook manages search state, debounced geocoding, and recent locations (localStorage: `gearcast.recentLocations`)
3. **Forecast Loading**: `useForecastData` hook fetches weather when location changes
4. **Gear Calculation**: Components call `getGearSuggestions()` with weather data, comfort profile, and activity context
5. **Saved Plans**: `useSavedPlans` hook persists plans to localStorage (`gearcast.savedPlans`)

### Local Storage Keys

- `gearcast.recentLocations`: Recent location searches (max 3)
- `gearcast.savedPlans`: Saved gear plans with full state
- `gearcast.comfortProfile`: User's comfort preferences

### Component Patterns

Components follow these patterns:

- Use `useHomeStore` selectors to access only needed state
- Custom hooks encapsulate complex logic (location search, forecast loading, saved plans)
- UI components from shadcn/ui are in `components/ui/` and should not be edited directly (regenerate using shadcn CLI)
- Feature components are colocated in `features/home/components/`

### Routing

Routes defined in App.tsx:

- `/`: Home page (defaults to running)
- `/:sport`: Home page with sport parameter (running|skiing)
- `/plans`: Saved plans view
- `/*`: 404 page

## Testing

Tests use Vitest with jsdom environment. Setup file at `src/test/setup.ts` configures Testing Library matchers.

## Development Notes

- **HTTPS Required**: The dev server uses HTTPS (via `@vitejs/plugin-basic-ssl`) because geolocation requires secure context
- **No API Keys**: Open-Meteo APIs don't require authentication
- **Path Alias**: `@/` maps to `src/` directory
- **Oxlint Config**: Uses multiple plugins (react, jsx-a11y, import, vitest, promise, node, react-perf) configured in `.oxlintrc.json`
- **Formatting**: Oxfmt configured in `.oxfmtrc.json` with specific indent/quote settings
