"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, "Name must be at least 2 characters").max(100),
        email: zod_1.z.string().email("Invalid email address").transform(e => e.toLowerCase()),
        password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
        organizationName: zod_1.z.string().min(2, "Organization name is required").max(100),
    })
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email address").transform(e => e.toLowerCase()),
        password: zod_1.z.string().min(1, "Password is required"),
    })
});
