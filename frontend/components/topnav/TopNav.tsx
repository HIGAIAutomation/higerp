"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function TopNav(){
  const pathname = usePathname()

  // hide links on registration page
  const hide = pathname === '/register' || pathname === '/register/'

  if(hide) return null

  return (
    <header style={{ padding: 12, borderBottom: '1px solid #eee' }}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4">
        <Link href="/">Home</Link>
        <Link href="/hrms">HRMS</Link>
        <Link href="/access-control">Access Control</Link>
      </nav>
    </header>
  )
}
