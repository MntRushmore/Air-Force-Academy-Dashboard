export default function TestSidebarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Test Sidebar</h1>
        <p className="text-muted-foreground">This page is for testing the sidebar functionality</p>
      </div>

      <div className="p-6 border rounded-lg">
        <p>The sidebar should be fully functional. You should be able to:</p>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li>Open and close the sidebar on desktop</li>
          <li>See the sidebar collapse to icons only when closed on desktop</li>
          <li>Open and close the sidebar on mobile</li>
          <li>See all navigation links</li>
          <li>Navigate to different pages</li>
        </ul>
      </div>
    </div>
  )
}
