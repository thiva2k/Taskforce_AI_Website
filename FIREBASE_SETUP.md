# Setup & Configuration Guide

This guide outlines the services required and the security rules needed to enable the **AI TaskForce Admin Dashboard** and **Blog** functionality.

## 1. Firebase Services

Enable the following services in your [Firebase Console](https://console.firebase.google.com/):

### A. Authentication
*   **Purpose**: Secures the Admin Dashboard so only authorized personnel can create/edit posts.
*   **Provider to Enable**: **Email/Password**.
*   **Action**:
    1.  Go to **Authentication** > **Sign-in method**.
    2.  Enable **Email/Password**.
    3.  Go to **Users** tab and **Add user**.
    4.  Create your admin account (e.g., `admin@ai-taskforce.com` / `your-secure-password`).

### B. Firestore Database
*   **Purpose**: Stores blog post content, metadata (title, author, date), and configuration.
*   **Action**:
    1.  Go to **Firestore Database**.
    2.  Click **Create Database**.
    3.  Choose a location (e.g., `nam5 (us-central)`).
    4.  Start in **Production mode**.

## 2. Cloudinary Setup (Image Storage)

We use Cloudinary for storing blog post cover images.

### A. Create Account
1.  Sign up at [Cloudinary](https://cloudinary.com/).

### B. Configuration
1.  Go to **Settings** > **Upload**.
2.  Scroll down to **Upload presets**.
3.  Click **Add upload preset**.
4.  **Name**: Give it a name (e.g., `ai-taskforce-blog`).
5.  **Signing Mode**: Select **Unsigned** (important for direct browser uploads).
6.  **Folder**: (Optional) Set a folder name like `blog-images`.
7.  Click **Save**.

### C. Environment Variables
Get your **Cloud Name** from the Dashboard and the **Upload Preset Name** you just created. Add them to your `.env` file:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_name
```

---

## 3. Firebase Security Rules

Copy and paste these rules into the "Rules" tab of the Firestore service in the Firebase Console.

### Firestore Security Rules
These rules ensure:
*   **Public Read Access**: Anyone can read blog posts (for the main website).
*   **Admin Write Access**: Only authenticated users can create, update, or delete posts.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Blog Posts Collection
    match /posts/{postId} {
      // Allow anyone to read posts
      allow read: if true;
      
      // Allow only authenticated users to write (create/update/delete)
      allow write: if request.auth != null;
    }
    
    // Default deny for other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 4. Deployment Checklist

1.  [ ] **Authentication**: Admin user created in Firebase Console?
2.  [ ] **Firestore**: Database created and rules updated?
3.  [ ] **Cloudinary**: Account created and unsigned upload preset configured?
4.  [ ] **Environment**: `.env` file populated with Firebase keys and Cloudinary credentials?
