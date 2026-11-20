import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error("MONGODB_URI must be set to initialize authentication.");
}

const mongoClient = new MongoClient(mongoUri);
const database = mongoClient.db();

const protectedUserFields = [
  "role",
  "isBlocked",
  "subscriptionPlan",
  "subscriptionExpiresAt",
];

export const auth = betterAuth({
  appName: "WedPlan",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(database),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      mapProfileToUser: () => ({ role: "customer" }),
    },
  },
  user: {
    modelName: "users",
    additionalFields: {
      role: {
        type: ["customer", "vendor"],
        required: false,
        defaultValue: "customer",
        input: true,
      },
      isBlocked: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      businessName: {
        type: "string",
        required: false,
        input: true,
      },
      stripeCustomerId: {
        type: "string",
        required: false,
        input: false,
      },
      subscriptionPlan: {
        type: ["free", "premium"],
        required: false,
        defaultValue: "free",
        input: false,
      },
      subscriptionExpiresAt: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (context) => {
      if (context.path !== "/sign-up/email") {
        return;
      }

      const body = context.body ?? {};
      const password = body.password;
      if (
        typeof password !== "string" ||
        password.length < 6 ||
        !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password)
      ) {
        throw new APIError("BAD_REQUEST", {
          message:
            "Password must be at least 6 characters and include an uppercase and a lowercase letter.",
        });
      }

      const role = body.role === "vendor" ? "vendor" : "customer";
      const businessName = body.businessName;
      if (
        role === "vendor" &&
        (typeof businessName !== "string" || !businessName.trim())
      ) {
        throw new APIError("BAD_REQUEST", {
          message: "Business name is required for vendor accounts.",
        });
      }

      const updatedBody = { ...body, role };
      if (role === "vendor") {
        updatedBody.businessName = businessName.trim();
      } else {
        delete updatedBody.businessName;
      }

      return {
        context: {
          ...context,
          body: updatedBody,
        },
      };
    }),
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, context) => {
          if (context?.path === "/sign-up/email") {
            return;
          }

          return {
            data: {
              ...user,
              role: "customer",
            },
          };
        },
      },
      update: {
        before: async (data) => {
          if (protectedUserFields.some((field) => Object.hasOwn(data, field))) {
            throw new APIError("BAD_REQUEST", {
              message: "Protected account fields cannot be changed.",
            });
          }
        },
      },
    },
  },
  plugins: [jwt()],
});
