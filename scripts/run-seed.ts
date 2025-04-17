// This file is used to run the seed script with the correct environment variables
import { exec } from "child_process"
import * as dotenv from "dotenv"
import * as path from "path"

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

// Check if required environment variables are set
const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]

const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName])

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(", ")}`)
  console.error("Please add them to your .env.local file")
  process.exit(1)
}

// Run the seed script
console.log("Running database seed script...")
exec("npx tsx scripts/seed-database.tsx", (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`)
    return
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`)
    return
  }
  console.log(stdout)
})
