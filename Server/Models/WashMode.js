import mongoose from "mongoose";

const washModeSchema = new mongoose.Schema(
    {
    name:
    {
        type: String,
        required: true,
    },
    description:
    {
        type: String,
        required: true,
    },
    water:[waterModeSchema],
    duration:
    {
        type: Number,
        required: true,
    },
    isDefault:
    {
        type: Boolean,
        default: false,
    }
    }
);

const waterModeSchema = new mongoose.Schema(
    {
        level:
        {
            type: Number,
            required: true,
        },
        duration:
        {
            type: Number,
            required: true,
        }
    }
);
export default mongoose.model("WashMode", washModeSchema);