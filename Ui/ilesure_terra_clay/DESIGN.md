# Design System Strategy: The Sculpted Canvas

## 1. Overview & Creative North Star
**Creative North Star: "Tactile Sophistication"**

This design system moves away from the flat, sterile nature of traditional admin dashboards toward a high-end, editorial experience rooted in **Tactile Sophistication**. By blending the soft, approachable volume of claymorphism with a rigorous, high-contrast color palette, we create a workspace that feels physically sculpted rather than digitally rendered.

The system breaks the "template" look through intentional depth, utilizing "squishy" volumes against a grounded, authoritative Burnt Brown sidebar. This isn't just a dashboard; it’s a premium digital object. We achieve this through:
*   **Volumetric Hierarchy:** Using inner and outer shadows to define importance.
*   **Asymmetric Breathing Room:** Aggressive use of white space to let the claymorphic components "live."
*   **Textural Contrast:** The tension between the organic, rounded Mustard elements and the sharp, professional editorial typography.

---

## 2. Colors
Our palette is anchored in warmth. It avoids pure blacks and cold greys, opting for a spectrum of "Organic Earth" tones that evoke trust and craftsmanship.

### The Palette
*   **Primary (Mustard):** `#715c00` (Core) / `#ffdb58` (Container). Used for primary actions and "active" focal points.
*   **Secondary (Burnt Brown):** `#934b19` (Core) / `#8b4513`. This is our grounding force, used for the sidebar and high-authority status elements.
*   **Surface & Neutral:** Ranging from `#fff9ea` (Surface) to `#e9e2cc` (Surface-highest).

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections. Layout boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section sitting on a `surface` background provides all the separation the eye needs. Borders create visual noise; tonal shifts create elegance.

### Signature Textures
Apply a subtle linear gradient to Mustard CTAs: `linear-gradient(135deg, #FFDB58 0%, #E6C443 100%)`. This adds "soul" and mimics the way light hits a curved, physical surface.

---

## 3. Typography
We use a dual-typeface system to balance personality with high-performance readability.

*   **Display & Headlines (Plus Jakarta Sans):** A modern sans-serif with geometric leanings. Used for high-level data and page titles. The wide apertures feel premium and open.
*   **Body & Labels (Manrope):** A highly functional, modern sans-serif. It remains legible at small sizes (labels) while maintaining a contemporary edge.

**Hierarchy Strategy:**
*   **Display-LG (3.5rem):** Reserved for hero metrics.
*   **Title-MD (1.125rem):** Used for card headers to ensure the "sculpted" containers have a clear anchor.
*   **Label-SM (0.6875rem):** All caps with +0.05em tracking for secondary data to maintain an editorial feel.

---

## 4. Elevation & Depth (The Claymorphic Principle)
Claymorphism relies on the illusion of soft, pliable volume. This system uses **Tonal Layering** instead of structural lines.

### The Layering Principle
Depth is achieved by "stacking" surface tiers. Place a `surface-container-lowest` card on a `surface-container-low` dashboard background. The slight shift in cream/white creates a natural lift.

### Ambient Shadows
*   **Outer Shadow:** Large blur (40px–60px), low opacity (6%–10%). Use a tinted shadow color based on `#8B4513` (Burnt Brown) rather than grey to maintain warmth.
*   **Inner Shadow (The Inset Look):** Essential for search bars and inputs. Use two inner shadows: 
    1.  Top-left: Darker tint (`#000000` at 5% opacity).
    2.  Bottom-right: Highlight (`#FFFFFF` at 80% opacity).

### Glassmorphism & Depth
For floating modals or dropdowns, use `surface-container-lowest` at 80% opacity with a `backdrop-filter: blur(12px)`. This integrates the component into the layout rather than making it feel "pasted" on top.

---

## 5. Components

### Claymorphic Cards
*   **Corner Radius:** Always `1.25rem` (20px).
*   **Elevation:** No borders. Use the double-shadow technique (Inner highlight + soft ambient outer shadow).
*   **Nesting:** Cards should never contain dividers. Use vertical spacing (spacing scale `lg`) to separate header, body, and footer.

### Buttons (Tactile Primary)
*   **Style:** `primary-container` (#FFDB58) with a 20px radius.
*   **Interactions:**
    *   **Hover:** Transform `translateY(-4px)` with an increased outer shadow blur to simulate "lifting."
    *   **Click:** Transform `scale(0.96)` and `translateY(2px)` with an inset shadow to simulate "pressing" into the clay.

### The Inset Search Bar
*   **Background:** `surface-container-high` (#efe8d2).
*   **Effect:** `box-shadow: inset 4px 4px 8px rgba(0,0,0,0.05)`.
*   **Icon:** 3D rendered style in Burnt Brown.

### Sidebar (The Anchor)
*   **Background:** `secondary` (#8B4513).
*   **Typography:** `on-secondary` (#FFFFFF) using `title-sm` (Manrope).
*   **Active State:** Use a claymorphic Mustard tab that "pokes out" from the right edge of the sidebar into the main content area.

### Tables
*   **Visuals:** Forgo vertical lines. Use `outline-variant` (#E7DCD4) at 20% opacity for horizontal dividers only.
*   **Hover State:** Row background shifts to `light mustard` (#FFF8E1) with a soft 8px corner radius on the row itself.

---

## 6. Do's and Don'ts

### Do:
*   **Use 3D Icons:** Icons should feel like physical objects. Use 3D renders with soft lighting that matches the top-left light source of the claymorphic cards.
*   **Embrace Generous Padding:** Components need room to "breathe" so their shadows don't overlap into visual mud.
*   **Use Color for Logic:** Use Burnt Brown for navigation/authority and Mustard for action/attention.

### Don't:
*   **No High-Contrast Borders:** Never use a 100% opaque border. It breaks the "soft" illusion.
*   **No Pure Grey:** Every neutral must be warmed with the Mustard or Brown base.
*   **No Flat Icons:** Standard 2D line icons will feel disconnected from the volumetric card style. If 3D is unavailable, use "duotone" icons with soft fills.
*   **No Crowding:** If you cannot fit the content without reducing padding below `1.5rem`, reconsider the information architecture. High-end design requires space.