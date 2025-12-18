// src/utils/firestore.js
import { db } from '../firebase';
import { 
  collection, doc, getDocs, writeBatch, updateDoc, 
  query, where, serverTimestamp, getDoc, deleteDoc
} from "firebase/firestore";

// --- 1. Upload Roster (Updated for Zones) ---
export const uploadRosterToFirestore = async (students) => {
  const batchArray = [];
  let batch = writeBatch(db);
  let count = 0;

  students.forEach((student) => {
    // Generate a new ID or use carpool number as part of ID if unique
    const newDocRef = doc(collection(db, "students")); 

    const normalizedData = {
      fullName: student.fullName,
      carpoolNumber: String(student.carpoolNumber),
      grade: student.grade || "N/A",
      teacher: student.teacher || "Unassigned",
      
      // NEW: Zone Logic (Source of Truth)
      // Expects CSV column "Zone", defaults to "Main"
      pickupZone: student.pickupZone || "Main", 

      defaultTransport: student.transportMethod?.toLowerCase() || "carpool",
      todaysTransport: student.transportMethod?.toLowerCase() || "carpool",
      
      isOverrideActive: false,
      status: "waiting", 
      timestampCalled: null,
      timestampDismissed: null,
      createdAt: serverTimestamp()
    };

    batch.set(newDocRef, normalizedData);
    count++;

    if (count % 499 === 0) {
      batchArray.push(batch.commit());
      batch = writeBatch(db);
    }
  });

  if (count > 0) batchArray.push(batch.commit());
  await Promise.all(batchArray);
  return students.length;
};

// --- 2. Call Student (Updated for Zone Validation) ---
export const callStudentByNumber = async (number, currentZone) => {
  // Query all students with this carpool number (siblings share numbers)
  const q = query(
    collection(db, "students"), 
    where("carpoolNumber", "==", String(number))
  );
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return { success: false, message: "Number not found" };
  }

  const batch = writeBatch(db);
  let calledNames = [];
  let wrongZoneNames = [];

  querySnapshot.forEach((doc) => {
    const student = doc.data();
    
    // VALIDATION: Only call if student belongs to this zone
    if (student.pickupZone === currentZone) {
      calledNames.push(student.fullName);
      batch.update(doc.ref, {
        status: "queued",
        timestampCalled: serverTimestamp()
      });
    } else {
      wrongZoneNames.push(`${student.fullName} (${student.pickupZone})`);
    }
  });

  // Scenario A: Number exists, but student belongs to a different zone
  if (calledNames.length === 0 && wrongZoneNames.length > 0) {
    return { 
      success: false, 
      message: `WRONG ZONE! Student belongs to: ${wrongZoneNames.join(", ")}` 
    };
  }

  // Scenario B: Number matched nobody (should be caught by querySnapshot.empty, but safety check)
  if (calledNames.length === 0) {
     return { success: false, message: "No eligible students found." };
  }

  await batch.commit();

  return { 
    success: true, 
    names: calledNames.join(", "), 
    count: calledNames.length 
  };
};

// --- 3. Dismiss Student (Unchanged) ---
export const dismissStudent = async (studentId) => {
  const studentRef = doc(db, "students", studentId);
  await updateDoc(studentRef, {
    status: "dismissed",
    timestampDismissed: serverTimestamp()
  });
};

// --- 4. Update Student / Override (Updated to allow Zone changes) ---
export const updateStudentTransport = async (studentId, newTransport, isPermanent = false, newZone = null) => {
  const studentRef = doc(db, "students", studentId);
  
  const updateData = {
    todaysTransport: newTransport,
    isOverrideActive: true 
  };

  // If a new zone was provided (optional)
  if (newZone) {
    updateData.pickupZone = newZone;
  }

  if (isPermanent) {
    updateData.defaultTransport = newTransport;
    updateData.isOverrideActive = false;
    // Note: We typically don't reset zone permanently here unless requested, 
    // but usually transport method is the daily variable, not zone.
  }

  await updateDoc(studentRef, updateData);
};

// --- 5. Subscribe (Unchanged) ---
import { onSnapshot } from "firebase/firestore";

export const subscribeToClassroom = (teacherName, callback) => {
  const q = query(
    collection(db, "students"),
    where("teacher", "==", teacherName)
  );

  return onSnapshot(q, (snapshot) => {
    const students = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(students);
  });
};

// --- 6. Daily Reset (Unchanged) ---
export const resetDailyStatus = async () => {
  const querySnapshot = await getDocs(collection(db, "students"));
  const batchArray = [];
  let batch = writeBatch(db);
  let count = 0;

  querySnapshot.forEach((docSnap) => {
    const student = docSnap.data();
    const resetData = {
      todaysTransport: student.defaultTransport,
      isOverrideActive: false,
      status: "waiting",
      timestampCalled: null,
      timestampDismissed: null
    };
    batch.update(docSnap.ref, resetData);
    count++;
    if (count % 499 === 0) {
      batchArray.push(batch.commit());
      batch = writeBatch(db);
    }
  });

  if (count > 0) batchArray.push(batch.commit());
  await Promise.all(batchArray);
  return count;
};

export const getAllStudents = async () => {
  const snapshot = await getDocs(collection(db, "students"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateStudentProfile = async (studentId, data) => {
  const studentRef = doc(db, "students", studentId);
  await updateDoc(studentRef, data);
};

export const deleteStudent = async (studentId) => {
  await deleteDoc(doc(db, "students", studentId));
};