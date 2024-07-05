/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.js",
    dialect: 'postgresql',
    dbCredentials: {
      url: 'postgresql://ai-interview-mocker_owner:YGCU2tvu4Qln@ep-soft-wave-a5t4bgvo.us-east-2.aws.neon.tech/ai-interview-mocker?sslmode=require',
    }
  };
  