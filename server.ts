import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { UserAccount } from "./src/types";

// In-memory representation backed by ./db.json
const DB_PATH = path.join(process.cwd(), "db.json");

// Default seed users (Admin Indra and Member Joko)
const DEFAULT_USERS: UserAccount[] = [
  {
    id: "UID-10001",
    username: "admin",
    email: "admin@idrminer.com",
    passwordHex: "admin123",
    isAdmin: true,
    joinedAt: "25/5/2026",
    miningConfig: {
      balancePenampungan: 0,
      balanceEWallet: 0,
      totalMined: 0,
      baseHashRate: 15.0,
      boostMultiplier: 1.0,
      isMiningActive: false,
      referralCode: "IDR-ADMN",
      referredBy: null,
      referrals: [],
      autoWithdrawActive: false,
      targetEWallet: "DANA",
      walletNumber: "081211112222",
      payoutThreshold: 10000,
      payoutProgress: 0,
      payoutHistory: [],
      depositHistory: [],
      privateKey: "",
      publicKey: ""
    }
  },
  {
    id: "UID-10002",
    username: "jokowow",
    email: "joko@gmail.com",
    passwordHex: "user123",
    isAdmin: false,
    joinedAt: "25/5/2026",
    miningConfig: {
      balancePenampungan: 18450,
      balanceEWallet: 54000,
      totalMined: 72450,
      baseHashRate: 4.8,
      boostMultiplier: 1.0,
      isMiningActive: true,
      referralCode: "IDR-F7X8",
      referredBy: null,
      referrals: [],
      autoWithdrawActive: true,
      targetEWallet: "DANA",
      walletNumber: "081298765432",
      payoutThreshold: 50000,
      payoutProgress: 36,
      payoutHistory: [
        {
          id: "TXN-842911",
          userId: "UID-10002",
          username: "jokowow",
          timestamp: "25/5/2026, 14:12:00",
          amount: 35000,
          walletType: "DANA",
          walletNumber: "081298765432",
          txHash: "0x3a8b417fcd9e02c59de104a8b7ddf2bb89a19c636f014e3da8f7c9e0cba002ae",
          status: "Completed"
        }
      ],
      depositHistory: [
        {
          id: "QRS-41829",
          userId: "UID-10002",
          username: "jokowow",
          timestamp: "25/5/2026, 11:05:00",
          amount: 25000,
          paymentMethod: "QRIS",
          status: "Completed",
          referenceNumber: "REF-XZ901248KLPB"
        }
      ],
      privateKey: "",
      publicKey: ""
    }
  }
];

// Helper to load or initialize DB
function readDb(): UserAccount[] {
  try {
    if (fs.existsSync(DB_PATH)) {
      const content = fs.readFileSync(DB_PATH, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Failed to read DB, resetting to defaults", err);
  }
  
  // Write defaults
  writeDb(DEFAULT_USERS);
  return DEFAULT_USERS;
}

// Helper to write database
function writeDb(users: UserAccount[]) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write db.json", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser for APIs
  app.use(express.json());

  // Ensure DB gets initialized
  readDb();

  // API 1: Fetch all users
  app.get("/api/users", (req, res) => {
    const list = readDb();
    res.json(list);
  });

  // API 2: Create / Update a single user (Registers or Updates configs/deposits)
  app.post("/api/users/update", (req, res) => {
    const incoming: UserAccount = req.body;
    if (!incoming || !incoming.id) {
      return res.status(400).json({ error: "Invalid user cargo" });
    }

    const list = readDb();
    const existingIndex = list.findIndex(u => u.id === incoming.id);

    if (existingIndex > -1) {
      list[existingIndex] = incoming;
    } else {
      list.push(incoming);
    }

    writeDb(list);
    res.json({ success: true, user: incoming });
  });

  // API 3: Batch Update users (for bulk modifications, or fast synchronizers)
  app.post("/api/users/save-all", (req, res) => {
    const list = req.body;
    if (Array.isArray(list)) {
      writeDb(list);
      return res.json({ success: true, count: list.length });
    }
    res.status(400).json({ error: "Payload must be a UserAccount array" });
  });

  // Vite Middleware configuration
  if (process.env.NODE_ENV !== "production") {
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
