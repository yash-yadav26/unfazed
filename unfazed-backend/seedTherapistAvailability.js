require("dotenv").config();

const mongoose = require("mongoose");

const User = require("./src/modules/auth/models/user.model");
const Therapist = require("./src/modules/therapist/models/therapist.model");
const Availability = require("./src/modules/scheduling/models/availability.model");

/* -------------------------------------------------------------------------- */
/*                              MongoDB Config                                */
/* -------------------------------------------------------------------------- */

const MONGO_URI =
  process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URL;

/* -------------------------------------------------------------------------- */
/*                         Demo Weekly Schedules                              */
/* -------------------------------------------------------------------------- */

const weeklySchedules = [
  {
    email: "aisha.sharma@unfazed.demo",
    price: 999,
    days: {
      MONDAY: ["10:00", "18:00"],
      TUESDAY: ["10:00", "18:00"],
      WEDNESDAY: ["10:00", "18:00"],
      THURSDAY: ["10:00", "18:00"],
      FRIDAY: ["10:00", "16:00"],
    },
  },

  {
    email: "rohan.mehta@unfazed.demo",
    price: 899,
    days: {
      MONDAY: ["09:00", "17:00"],
      TUESDAY: ["09:00", "17:00"],
      THURSDAY: ["09:00", "17:00"],
      FRIDAY: ["09:00", "17:00"],
      SATURDAY: ["10:00", "14:00"],
    },
  },

  {
    email: "neha.kapoor@unfazed.demo",
    price: 1099,
    days: {
      MONDAY: ["11:00", "19:00"],
      TUESDAY: ["11:00", "19:00"],
      WEDNESDAY: ["11:00", "19:00"],
      THURSDAY: ["11:00", "19:00"],
      FRIDAY: ["11:00", "17:00"],
    },
  },

  {
    email: "arjun.verma@unfazed.demo",
    price: 949,
    days: {
      MONDAY: ["10:00", "18:00"],
      WEDNESDAY: ["10:00", "18:00"],
      THURSDAY: ["10:00", "18:00"],
      FRIDAY: ["10:00", "18:00"],
      SATURDAY: ["10:00", "14:00"],
    },
  },

  {
    email: "priya.malhotra@unfazed.demo",
    price: 1199,
    days: {
      TUESDAY: ["10:00", "18:00"],
      WEDNESDAY: ["10:00", "18:00"],
      THURSDAY: ["10:00", "18:00"],
      FRIDAY: ["10:00", "18:00"],
      SATURDAY: ["11:00", "15:00"],
    },
  },

  {
    email: "kabir.singh@unfazed.demo",
    price: 799,
    days: {
      MONDAY: ["08:00", "16:00"],
      TUESDAY: ["08:00", "16:00"],
      WEDNESDAY: ["08:00", "16:00"],
      THURSDAY: ["08:00", "16:00"],
      FRIDAY: ["08:00", "14:00"],
    },
  },

  {
    email: "simran.kaur@unfazed.demo",
    price: 1299,
    days: {
      MONDAY: ["12:00", "20:00"],
      TUESDAY: ["12:00", "20:00"],
      THURSDAY: ["12:00", "20:00"],
      FRIDAY: ["12:00", "20:00"],
      SATURDAY: ["11:00", "15:00"],
    },
  },

  {
    email: "aditya.rao@unfazed.demo",
    price: 899,
    days: {
      MONDAY: ["09:00", "17:00"],
      TUESDAY: ["09:00", "17:00"],
      WEDNESDAY: ["09:00", "17:00"],
      THURSDAY: ["09:00", "17:00"],
      FRIDAY: ["09:00", "15:00"],
    },
  },

  {
    email: "meera.joshi@unfazed.demo",
    price: 1149,
    days: {
      TUESDAY: ["11:00", "19:00"],
      WEDNESDAY: ["11:00", "19:00"],
      THURSDAY: ["11:00", "19:00"],
      FRIDAY: ["11:00", "19:00"],
      SATURDAY: ["10:00", "14:00"],
    },
  },

  {
    email: "vikram.sethi@unfazed.demo",
    price: 999,
    days: {
      MONDAY: ["10:00", "18:00"],
      TUESDAY: ["10:00", "18:00"],
      WEDNESDAY: ["10:00", "18:00"],
      THURSDAY: ["10:00", "18:00"],
      FRIDAY: ["10:00", "16:00"],
    },
  },
];

/* -------------------------------------------------------------------------- */
/*                         Find Therapist by Email                             */
/* -------------------------------------------------------------------------- */

const getTherapistByEmail = async (email) => {
  const user = await User.findOne({
    email,
    role: "THERAPIST",
    isActive: true,
  }).select("_id email");

  if (!user) {
    return null;
  }

  return await Therapist.findOne({
    userId: user._id,
  }).select("_id userId name");
};

/* -------------------------------------------------------------------------- */
/*                         Seed Availability                                  */
/* -------------------------------------------------------------------------- */

const seedTherapistAvailability = async () => {
  if (!MONGO_URI) {
    throw new Error(
      "MongoDB connection string not found. Set MONGODB_URI, MONGO_URI, or MONGO_URL.",
    );
  }

  await mongoose.connect(MONGO_URI);

  console.log("✅ MongoDB connected");

  let processedTherapists = 0;
  let createdEntries = 0;
  let updatedEntries = 0;

  for (const schedule of weeklySchedules) {
    const therapist = await getTherapistByEmail(schedule.email);

    if (!therapist) {
      console.log(`⚠️ Therapist not found: ${schedule.email}`);
      continue;
    }

    processedTherapists += 1;

    for (const [dayOfWeek, times] of Object.entries(schedule.days)) {
      const [startTime, endTime] = times;

      const existing = await Availability.findOne({
        therapistId: therapist._id,
        type: "WEEKLY",
        dayOfWeek,
      }).select("_id");

      await Availability.findOneAndUpdate(
        {
          therapistId: therapist._id,
          type: "WEEKLY",
          dayOfWeek,
        },
        {
          $set: {
            therapistId: therapist._id,
            type: "WEEKLY",
            dayOfWeek,
            isAvailable: true,
            startTime,
            endTime,
            sessionDuration: 60,
            bufferTime: 15,
            price: schedule.price,
          },
        },
        {
          upsert: true,
          returnDocument: "after",
          runValidators: true,
          setDefaultsOnInsert: true,
        },
      );

      if (existing) {
        updatedEntries += 1;
      } else {
        createdEntries += 1;
      }
    }

    console.log(
      `✅ ${therapist.name} → ${Object.keys(schedule.days).length} weekly entries`,
    );
  }

  console.log("\n========================================");
  console.log("✅ Therapist availability seed complete");
  console.log(`✅ Therapists processed: ${processedTherapists}/10`);
  console.log(`✅ Availability created: ${createdEntries}`);
  console.log(`✅ Availability updated: ${updatedEntries}`);
  console.log("✅ Session duration: 60 minutes");
  console.log("✅ Buffer time: 15 minutes");
  console.log("========================================\n");
};

/* -------------------------------------------------------------------------- */
/*                                Run Seed                                    */
/* -------------------------------------------------------------------------- */

seedTherapistAvailability()
  .catch((error) => {
    console.error("❌ Therapist availability seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  });
