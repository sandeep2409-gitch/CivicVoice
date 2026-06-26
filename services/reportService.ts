import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export const saveReport = async (report: any) => {
  await addDoc(collection(db, "reports"), {
    ...report,
    reporterName: report.reporterName || "Anonymous",
    reporterUid: report.reporterUid || null,
    status: report.status || "Pending",
    confirmations: report.confirmations || 0,
    createdAt: serverTimestamp(),
  });
};