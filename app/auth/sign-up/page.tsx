import { redirect } from "next/navigation"

export default function SignUpPage() {
  // Redirect to home page since we no longer use authentication
  redirect("/")
}
