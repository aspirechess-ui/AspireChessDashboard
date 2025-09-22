# Chakra UI Components Reference

This document contains all available Chakra UI components for easy reference during development.

## Available Components (Total: 95)

### Layout Components

- **absolute-center** - Centers content absolutely
- **aspect-ratio** - Maintains aspect ratio
- **box** - Basic container component
- **center** - Centers content
- **container** - Responsive container
- **flex** - Flexbox container
- **grid** - CSS Grid container
- **simple-grid** - Simple responsive grid
- **stack** - Stacks elements with spacing
- **hstack** - Horizontal stack
- **vstack** - Vertical stack
- **wrap** - Wraps content
- **spacer** - Flexible spacer
- **square** - Square container
- **circle** - Circular container
- **bleed** - Negative margin utility
- **float** - Floating elements
- **sticky** - Sticky positioning

### Typography

- **heading** - Heading text
- **text** - Body text
- **em** - Emphasized text
- **strong** - Strong text
- **mark** - Highlighted text
- **code** - Inline code
- **kbd** - Keyboard input
- **blockquote** - Block quotations
- **quote** - Quote component
- **highlight** - Text highlighting

### Form Components

- **button** - Button component
- **input** - Text input
- **input-group** - Input with addons
- **input-addon** - Input addon
- **input-element** - Input element wrapper
- **password-input** - Password input field
- **textarea** - Multi-line text input
- **select** - Select dropdown
- **native-select** - Native select element
- **checkbox** - Checkbox input
- **checkbox-card** - Checkbox as card
- **radio-group** - Radio button group
- **radio-card** - Radio as card
- **switch** - Toggle switch
- **slider** - Range slider
- **number-input** - Number input
- **pin-input** - PIN/OTP input
- **file-upload** - File upload
- **editable** - Inline editing
- **field** - Form field wrapper
- **fieldset** - Form fieldset

### Navigation

- **breadcrumb** - Breadcrumb navigation
- **link** - Link component
- **menu** - Dropdown menu
- **pagination** - Pagination controls
- **steps** - Step indicator
- **tabs** - Tab navigation
- **segment-group** - Segmented control

### Data Display

- **badge** - Status badge
- **tag** - Tag/chip component
- **avatar** - User avatar
- **card** - Card container
- **data-list** - Key-value data list
- **list** - List component
- **table** - Data table
- **stat** - Statistics display
- **timeline** - Timeline component
- **tree-view** - Tree structure

### Feedback

- **alert** - Alert messages
- **toast** - Toast notifications
- **progress** - Progress bar
- **progress-circle** - Circular progress
- **spinner** - Loading spinner
- **skeleton** - Loading skeleton
- **loader** - Generic loader
- **empty-state** - Empty state display
- **status** - Status indicator

### Overlay

- **dialog** - Modal dialog
- **drawer** - Side drawer
- **popover** - Popover overlay
- **tooltip** - Tooltip
- **hover-card** - Hover card

### Media

- **image** - Image component
- **icon** - Icon wrapper

### Utility

- **show** - Conditional rendering
- **visually-hidden** - Screen reader only
- **portal** - Portal rendering
- **client-only** - Client-side only
- **environment** - Environment detection
- **presence** - Animation presence
- **focus-trap** - Focus management
- **skip-nav** - Skip navigation
- **for** - Loop rendering
- **format** - Text formatting
- **locale** - Localization
- **group** - Group wrapper

### Interactive

- **accordion** - Collapsible content
- **collapsible** - Collapsible component
- **clipboard** - Clipboard operations
- **color-picker** - Color selection
- **color-swatch** - Color display
- **combobox** - Combo box input
- **download-trigger** - Download trigger
- **rating-group** - Star rating
- **toggle** - Toggle component

### Charts (Recharts Integration)

- **area-chart** - Area chart
- **bar-chart** - Bar chart
- **bar-list** - Bar list
- **bar-segment** - Segmented bar
- **donut-chart** - Donut chart
- **line-chart** - Line chart
- **pie-chart** - Pie chart
- **radar-chart** - Radar chart
- **radial-chart** - Radial chart
- **scatter-chart** - Scatter plot
- **sparkline** - Mini chart

### Special Components

- **action-bar** - Action bar
- **checkmark** - Checkmark icon
- **radiomark** - Radio mark
- **qr-code** - QR code generator
- **separator** - Visual separator
- **span** - Inline wrapper

## Usage Notes

1. **Import Pattern**: Most components follow the pattern `import { ComponentName } from '@chakra-ui/react'`
2. **Responsive**: All components support responsive props
3. **Theme Integration**: Components automatically integrate with your theme
4. **Accessibility**: Built-in accessibility features
5. **Customization**: Extensive customization through props and theme

## Common Props

Most Chakra UI components support these common props:

- `size` - Component size variants
- `variant` - Style variants
- `colorScheme` - Color theme
- `isDisabled` - Disabled state
- `isLoading` - Loading state
- Responsive props (e.g., `fontSize={{ base: 'sm', md: 'md' }}`)
- Style props (margin, padding, color, etc.)

For detailed props and examples of each component, use the MCP server tools to get specific component information.
