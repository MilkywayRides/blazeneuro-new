export default function AdminSettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="space-y-4">
        <a href="/admin/settings/oauth" className="block p-4 border rounded hover:bg-gray-50">
          OAuth Settings
        </a>
      </div>
    </div>
  )
}
