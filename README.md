# portfoli — Luxury Multi-User Glassmorphic Portfolio Platform

**portfoli** is a high-performance, multi-user portfolio SaaS platform designed to give creators, developers, designers, and agencies an ultra-confident, prestigious web presence.

---

## 💎 Signature Visual & Interactive Design
- **Theme Aesthetics**: Obsidian Dark Mode (`#070a08` with glowing `#00FF87` emerald accents) and Snow Pearl Light Mode (`#ffffff` with `#059669` jade accents).
- **4 Bespoke Display Modes**:
  1. **3D Crystal Prism**: Interactive multifaceted 3D glass prism cards with dynamic light refraction and facet switching.
  2. **Side-Swipe Cards**: Fluid horizontal slider with velocity-matched kinetic parallax motion.
  3. **3D Carousel**: Rotating focal carousel with active center stage and depth scaling.
  4. **Luxury Bento Grid**: Asymmetrical editorial masonry grid with glass lightbox inspect.
- **Zero Autoplay Video Player**: Strict click-to-play interaction with glowing emerald glass controls and theater lightbox.

---

## 🚀 Tier System & Quotas

| Tier | Price | Video Limit | Image Limit | Storage Quota | URL / Subdomain | Key Features |
|---|---|---|---|---|---|---|
| **Free Starter** | ₦0 / yr | 1 Video | 5 Photos | 200 MB | `portfoli.site/username` | Carousel & Bento Grid Modes |
| **Creator Pro** | ₦2,000 / yr | 10 Videos | 70 Photos | 1 GB | `portfoli.site/username` | Side-Swipe Cards, Custom Fonts, Daily Countdown |
| **Elite Mastery** | ₦5,000 / yr | Unlimited | Unlimited | 2 GB (Hard Cap) | `username.portfoli.site` (Custom Subdomain) | 3D Crystal Prism, Kaggle WebM Video Pipeline, Zero Branding |

---

## ⚡ Data Flow Kanban Rectangular Cycle

```mermaid
flowchart TD
    subgraph STAGE1 ["1. ONBOARDING & ROUTING GATEWAY"]
        A1["User Registration / Login"] --> A2["Unique Username / Slug Claim"]
        A2 --> A3{"Tier Validation"}
        A3 -->|Free / 2k Pro| A4["Route: portfoli.site/{username}"]
        A3 -->|5k Elite Tier| A5["Route: {username}.portfoli.site + Slug"]
    end

    subgraph STAGE2 ["2. PORTFOLIO STUDIO (CRUD ENGINE)"]
        B1["Profile & Bio Customizer"] --> B4["Theme & Typography Engine"]
        B2["Socials & Custom Links"] --> B4
        B3["Services & Pricing Matrix"] --> B4
        B4 --> B5["Project Showcase Builder"]
        B5 --> B6["Display Mode Selector\n(Carousel / Swipe / 3D Crystal Prism)"]
    end

    subgraph STAGE3 ["3. MEDIA INGESTION & QUOTA PIPELINE"]
        C1["Media Upload Input (Image / Video)"] --> C2{"Storage Quota Check\n(Free: 200MB | 2k: 1GB | 5k: 2GB)"}
        C2 -->|Quota Exceeded| C3["Reject & Prompt Upgrade Modal"]
        C2 -->|Quota OK| C4{"Media Type & Size"}
        C4 -->|Image or Video ≤100MB| C5["Direct Upload to Hugging Face Hub"]
        C4 -->|Video > 100MB| C6["Dispatch to Kaggle Compression Queue"]
        C6 --> C7["Two-Pass WebM VP9/Opus Compression"]
        C7 --> C5
    end

    subgraph STAGE4 ["4. PERSISTENCE & STORAGE SYNC"]
        D1["Hugging Face LFS / Dataset Store"] --> D2["Generate High-Speed CDN URL"]
        D2 --> D3["Update Portfolio Database (Prisma/Postgres)"]
        D3 --> D4["Revalidate User Portfolio Cache"]
    end

    subgraph STAGE5 ["5. HIGH-END VIEWER EXPERIENCE"]
        E1["Visitor hits Subdomain or Slug URL"] --> E2["Fetch Cached Profile & Layout Config"]
        E2 --> E3["Render Luxury Glassmorphic UI\n(Dark Emerald / Light Snow Modes)"]
        E3 --> E4["Mount Interactive Display\n(3D Crystal Prisms, Parallax Tilt, Bento)"]
        E4 --> E5["User Click-to-Play Video Controller\n(Zero Autoplay, Custom Glass Player)"]
        E4 --> E6["Contact / Inquire Direct Dispatch"]
    end

    subgraph STAGE6 ["6. SUBSCRIPTION & ADMIN LIFECYCLE"]
        F1["Daily Countdown Scheduler Daemon"] --> F2["Update User Dashboard (Days Remaining)"]
        F2 --> F3{"Subscription Expired?"}
        F3 -->|Yes| F4["Graceful Downgrade to Free Quota"]
        F3 -->|No| F5["Maintain Active Pro/Elite Features"]
        F6["Admin Dashboard"] --> F7["Dynamic Pricing Adjuster (Free, 2k, 5k)"]
        F6 --> F8["Global Subscriptions & Storage Telemetry"]
    end

    STAGE1 --> STAGE2
    STAGE2 --> STAGE3
    STAGE3 --> STAGE4
    STAGE4 --> STAGE5
    STAGE5 -.->|Inquiries & View Analytics| STAGE2
    STAGE6 -.->|Quota & Subdomain Permissions| STAGE1
    STAGE6 -.->|Pricing & Limits Control| STAGE3
```

---

## 🛠️ Technology Stack
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Custom Glassmorphism Shader Tokens
- **Motion & 3D Optics**: Framer Motion
- **Icons**: Lucide React
- **Storage**: Hugging Face Hub Dataset API (`epic98/portfoli-media`)
- **Video Compression**: Kaggle Kernel Two-Pass VP9 WebM Pipeline
