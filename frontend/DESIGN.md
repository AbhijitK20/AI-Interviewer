# AI Interviewer - Design System

## Brand
- **Primary Color**: `#6366f1` (Indigo-500) - trust, intelligence, professionalism
- **Primary Hover**: `#4f46e5` (Indigo-600)
- **Background**: `#f9fafb` (Gray-50)
- **Surface**: `#ffffff` (White)
- **Text Primary**: `#111827` (Gray-900)
- **Text Secondary**: `#6b7280` (Gray-500)
- **Success**: `#10b981` (Emerald-500)
- **Warning**: `#f59e0b` (Amber-500)
- **Error**: `#ef4444` (Red-500)

## Typography
- **Headings**: Inter, system-ui, sans-serif - bold, tight tracking
- **Body**: Inter, system-ui, sans-serif - regular weight
- **Mono**: JetBrains Mono, monospace - for code/coding environment

## Spacing Scale
- 4px base unit
- Components use 16px padding
- Cards use 24px padding
- Page margins: 32px mobile, 64px desktop

## Components

### Buttons
- Primary: `bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2`
- Secondary: `bg-white border border-gray-300 text-gray-700 rounded-lg px-4 py-2`
- Danger: `bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2`
- All buttons: `transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`

### Cards
- `bg-white rounded-lg shadow-sm border border-gray-200 p-6`
- Hover state: `hover:shadow-md transition-shadow`

### Forms
- Inputs: `w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500`
- Labels: `block text-sm font-medium text-gray-700 mb-1`
- Selects: Same as inputs with custom chevron

### Navigation
- Sidebar: Fixed left, 64px wide on mobile, 256px on desktop
- Active link: `bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600`
- Inactive link: `text-gray-600 hover:bg-gray-50`

### Status Indicators
- Success badge: `bg-green-100 text-green-800 rounded-full px-2.5 py-0.5 text-xs font-medium`
- Warning badge: `bg-yellow-100 text-yellow-800`
- Error badge: `bg-red-100 text-red-800`
- Info badge: `bg-blue-100 text-blue-800`

### Interview Progress
- Progress bar: `h-2 bg-gray-200 rounded-full` with `bg-indigo-600` fill
- Question counter: `text-sm text-gray-500`

### Code Editor
- Monaco Editor with VS Dark+ theme
- Language selector: dropdown with syntax highlighting
- Run button: green accent

## Layout Patterns
- Dashboard: 3-column grid on desktop, single column on mobile
- Interview page: Split view - question left, avatar/recording right
- Report: Full-width with charts, two-column detail sections

## Animations
- Page transitions: fade-in 200ms
- Card hover: shadow transition 150ms
- Loading spinner: `animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600`
- Progress bar: smooth width transition

## Accessibility
- All interactive elements have focus rings
- Color contrast meets WCAG AA (4.5:1 for text)
- Keyboard navigation supported throughout
- Screen reader labels on all icons
