import { redirect } from "next/navigation"

export default function SignInPage() {
  // Redirect to home page since we no longer use authentication
  redirect("/")
}
