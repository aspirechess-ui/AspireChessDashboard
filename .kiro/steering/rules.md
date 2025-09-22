<!------------------------------------------------------------------------------------
   Add Rules to this file or a short description and have Kiro refine them for you:
------------------------------------------------------------------------------------->

# **Agent Configuration: Chess Academy Management System**

_Core instructions for autonomous operation. Follow these guidelines strictly._

---

## **🎯 Primary Context & Knowledge Base**

**BEFORE starting any task, you MUST:**

1. **Read and understand** the `#Chess Academy Management System - Complete Project.md` file - this contains the complete project summary, requirements, and specifications
2. **Review** the `#CompletedTasks.md` file to understand what has already been implemented and avoid duplication
3. **Establish context** from these files before proceeding with any development work

---

## **🧭 Core Operating Principles**

- **Single Source of Truth:** The `Chess Academy Management System - Complete Project.md` file is the definitive reference for all project requirements, features, and workflows
- **Execution-Only Mode:** **DO NOT** create, modify, or implement anything unless explicitly requested. Your role is to execute specific instructions, not to act proactively
- **Component Reuse:** Strictly use existing Chakra UI components - never recreate them from scratch
- **No Custom Components:** When a relevant Chakra UI component exists, use it instead of building custom alternatives
- **Responsive Design:** Every page and component must be fully responsive for both mobile and desktop
- **Theme Awareness:** Always implement the global theme context for seamless dark/light mode functionality
- **No Mock Data:** Strictly prohibited from adding any kind of placeholder or mock data

---

## **🛠️ Technology Stack (Mandatory)**

### **Frontend**

- **Framework:** React with JavaScript (Vite-bootstrapped)
- **UI Library:** **Chakra UI** (primary) | Tailwind CSS (only when specifically instructed)
- **Icons:** **Lucide icons from react-icons** (format: `LuIconName`)
- **Routing:** React Router DOM

### **Backend**

- **Location:** `/backend` directory
- **Framework:** Express.js
- **Database:** MongoDB
- **Stack:** MERN (MongoDB, Express, React, Node.js)

---

## **🎨 Design & UI Standards**

### **Component Verification Process**

**BEFORE using any UI element, follow this order:**

1. **Reference Docs First:**

   - Check `#LucideIconsList.md` for available Lucide icons (prefix: `Lu`)
   - Check `#ChakraUIElements.md` for available Chakra UI components
   - Use these reference files as your primary source of available elements

2. **MCP Server Backup:**

   - **Only if not found in reference docs:** Search for Chakra UI components using the MCP server
   - **Only if not found in reference docs:** Search for Lucide icons using the MCP server
   - **Verify** the component/icon exists and is available before implementation

3. **Implementation:**
   - Implement the confirmed component or icon in your code

### **Theme & Styling**

- **Primary Accent Color:** `#0d9488`
- **Theme Context:** Must be implemented in every component for dark/light mode support
- **Mobile-First:** All interfaces must be fully responsive

---

## **⚙️ Operational Guidelines**

### **Icon Implementation**

```javascript
// Correct format for Lucide icons
import { LuSearch, LuUser, LuSettings } from "react-icons/lu";
```

### **Component Development**

- **Modification Over Creation:** When components need changes, modify existing ones rather than creating new ones
- **Name Consistency:** If replacing a component, use the exact same name
- **Chakra UI First:** Always check for existing Chakra UI solutions before custom development

### **File Management**

- **Progress Updates:** Only update `CompletedTasks.md` when explicitly instructed
- **Environment Variables:** No `.env.example` files - variables managed through direct instruction
- **Backend Location:** All server-side code in `/backend` directory

---

## **🚨 Critical Restrictions**

- ❌ **No proactive development** - wait for explicit instructions
- ❌ **No mock/placeholder data** in any implementation
- ❌ **No custom UI components** when Chakra UI alternatives exist
- ❌ **No technology additions** outside the approved stack
- ❌ **No theme-unaware components** - all must support dark/light modes
- ❌ **No test creation** - do not create any kind of tests (unit, integration, or end-to-end)

---

## **✅ Pre-Task Checklist**

Before starting any development task:

- [ ] Read project summary from `Chess Academy Management System - Complete Project.md`
- [ ] Review completed work in `CompletedTasks.md`
- [ ] Check `LucideIconsList.md` for required icons
- [ ] Check `ChakraUIElements.md` for required components
- [ ] Use MCP server only if elements not found in reference docs
- [ ] Ensure mobile responsiveness plan
- [ ] Confirm theme context integration approach
