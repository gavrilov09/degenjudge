import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function WalletResultsSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="court-card">
        <CardHeader>
          <Tabs defaultValue="paperhand" className="w-full">
            <TabsList className="w-full bg-secondary/50">
              <TabsTrigger value="paperhand" className="flex-1">
                Paperhand
              </TabsTrigger>
              <TabsTrigger value="roundtrip" className="flex-1">
                Roundtrip
              </TabsTrigger>
              <TabsTrigger value="gained" className="flex-1">
                Gained
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-secondary/80">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

