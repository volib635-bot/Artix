

# Implementation Plan: Document/Design Naming & User Settings

## Overview
This plan adds two key features:
1. **Rename functionality** for documents and system designs directly from the list view
2. **User Settings page** with profile management and account options

---

## Part 1: Rename Documents & System Designs

### Current State
- Documents and system designs can only have their names set when editing (via the editor toolbar for documents)
- No quick rename option exists in the list view in `ProjectWorkspace.tsx`
- The dropdown menus only have a "Delete" option

### Implementation

#### 1.1 Add Rename Dialog Component
Create a reusable `RenameDialog.tsx` component:
- Modal dialog with an input field for the new name
- Validates input (not empty, max length)
- Cancel and Save buttons
- Used for both documents and system designs

#### 1.2 Update ProjectWorkspace.tsx
- Add "Rename" option to the dropdown menus for both documents and system designs
- Integrate the RenameDialog component
- Add state for tracking which item is being renamed
- Call `updateDocument` or `updateDesign` on save

#### 1.3 Update System Architect Header
- Make the design name in `SystemArchitect.tsx` editable (similar to how document titles work in `EditorToolbar.tsx`)
- Add an inline editable input that triggers `updateDesign` with the new name

---

## Part 2: User Settings

### Features
- View/update display name
- View email (read-only)
- Change password
- Sign out
- Delete account (with confirmation)

### Implementation

#### 2.1 Database: Add Profiles Table
Create a migration to add a `profiles` table:
```text
profiles
- id (uuid, primary key, references auth.users)
- display_name (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

Add RLS policies for user-owned data access.

Create a trigger to auto-create a profile when a user signs up.

#### 2.2 Create useProfile Hook
New hook `src/hooks/useProfile.tsx`:
- Fetch the current user's profile
- Update profile (display_name)
- Handle loading states

#### 2.3 Create Settings Page
New page `src/pages/Settings.tsx`:
- Profile section: display name input with save button
- Account section: email (read-only), change password button
- Danger zone: delete account button with confirmation dialog

#### 2.4 Add Password Change Functionality
Extend `useAuth.tsx` with:
- `updatePassword(newPassword)` method using Supabase auth

#### 2.5 Add Delete Account Functionality
Extend `useAuth.tsx` with:
- Client-side sign out and account deletion flow
- Note: Full account deletion requires a backend function for security

#### 2.6 Update Navigation
- Add Settings icon/link to `Navbar.tsx`
- Route the User icon button to `/settings`
- Add route in `App.tsx`

---

## File Changes Summary

| File | Action |
|------|--------|
| `src/components/RenameDialog.tsx` | Create - reusable rename modal |
| `src/pages/ProjectWorkspace.tsx` | Edit - add rename dropdown options |
| `src/components/SystemArchitect/SystemArchitect.tsx` | Edit - editable name in header |
| `supabase/migrations/[timestamp].sql` | Create - profiles table |
| `src/hooks/useProfile.tsx` | Create - profile CRUD hook |
| `src/hooks/useAuth.tsx` | Edit - add password update |
| `src/pages/Settings.tsx` | Create - settings page |
| `src/components/Navbar.tsx` | Edit - link to settings |
| `src/App.tsx` | Edit - add /settings route |

---

## Technical Details

### RenameDialog Component
```text
Props:
- open: boolean
- onOpenChange: (open: boolean) => void
- currentName: string
- onSave: (newName: string) => Promise<void>
- title: string (e.g., "Rename Document")
```

### Profiles Table Migration
```text
- Create profiles table with user_id foreign key
- Enable RLS with policies for own-data access
- Create trigger function to auto-create profile on signup
```

### Settings Page Layout
```text
+----------------------------------+
|  Settings                        |
+----------------------------------+
|  Profile                         |
|  +----------------------------+  |
|  | Display Name: [________]   |  |
|  | Email: user@email.com      |  |
|  | [Save Changes]             |  |
|  +----------------------------+  |
|                                  |
|  Security                        |
|  +----------------------------+  |
|  | [Change Password]          |  |
|  +----------------------------+  |
|                                  |
|  Danger Zone                     |
|  +----------------------------+  |
|  | [Delete Account]           |  |
|  +----------------------------+  |
+----------------------------------+
```

---

## Execution Order

1. Create `RenameDialog.tsx` component
2. Update `ProjectWorkspace.tsx` with rename functionality
3. Update `SystemArchitect.tsx` with editable name
4. Create database migration for profiles table
5. Create `useProfile.tsx` hook
6. Update `useAuth.tsx` with password change
7. Create `Settings.tsx` page
8. Update `Navbar.tsx` and `App.tsx` with routing

