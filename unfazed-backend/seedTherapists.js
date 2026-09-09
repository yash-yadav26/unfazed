require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./src/modules/auth/models/user.model");
const Therapist = require("./src/modules/therapist/models/therapist.model");

// Apne project ke actual env variable ke according ye automatically pick karega.
const MONGO_URI =
  process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URL;

const DEFAULT_PASSWORD = "Demo@12345";

const therapists = [
  {
    name: "Dr. Aisha Sharma",
    email: "aisha.sharma@unfazed.demo",
    bio: "I’m a compassionate and client-focused therapist dedicated to creating a safe, supportive, and judgment-free space. I help clients navigate anxiety, stress, emotional challenges, and relationship concerns through a warm and practical approach.",
    specializations: ["Anxiety & Stress", "Relationships"],
    languages: ["English", "Hindi", "Hinglish"],
  },

  {
    name: "Dr. Rohan Mehta",
    email: "rohan.mehta@unfazed.demo",
    bio: "I work with individuals who feel overwhelmed, emotionally exhausted, or stuck in difficult patterns. My approach focuses on self-awareness, healthy coping strategies, and creating meaningful changes at a pace that feels comfortable for you.",
    specializations: ["Anxiety & Stress", "Depression"],
    languages: ["English", "Hindi"],
  },

  {
    name: "Dr. Neha Kapoor",
    email: "neha.kapoor@unfazed.demo",
    bio: "My goal is to provide a calm and understanding space where you can openly talk about what you are experiencing. I support clients with emotional wellbeing, relationships, and personal growth using a personalized and empathetic approach.",
    specializations: ["Relationships", "Family & Parenting"],
    languages: ["English", "Hinglish"],
  },

  {
    name: "Dr. Arjun Verma",
    email: "arjun.verma@unfazed.demo",
    bio: "I help clients better understand their thoughts, emotions, and everyday challenges. Together, we work toward building practical coping skills, emotional resilience, and greater confidence in handling life’s ups and downs.",
    specializations: ["Depression", "Anxiety & Stress"],
    languages: ["English", "Hindi", "Hinglish"],
  },

  {
    name: "Dr. Priya Malhotra",
    email: "priya.malhotra@unfazed.demo",
    bio: "I believe therapy should feel like a safe conversation where you can be honest without fear of judgment. I work with clients facing relationship concerns, family challenges, and periods of emotional uncertainty.",
    specializations: ["Relationships", "Family & Parenting"],
    languages: ["English", "Hindi"],
  },

  {
    name: "Dr. Kabir Singh",
    email: "kabir.singh@unfazed.demo",
    bio: "I support clients through stressful transitions, emotional difficulties, and personal challenges. My focus is on helping you develop clarity, healthier coping patterns, and practical tools that can make everyday life feel more manageable.",
    specializations: ["Career & Life Coaching", "Anxiety & Stress"],
    languages: ["English", "Hinglish"],
  },

  {
    name: "Dr. Simran Kaur",
    email: "simran.kaur@unfazed.demo",
    bio: "I create a warm and collaborative environment where clients can explore their emotions, understand themselves better, and move toward healthier patterns. Every session is tailored to your individual experiences and goals.",
    specializations: ["Trauma & PTSD", "Anxiety & Stress"],
    languages: ["English", "Hindi"],
  },

  {
    name: "Dr. Aditya Rao",
    email: "aditya.rao@unfazed.demo",
    bio: "My approach is practical, empathetic, and centered around your individual needs. I help clients work through stress, self-doubt, emotional concerns, and life transitions while building stronger self-awareness and resilience.",
    specializations: ["Career & Life Coaching", "Depression"],
    languages: ["English", "Hinglish"],
  },

  {
    name: "Dr. Meera Joshi",
    email: "meera.joshi@unfazed.demo",
    bio: "I offer a supportive space for clients dealing with emotional pain, family concerns, and difficult life experiences. My aim is to help you feel heard, develop healthier coping strategies, and move forward with greater confidence.",
    specializations: ["Trauma & PTSD", "Family & Parenting"],
    languages: ["English", "Hindi", "Hinglish"],
  },

  {
    name: "Dr. Vikram Sethi",
    email: "vikram.sethi@unfazed.demo",
    bio: "I believe meaningful progress begins with feeling understood. I work collaboratively with clients to explore emotional challenges, strengthen coping skills, and build practical strategies for a healthier and more balanced life.",
    specializations: ["Depression", "Career & Life Coaching"],
    languages: ["English", "Hindi"],
  },
];

const slugify = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const seedTherapists = async () => {
  if (!MONGO_URI) {
    throw new Error(
      "MongoDB connection string not found. Set MONGODB_URI, MONGO_URI, or MONGO_URL.",
    );
  }

  await mongoose.connect(MONGO_URI);

  console.log("✅ MongoDB connected");

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  for (const data of therapists) {
    const slug = slugify(data.name);

    // ---------------------------------------------------------
    // 1. CREATE / UPDATE USER
    // ---------------------------------------------------------

    const user = await User.findOneAndUpdate(
      { email: data.email },
      {
        $set: {
          name: data.name,
          password: hashedPassword,
          role: "THERAPIST",
          profileCompleted: true,
          isActive: true,
        },
        $setOnInsert: {
          email: data.email,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    // ---------------------------------------------------------
    // 2. CREATE / UPDATE THERAPIST PROFILE
    // ---------------------------------------------------------

    await Therapist.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          userId: user._id,
          name: data.name,
          slug,
          bio: data.bio,
          specializations: data.specializations,
          languages: data.languages,
          profileCompleted: true,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    console.log(`✅ Seeded: ${data.name}`);
  }

  console.log("\n=================================");
  console.log(`✅ ${therapists.length} therapists seeded`);
  console.log(`🔐 Demo password: ${DEFAULT_PASSWORD}`);
  console.log("=================================\n");
};

seedTherapists()
  .catch((error) => {
    console.error("❌ Therapist seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  });
