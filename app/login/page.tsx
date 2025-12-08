import LoginForm from '../../components/login-form'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-white text-gray-800">
      <LoginForm />
    </main>
  )
}
