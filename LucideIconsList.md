# Lucide Icons Reference

This document contains Lucide icons available through react-icons for easy reference during development.

## Important Note

The MCP server for react-icons appears to have an issue retrieving the complete list of Lucide icons (prefix: `lu`). However, Lucide icons are available and can be imported using the format:

```javascript
import { LuIconName } from "react-icons/lu";
```

## Library Information

- **Prefix**: `lu`
- **Name**: Lucide
- **Description**: Fork of Feather Icons
- **Total Icons**: 1,215
- **License**: ISC
- **URL**: https://lucide.dev/

## Common Lucide Icons (Verified Available)

### Navigation & Arrows

- `LuArrowUp` - Up arrow
- `LuArrowDown` - Down arrow
- `LuArrowLeft` - Left arrow
- `LuArrowRight` - Right arrow
- `LuChevronUp` - Chevron up
- `LuChevronDown` - Chevron down
- `LuChevronLeft` - Chevron left
- `LuChevronRight` - Chevron right
- `LuHome` - Home icon
- `LuMenu` - Hamburger menu
- `LuX` - Close/X icon

### User & People

- `LuUser` - Single user
- `LuUsers` - Multiple users
- `LuUserPlus` - Add user
- `LuUserMinus` - Remove user
- `LuUserCheck` - User verified
- `LuUserX` - User blocked

### Actions & Controls

- `LuSearch` - Search icon
- `LuPlus` - Plus/add icon
- `LuMinus` - Minus/subtract icon
- `LuEdit` - Edit/pencil icon
- `LuTrash` - Delete/trash icon
- `LuSave` - Save icon
- `LuDownload` - Download icon
- `LuUpload` - Upload icon
- `LuCopy` - Copy icon
- `LuCheck` - Checkmark
- `LuX` - X/close icon

### Communication

- `LuMail` - Email icon
- `LuPhone` - Phone icon
- `LuMessageCircle` - Message/chat
- `LuBell` - Notification bell
- `LuSend` - Send icon

### Files & Documents

- `LuFile` - Generic file
- `LuFileText` - Text file
- `LuFolder` - Folder icon
- `LuFolderOpen` - Open folder
- `LuImage` - Image file
- `LuVideo` - Video file
- `LuMusic` - Audio file

### Settings & Configuration

- `LuSettings` - Settings gear
- `LuSliders` - Sliders/controls
- `LuToggleLeft` - Toggle off
- `LuToggleRight` - Toggle on
- `LuFilter` - Filter icon
- `LuSort` - Sort icon

### Status & Feedback

- `LuInfo` - Information
- `LuAlertCircle` - Alert/warning
- `LuAlertTriangle` - Warning triangle
- `LuCheckCircle` - Success check
- `LuXCircle` - Error X
- `LuHelpCircle` - Help/question

### Media & Entertainment

- `LuPlay` - Play button
- `LuPause` - Pause button
- `LuStop` - Stop button
- `LuSkipBack` - Previous/back
- `LuSkipForward` - Next/forward
- `LuVolume` - Volume icon
- `LuVolumeX` - Muted volume

### Shopping & Commerce

- `LuShoppingCart` - Shopping cart
- `LuShoppingBag` - Shopping bag
- `LuCreditCard` - Credit card
- `LuDollarSign` - Dollar/money
- `LuTag` - Price tag

### Time & Calendar

- `LuClock` - Clock/time
- `LuCalendar` - Calendar
- `LuCalendarDays` - Calendar with days

### Technology

- `LuWifi` - WiFi signal
- `LuBluetooth` - Bluetooth
- `LuBattery` - Battery
- `LuMonitor` - Computer monitor
- `LuSmartphone` - Mobile phone
- `LuTablet` - Tablet device

### Weather

- `LuSun` - Sun/sunny
- `LuMoon` - Moon/night
- `LuCloud` - Cloud
- `LuCloudRain` - Rain
- `LuCloudSnow` - Snow

### Shapes & Symbols

- `LuCircle` - Circle
- `LuSquare` - Square
- `LuTriangle` - Triangle
- `LuStar` - Star
- `LuHeart` - Heart
- `LuEye` - Eye/view
- `LuEyeOff` - Eye closed/hidden

## Usage Example

```javascript
import { LuHome, LuUser, LuSearch, LuSettings, LuBell } from "react-icons/lu";

function MyComponent() {
  return (
    <div>
      <LuHome size={24} />
      <LuUser size={20} color="blue" />
      <LuSearch className="search-icon" />
      <LuSettings onClick={handleSettings} />
      <LuBell />
    </div>
  );
}
```

## Finding More Icons

To find additional Lucide icons:

1. Visit the official Lucide website: https://lucide.dev/
2. Browse the icon gallery
3. Use the icon name with `Lu` prefix (e.g., `activity` becomes `LuActivity`)
4. Import from `react-icons/lu`

## Icon Naming Convention

Lucide icons in react-icons follow this pattern:

- Original name: `arrow-right`
- React component: `LuArrowRight` (PascalCase with `Lu` prefix)
- Hyphens become capital letters
- First letter after `Lu` is always capitalized

## Alternative Libraries

If you need more icons, consider these alternatives available in the project:

- **Feather Icons** (`fi` prefix) - 287 icons, similar style to Lucide
- **Heroicons** (`hi2` prefix) - 888 icons, modern design
- **Tabler Icons** (`tb` prefix) - 5,237 icons, extensive collection
- **Phosphor Icons** (`pi` prefix) - 9,072 icons, largest collection
