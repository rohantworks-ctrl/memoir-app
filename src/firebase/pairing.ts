import { db } from "./index";
import { doc, setDoc, getDoc, runTransaction } from "firebase/firestore";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function generateCode(length = 6) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return result;
}

export async function generateUniqueCode() {
  while (true) {
    const code = generateCode();
    const ref = doc(db, "pairing_codes", code);
    const snap = await getDoc(ref);

    if (!snap.exists()) return code;
  }
}

export const generatePairingCode = async (userId: string) => {
  const code = await generateUniqueCode();
  const coupleId = crypto.randomUUID();

  await setDoc(doc(db, "pairing_codes", code), {
    code,
    createdBy: userId,
    coupleId,
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 mins
  });

  return code;
};

export const joinWithCode = async (userId: string, code: string) => {
  const codeRef = doc(db, "pairing_codes", code);

  await runTransaction(db, async (transaction) => {
    const codeSnap = await transaction.get(codeRef);

    if (!codeSnap.exists()) {
      throw new Error("Invalid code");
    }

    const data = codeSnap.data();

    if (Date.now() > data.expiresAt) {
      throw new Error("Code expired");
    }
    
    if (data.createdBy === userId) {
      throw new Error("Cannot pair with yourself");
    }

    const coupleRef = doc(db, "couples", data.coupleId);

    // Create couple
    transaction.set(coupleRef, {
      users: [data.createdBy, userId],
      createdAt: new Date()
    });

    // Update both users
    transaction.set(doc(db, "users", data.createdBy), {
      coupleId: data.coupleId,
      pairedWith: userId
    }, { merge: true });

    transaction.set(doc(db, "users", userId), {
      coupleId: data.coupleId,
      pairedWith: data.createdBy
    }, { merge: true });

    // Delete code (one-time use)
    transaction.delete(codeRef);
  });
};
