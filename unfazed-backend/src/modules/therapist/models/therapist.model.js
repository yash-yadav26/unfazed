    const mongoose = require("mongoose");

    const therapistSchema = new mongoose.Schema(
    {
        userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
        unique: true,
        index: true,
        },

        name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: 2,
        maxlength: 100,
        },

        slug: {
        type: String,
        required: [true, "Profile slug is required"],
        unique: true,
        index: true,
        trim: true,
        lowercase: true,
        },

        bio: {
        type: String,
        required: [true, "Bio is required"],
        trim: true,
        maxlength: 500,
        },

        specializations: {
        type: [String],
        required: [true, "At least one specialization is required"],
        validate: {
            validator: (value) => value.length > 0,
            message: "At least one specialization is required",
        },
        },

        languages: {
        type: [String],
        required: [true, "At least one language is required"],
        validate: {
            validator: (value) => value.length > 0,
            message: "At least one language is required",
        },
        },

        profileCompleted: {
        type: Boolean,
        default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
    );

    const Therapist = mongoose.model("Therapist", therapistSchema);

    module.exports = Therapist;
