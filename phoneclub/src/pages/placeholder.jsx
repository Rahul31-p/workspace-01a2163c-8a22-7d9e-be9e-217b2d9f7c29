import { Link } from 'react-router-dom'
import { ArrowLeft, Layers3 } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function PlaceholderPage({ title, description, icon: Icon = Layers3 }) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />

      <Card className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center sm:p-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-lg font-semibold tracking-tight text-foreground">{title} module</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          This module is reserved for a later implementation phase. Navigation, store context, and the shared design
          system are already connected and ready.
        </p>
        <Button variant="outline" className="mt-6" asChild>
          <Link to="/dashboard">
            <ArrowLeft />
            Back to dashboard
          </Link>
        </Button>
      </Card>
    </div>
  )
}
