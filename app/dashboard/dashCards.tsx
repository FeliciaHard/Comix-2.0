import { useEffect, useState } from "react"
// import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
// import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type DashCardsProps = {
  total_com: string
  total_users?: string
}

export function DashCards({ total_com, total_users = "0" }: DashCardsProps) {
  const totalComNum = Number(total_com) || 0
  const totalUsersNum = Number(total_users) || 0
  const [count, setCount] = useState(0)
  const [userCount, setUserCount] = useState(0)

  useEffect(() => {
    let start = 0
    const duration = 1000
    const intervalTime = 16
    const steps = Math.ceil(duration / intervalTime)
    const increment = totalComNum / steps

    const interval = setInterval(() => {
      start += increment
      if (start >= totalComNum) {
        setCount(totalComNum)
        clearInterval(interval)
      } else {
        setCount(Math.floor(start))
      }
    }, intervalTime)

    return () => clearInterval(interval)
  }, [totalComNum])

  useEffect(() => {
    let start = 0
    const duration = 1000
    const intervalTime = 16
    const steps = Math.ceil(duration / intervalTime)
    const increment = totalUsersNum / steps

    const interval = setInterval(() => {
      start += increment
      if (start >= totalUsersNum) {
        setUserCount(totalUsersNum)
        clearInterval(interval)
      } else {
        setUserCount(Math.floor(start))
      }
    }, intervalTime)

    return () => clearInterval(interval)
  }, [totalUsersNum])

  return (
    <div className="grid grid-cols-2 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 *:data-[slot=card]:bg-linear-to-r/srgb *:data-[slot=card]:from-pink-950 *:data-[slot=card]:to-fuchsia-950 *:data-[slot=card]:shadow-xs *:data-[slot=card]:bg-card">
      <Card className="@container/card aspect-square sm:aspect-auto">
        <CardHeader>
          <CardDescription className="text-white">Total Comics</CardDescription>
          <CardTitle className="text-2xl text-white font-semibold tabular-nums @[250px]/card:text-3xl">
            {count.toLocaleString()}
          </CardTitle>
          <CardAction>
            {/* <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge> */}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm"></CardFooter>
      </Card>

      <Card className="@container/card aspect-square sm:aspect-auto">
        <CardHeader>
          <CardDescription className="text-white">Total Users</CardDescription>
          <CardTitle className="text-2xl text-white font-semibold tabular-nums @[250px]/card:text-3xl">
            {userCount.toLocaleString()}
          </CardTitle>
          <CardAction>
            {/* <Badge variant="outline">
              <IconTrendingDown />
              -20%
            </Badge> */}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm"></CardFooter>
      </Card>

      <Card className="@container/card aspect-square sm:aspect-auto">
        <CardHeader>
          <CardDescription className="text-white">Active Accounts</CardDescription>
          <CardTitle className="text-2xl text-white font-semibold tabular-nums @[250px]/card:text-3xl">
            0
          </CardTitle>
          <CardAction>
            {/* <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge> */}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {/* <div className="line-clamp-1 flex gap-2 font-medium">
            Strong user retention <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground dark:text-white">
            Engagement exceed targets
          </div> */}
        </CardFooter>
      </Card>

      <Card className="@container/card aspect-square sm:aspect-auto">
        <CardHeader>
          <CardDescription className="text-white">Growth Rate</CardDescription>
          <CardTitle className="text-2xl text-white font-semibold tabular-nums @[250px]/card:text-3xl">
            0
          </CardTitle>
          <CardAction>
            {/* <Badge variant="outline">
              <IconTrendingUp />
              +4.5%
            </Badge> */}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {/* <div className="line-clamp-1 flex gap-2 font-medium">
            Steady performance increase <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground dark:text-white">
            Meets growth projections
          </div> */}
        </CardFooter>
      </Card>
    </div>
  )
}
