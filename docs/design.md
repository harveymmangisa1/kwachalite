# KwachaLite Design System & UX Guidelines

## Core Design Philosophy
Create a **corporate, modern, minimal, and professional** user experience that prioritizes clarity, efficiency, and confidence-inspiring design. Every component should feel intentional, clean, and enterprise-grade.

---

## 1. Color Palette

### Primary Colors
```css
/* Backgrounds */
--background: slate-50 (#f8fafc)
--card: white (#ffffff)
--surface: slate-100 (#f1f5f9)

/* Text */
--text-primary: slate-900 (#0f172a)
--text-secondary: slate-600 (#475569)
--text-muted: slate-500 (#64748b)

/* Borders */
--border-default: slate-200 (#e2e8f0)
--border-light: slate-100 (#f1f5f9)
--border-strong: slate-300 (#cbd5e1)

/* Interactive States */
--active: slate-900 (#0f172a)
--active-bg: slate-100 (#f1f5f9)
--hover-bg: slate-50 (#f8fafc)
```

### Accent Colors (Use Sparingly)
```css
/* Success States */
--success: emerald-500 (#10b981)
--success-light: emerald-50 (#ecfdf5)

/* Error States */
--error: red-500 (#ef4444)
--error-light: red-50 (#fef2f2)

/* Warning States */
--warning: amber-500 (#f59e0b)
--warning-light: amber-50 (#fffbeb)

/* Info/Links */
--info: blue-500 (#3b82f6)
--info-light: blue-50 (#eff6ff)
```

### ❌ AVOID
- Colorful gradients (no `from-blue-500 to-purple-600`)
- Animated pulsing effects
- Neon colors or high saturation
- Multiple accent colors in one component

### ✅ USE
- Solid slate colors for primary UI
- Single accent color for CTAs (emerald for success, slate-900 for primary)
- Subtle borders (slate-200)
- Clean white backgrounds

---

## 2. Typography

### Font Hierarchy
```css
/* Headings */
--h1: text-3xl sm:text-4xl font-bold text-slate-900
--h2: text-2xl sm:text-3xl font-semibold text-slate-900
--h3: text-xl font-semibold text-slate-900
--h4: text-lg font-semibold text-slate-900

/* Body */
--body-large: text-base text-slate-600
--body: text-sm text-slate-600
--body-small: text-xs text-slate-500

/* Labels */
--label: text-sm font-medium text-slate-700
--caption: text-xs font-medium text-slate-500
```

### Font Weights
- **Bold (700)**: Main headings only
- **Semibold (600)**: Section headers, important text
- **Medium (500)**: Labels, buttons, navigation
- **Regular (400)**: Body text, descriptions

### ❌ AVOID
- Decorative fonts
- Excessive font weights
- ALL CAPS (except for small labels like "TOTAL")
- Text shadows or outlines

---

## 3. Spacing & Layout

### Spacing Scale (Tailwind)
```
2  = 8px   - Tight spacing between related items
3  = 12px  - Small gaps
4  = 16px  - Default spacing
6  = 24px  - Section spacing
8  = 32px  - Large section breaks
12 = 48px  - Major section divisions
```

### Component Padding
```css
/* Cards */
padding: p-6 sm:p-8

/* Buttons */
padding: px-4 py-2 (small), px-6 py-3 (default)

/* Input Fields */
padding: h-11 px-3 (standardized height)

/* Page Container */
padding: px-4 sm:px-6 lg:px-8 py-8

/* Mobile Safe Areas */
bottom-nav: pb-safe-area-inset-bottom
```

### Grid & Flexbox
```css
/* Mobile First */
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3

/* Common Layouts */
- Single column on mobile
- Two columns on tablet (640px+)
- Three+ columns on desktop (1024px+)
```

---

## 4. Components Standards

### Buttons

#### Primary Button
```tsx
<Button className="h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium">
  Action
</Button>
```

#### Secondary Button
```tsx
<Button variant="outline" className="h-11 border-slate-300">
  Cancel
</Button>
```

#### Success Button
```tsx
<Button className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white">
  <Check className="h-4 w-4 mr-2" />
  Confirm
</Button>
```

#### Ghost Button
```tsx
<Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-50">
  Secondary Action
</Button>
```

**Button Specifications:**
- **Height**: 11 (44px) - touch-friendly
- **Small**: h-9 (36px) for compact spaces
- **Icon size**: h-4 w-4 (16px)
- **Font**: font-medium
- **Border radius**: rounded-lg (8px)

### Input Fields
```tsx
<Input 
  type="text" 
  className="h-11 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
  placeholder="Enter value"
/>
```

**Input Specifications:**
- **Height**: h-11 (44px) - consistent with buttons
- **Border**: border-slate-300
- **Focus**: border-slate-900, ring-slate-900
- **Placeholder**: text-slate-500

### Cards
```tsx
<Card className="border border-slate-200 shadow-sm bg-white">
  <CardContent className="p-6">
    Content here
  </CardContent>
</Card>
```

**Card Specifications:**
- **Border**: border-slate-200
- **Shadow**: shadow-sm (subtle)
- **Hover**: hover:shadow-md (optional)
- **Padding**: p-6 or p-8
- **Radius**: rounded-lg or rounded-xl

### Badges/Tags
```tsx
<Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
  Active
</Badge>
```

**Badge Colors by Status:**
- Success: emerald-50 bg, emerald-600 text
- Warning: amber-50 bg, amber-600 text
- Error: red-50 bg, red-600 text
- Neutral: slate-50 bg, slate-600 text

---

## 5. Progressive Form Design

### Multi-Step Form Structure
Every complex form (3+ sections) MUST use progressive steps:

```tsx
const STEPS = [
  { id: 1, name: 'Basic Info', icon: User, description: 'Enter details' },
  { id: 2, name: 'Settings', icon: Settings, description: 'Configure options' },
  { id: 3, name: 'Review', icon: FileText, description: 'Confirm submission' },
];
```

### Step Indicator
```tsx
<div className="flex items-center justify-between mb-6">
  {STEPS.map((step, index) => (
    <React.Fragment key={step.id}>
      <div className="flex flex-col items-center flex-1">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center border-2",
          currentStep > step.id 
            ? "bg-emerald-500 border-emerald-500 text-white"
            : currentStep === step.id
            ? "bg-slate-900 border-slate-900 text-white"
            : "bg-white border-slate-300 text-slate-400"
        )}>
          {currentStep > step.id ? <Check /> : <step.icon />}
        </div>
        <p className="text-xs font-medium mt-2">{step.name}</p>
      </div>
      {index < STEPS.length - 1 && (
        <div className={cn(
          "h-0.5 flex-1 mx-2",
          currentStep > step.id ? "bg-emerald-500" : "bg-slate-200"
        )} />
      )}
    </React.Fragment>
  ))}
</div>
```

### Step Navigation
```tsx
<div className="flex items-center justify-between border-t border-slate-200 pt-4">
  <div className="flex gap-2">
    {currentStep > 1 && (
      <Button variant="outline" onClick={prevStep}>
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
    )}
    <Button variant="ghost" onClick={onCancel}>Cancel</Button>
  </div>
  
  {currentStep < STEPS.length ? (
    <Button 
      onClick={nextStep} 
      disabled={!canProceed}
      className="bg-slate-900 hover:bg-slate-800"
    >
      Continue
      <ChevronRight className="h-4 w-4 ml-2" />
    </Button>
  ) : (
    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
      <Check className="h-4 w-4 mr-2" />
      Submit
    </Button>
  )}
</div>
```

### Form Validation
- Validate on blur, not on every keystroke
- Show validation inline below field
- Disable "Next" button until step is valid
- Use red-500 for errors with red-50 background

### Step Animations
```tsx
// Each step should animate in
className="animate-in fade-in slide-in-from-right-5 duration-300"
```

---

## 6. Mobile Responsive Standards

### Breakpoints
```css
sm: 640px  /* Tablet portrait */
md: 768px  /* Tablet landscape */
lg: 1024px /* Desktop */
xl: 1280px /* Large desktop */
```

### Mobile-First Approach
Always design for mobile first, then enhance for larger screens:

```tsx
// ❌ Wrong
<div className="grid-cols-3 sm:grid-cols-1">

// ✅ Correct
<div className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
```

### Mobile Navigation
- **Bottom navigation**: Fixed, 5 items max, 64px height
- **Drawer**: Slide from left, 288px width, backdrop blur
- **Top bar**: Fixed, clean white background, minimal elements

### Touch Targets
- **Minimum**: 44px × 44px (h-11 w-11)
- **Recommended**: 48px × 48px (h-12 w-12)
- **Icons in buttons**: 16px (h-4 w-4)

### Mobile Spacing
```tsx
// Reduce padding on mobile
className="px-4 sm:px-6 lg:px-8 py-6"

// Stack on mobile, row on desktop
className="flex-col sm:flex-row"

// Hide on mobile
className="hidden sm:block"

// Show only on mobile
className="block sm:hidden"
```

---

## 7. Animation & Transitions

### Allowed Animations
```css
/* Hover transitions */
transition-colors duration-200

/* Component entrance */
animate-in fade-in duration-300
animate-in slide-in-from-right-5 duration-300

/* Loading states */
animate-spin (for spinners only)
```

### ❌ PROHIBITED Animations
- `animate-pulse` (except loading spinners)
- `animate-bounce` (too playful)
- Scale transforms on hover (scale-105)
- Gradient animations
- Elaborate keyframe animations

### Loading States
```tsx
// Spinner
<Loader2 className="h-4 w-4 animate-spin" />

// Skeleton
<div className="h-8 bg-slate-100 rounded animate-pulse" />

// Button loading
<Button disabled>
  <Loader2 className="h-4 w-4 animate-spin mr-2" />
  Processing...
</Button>
```

---

## 8. Icons

### Icon Library: Lucide React
- Use lucide-react exclusively
- Standard size: h-5 w-5 (20px)
- Small size: h-4 w-4 (16px)
- Large size: h-6 w-6 (24px)

### Icon Usage
```tsx
// In buttons
<Button>
  <Plus className="h-4 w-4 mr-2" />
  Add Item
</Button>

// Navigation
<item.icon className="h-5 w-5" />

// Status indicators
<CheckCircle className="h-5 w-5 text-emerald-500" />
```

### Icon Colors
- Active: text-slate-900
- Default: text-slate-600
- Muted: text-slate-500
- Success: text-emerald-600
- Error: text-red-600

---

## 9. Data Display

### Tables
```tsx
<div className="border border-slate-200 rounded-lg overflow-hidden">
  <table className="w-full">
    <thead className="bg-slate-50 border-b border-slate-200">
      <tr>
        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">
          Header
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-200">
      <tr className="hover:bg-slate-50">
        <td className="px-4 py-3 text-sm text-slate-900">Data</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Lists
```tsx
<div className="space-y-3">
  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
        <Icon className="h-5 w-5 text-slate-600" />
      </div>
      <div>
        <p className="font-medium text-slate-900">Title</p>
        <p className="text-sm text-slate-600">Description</p>
      </div>
    </div>
    <span className="text-sm font-semibold text-slate-900">$123</span>
  </div>
</div>
```

### Metrics/Stats Cards
```tsx
<Card className="border border-slate-200 shadow-sm">
  <CardContent className="p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
        <TrendingUp className="h-5 w-5 text-emerald-600" />
      </div>
      <Badge className="text-emerald-600 bg-emerald-50 border-emerald-200">
        +12%
      </Badge>
    </div>
    <p className="text-sm text-slate-500 mb-1">Total Revenue</p>
    <p className="text-2xl font-semibold text-slate-900">$12,450</p>
  </CardContent>
</Card>
```

---

## 10. Feedback & States

### Success Messages
```tsx
toast({
  title: 'Success',
  description: 'Action completed successfully.',
  // No variant for success - default is enough
});
```

### Error Messages
```tsx
toast({
  title: 'Error',
  description: 'Something went wrong. Please try again.',
  variant: 'destructive',
});
```

### Loading States
```tsx
// Full page
<div className="flex h-screen items-center justify-center">
  <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
</div>

// Inline
{loading ? (
  <Loader2 className="h-4 w-4 animate-spin" />
) : (
  <Content />
)}
```

### Empty States
```tsx
<div className="flex flex-col items-center justify-center py-12">
  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
    <Icon className="h-8 w-8 text-slate-400" />
  </div>
  <h3 className="text-lg font-semibold text-slate-900 mb-2">No data yet</h3>
  <p className="text-sm text-slate-600 mb-6 text-center max-w-sm">
    Get started by creating your first item.
  </p>
  <Button className="bg-slate-900 hover:bg-slate-800">
    <Plus className="h-4 w-4 mr-2" />
    Create New
  </Button>
</div>
```

---

## 11. Page Layouts

### Dashboard Layout
```tsx
<div className="min-h-screen bg-slate-50">
  {/* Header */}
  <div className="sticky top-0 z-40 bg-white border-b border-slate-200">
    <div className="container-padding h-16 flex items-center justify-between">
      {/* Navigation */}
    </div>
  </div>

  {/* Content */}
  <div className="container-padding py-8">
    {/* Page content */}
  </div>
</div>
```

### Modal/Sheet Layout
```tsx
<Sheet>
  <SheetContent className="w-full sm:max-w-2xl flex flex-col p-0">
    <SheetHeader className="px-6 pt-6 pb-4 border-b border-slate-200">
      <SheetTitle className="text-xl font-semibold text-slate-900">
        Title
      </SheetTitle>
      <SheetDescription className="text-slate-600">
        Description
      </SheetDescription>
    </SheetHeader>
    
    <ScrollArea className="flex-1 px-6">
      {/* Content */}
    </ScrollArea>
    
    <div className="px-6 py-4 border-t border-slate-200">
      {/* Footer actions */}
    </div>
  </SheetContent>
</Sheet>
```

---

## 12. Accessibility Requirements

### WCAG Compliance
- Color contrast minimum 4.5:1 for text
- All interactive elements keyboard accessible
- Proper ARIA labels on icons
- Focus indicators visible
- Screen reader text for icon-only buttons

### Implementation
```tsx
// Icon buttons need labels
<Button variant="ghost" size="icon" aria-label="Close">
  <X className="h-4 w-4" />
</Button>

// Screen reader only text
<span className="sr-only">Dashboard</span>

// Focus visible
className="focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
```

---

## 13. Do's and Don'ts Summary

### ✅ DO
- Use solid slate colors (50-900)
- Keep animations subtle and fast (200-300ms)
- Use progressive forms for complex inputs
- Maintain consistent spacing (4, 6, 8)
- Design mobile-first
- Use h-11 for all interactive elements
- Keep borders subtle (slate-200)
- Use emerald for success, red for errors
- Add loading states to all async actions
- Provide clear feedback for user actions

### ❌ DON'T
- Use colorful gradients
- Add playful animations (bounce, pulse, scale)
- Create single-page forms with 10+ fields
- Mix different button heights
- Use decorative shadows or glows
- Add emojis in professional contexts
- Use multiple accent colors
- Skip loading states
- Forget mobile responsive design
- Use neon or saturated colors

---

## 14. Code Review Checklist

Before submitting any UI component, verify:

- [ ] Uses slate color palette (no gradients)
- [ ] Buttons are h-11 (44px)
- [ ] Mobile responsive (tested at 320px, 768px, 1024px)
- [ ] Complex forms are progressive (multi-step)
- [ ] Loading states implemented
- [ ] Error states handled
- [ ] Animations are subtle (200-300ms)
- [ ] Icons from lucide-react, h-4 or h-5
- [ ] Proper ARIA labels on icon buttons
- [ ] Touch targets minimum 44px
- [ ] Borders use slate-200
- [ ] Consistent spacing (Tailwind scale)
- [ ] No emojis in corporate contexts
- [ ] Clean, minimal design

---

## 15. Example Component Template

```tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Loader2 } from 'lucide-react';
import { useState } from 'react';

export function ExampleComponent() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container-padding py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Page Title
            </h1>
            <p className="text-slate-600">Page description</p>
          </div>
          <Button className="h-11 bg-slate-900 hover:bg-slate-800">
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-semibold text-slate-900">
                Card Title
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
                </div>
              ) : (
                <p className="text-sm text-slate-600">Card content</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

---

## Quick Reference Card

### Colors
- Background: `slate-50`
- Card: `white`
- Border: `slate-200`
- Text: `slate-900` / `slate-600` / `slate-500`
- Active: `slate-100` bg
- Success: `emerald-500`
- Error: `red-500`

### Sizes
- Button: `h-11`
- Input: `h-11`
- Icon: `h-4 w-4` or `h-5 w-5`
- Spacing: `4, 6, 8`
- Border: `border` (1px)

### Typography
- H1: `text-3xl font-bold`
- H2: `text-2xl font-semibold`
- Body: `text-sm text-slate-600`
- Label: `text-sm font-medium text-slate-700`

### Components
- Progressive forms for 3+ sections
- Mobile bottom nav (5 items, h-16)
- Clean cards (border-slate-200, shadow-sm)
- Subtle animations (duration-200)

---

**Remember**: When in doubt, err on the side of simplicity. Corporate design is about trust, clarity, and efficiency—not decoration.