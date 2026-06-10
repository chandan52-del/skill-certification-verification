import express from "express";
import path from "path";
import cron from "node-cron";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import fs from "fs";

// Read config
const configPath = path.join(process.cwd(), "firebase-applet-config.json");
let firebaseConfig: any = null;
if (fs.existsSync(configPath)) {
  firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

const app = express();
const PORT = 3000;

let db: any = null;
if (firebaseConfig) {
  const firebaseApp = initializeApp(firebaseConfig);
  db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
}

// Ensure JSON parsing middleware
app.use(express.json());

// API route to trigger notification manually (useful for testing)
app.post("/api/notifications/trigger", async (req, res) => {
  if (!db) return res.status(500).json({ error: "Firebase not configured" });
  try {
    const sent = await checkAndSendNotifications();
    res.json({ status: "ok", sentCount: sent });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

async function checkAndSendNotifications() {
  if (!db) return 0;
  console.log("Running notification check for expiring certificates...");
  // Find certs where expiry_date is between now and 30 days from now
  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const targetTime = now + thirtyDaysMs;

  let sentCount = 0;
  try {
    const q = query(
      collection(db, "certificates"),
      where("expiry_date", ">", now),
      where("expiry_date", "<=", targetTime)
    );
    const snaps = await getDocs(q);
    
    for (const snap of snaps.docs) {
      const data = snap.data();
      // Only send if we haven't already notified
      if (data.status === 'verified' && !data.expiry_notified) {
         console.log(`[Notification Service] Sending email to student ${data.studentName} about expiring certificate ${data.certificate_id}`);
         // Mark as notified so we don't spam them daily
         await updateDoc(doc(db, "certificates", snap.id), {
           expiry_notified: true
         });
         sentCount++;
      }
    }
  } catch (err) {
    console.error("Error running notification service:", err);
  }
  return sentCount;
}

// Run every day at midnight
cron.schedule("0 0 * * *", () => {
  checkAndSendNotifications();
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
