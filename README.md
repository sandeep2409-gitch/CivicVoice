# Civic Voice 🏛️

**Civic Voice** is an AI-powered community platform designed to bridge the gap between citizens and local authorities, enabling faster resolution of civic issues.

## 📝 Project Description

### Problem Statement:
In many rapidly growing cities, there is a severe disconnect between the community and local administration. Citizens often struggle to report civic issues (such as broken infrastructure, sanitation problems, or traffic hazards) through complicated, outdated channels. When reports are finally made, administrators are overwhelmed with unorganized, duplicate complaints and lack a reliable way to prioritize them based on actual urgency, leading to delayed resolutions and community frustration.

### Solution Overview:
**Civic Voice** solves this by providing a hyper-streamlined, AI-powered issue reporting and tracking platform. Citizens can instantly report problems by simply snapping a photo and writing a brief caption. Behind the scenes, the platform leverages Google Gemini AI to automatically analyze the image and text, categorizing the issue and assigning an objective severity score. 

The platform then routes this into a unified Community Feed, where neighbors can upvote ("confirm") issues to increase their priority. Administrators receive a clean, data-rich Dashboard that automatically ranks incoming reports based on the AI's severity assessment and community velocity, allowing them to instantly identify and resolve the most critical problems.

### Key Features:
* **AI-Assisted Reporting:** Citizens upload photos and brief descriptions; AI automatically categorizes the issue (e.g., Infrastructure, Sanitation, Safety) and assigns a priority level.
* **Community Validation:** A real-time, interactive feed allows local residents to view and "confirm" nearby issues, boosting their visibility and priority score.
* **Intelligent Admin Dashboard:** A locked-down command center for authorities that aggregates reports, provides live data visualizations of issue statuses, and ranks complaints using an algorithm combining AI severity and community confirmations.
* **Transparent Resolution Tracking:** When admins mark an issue as "Resolved," the community feed instantly updates with a prominent watermark, closing the feedback loop and building trust.

### Technologies Used:
* **Frontend Framework:** Next.js (App Router, React 18)
* **Styling & UI:** Tailwind CSS, Lucide React (Icons)
* **Data Visualization:** Recharts
* **Backend & Database:** Firebase (Firestore)
* **Authentication:** Firebase Auth
* **Image Hosting:** Cloudinary

### Google Technologies Utilized:
1. **Google Gemini API:** 
   * Used as the core intelligence engine for the platform. It processes the raw, unstructured issue descriptions provided by users and returns structured, JSON-formatted data containing the issue's category, a concise summary, suggested administrative actions, and a critical severity ranking (High, Medium, Low).
2. **Google Cloud Platform (GCP):** 
   * The application is deployed and hosted on Google Cloud infrastructure for reliable, scalable production access.
3. **Firebase (Google):** 
   * **Firestore:** Serves as the real-time NoSQL database syncing reports instantly between the citizen feed and the admin dashboard.
   * **Firebase Authentication:** Handles secure user onboarding and Role-Based Access Control (RBAC) to differentiate between standard citizens and authorized administrators.

---

## 🛠️ Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/civic-voice.git
   cd civic-voice
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:** Create a `.env.local` file with the following keys:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement

   # Google Gemini API
   GEMINI_API_KEY=your_gemini_key

   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
