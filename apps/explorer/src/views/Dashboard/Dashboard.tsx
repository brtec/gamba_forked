import RecentPlays from "@/RecentPlays"
import { DailyVolume, TopPlayersResponse, apiFetcher, fetchStatus, fetchTopPlayers, getApiUrl, useApi } from "@/api"
import { BarChart } from "@/charts/BarChart"
import { LineChart, LineChartDataPoint } from "@/charts/LineChart"
import { PlayerAccountItem } from "@/components/AccountItem"
import { Card, Flex, Grid, Text } from "@radix-ui/themes"
import { PublicKey } from "@solana/web3.js"
import React from "react"
import styled from "styled-components"
import useSWR from "swr"
import { PoolList } from "./PoolList"
import { TopPlatforms, UnstyledNavLink } from "./TopPlatforms"

export function TotalVolume(props: {creator?: string}) {
  const { data: daily = [] } = useSWR<DailyVolume[]>(
    getApiUrl("/daily-usd", {creator: props.creator}),
    apiFetcher,
  )
  const [hovered, setHovered] = React.useState<DailyVolume | null>(null)
  const total = React.useMemo(
    () => daily.reduce((p, x) => p + x.total_volume, 0),
    [daily]
  )

  return (
    <Card size="2">
      <Flex direction="column" gap="2">
        <Text color="gray">
          {hovered?.date ? new Date(hovered.date).toLocaleString(undefined, {  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '7d Volume'}
        </Text>
        <Text size="7" weight="bold">
          ${(hovered?.total_volume ?? total).toLocaleString(undefined, {maximumFractionDigits: 1})}
        </Text>
      </Flex>
      <div style={{height: '200px'}}>
        <BarChart
          dailyVolume={daily}
          onHover={setHovered}
        />
      </div>
    </Card>
  )
}

export function TotalVolume2() {
  const { data: daily = [] } = useSWR<DailyVolume[]>(
    getApiUrl("/chart/plays", {}),
    apiFetcher,
  )
  const [hovered, setHovered] = React.useState<LineChartDataPoint | null>(null)
  const total = React.useMemo(
    () => daily.reduce((p, x) => p + x.total_volume, 0),
    [daily]
  )

  const chart = daily.map(
    ({ date, total_volume }) => ({
      date,
      value: total_volume,
    }),
  )

  return (
    <Card size="2">
      <Flex direction="column" gap="2">
        <Text color="gray">
          {hovered?.date ? new Date(hovered.date).toLocaleString(undefined, {  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '7d Volume'}
        </Text>
        <Text size="7" weight="bold">
          {(hovered?.value ?? total).toLocaleString(undefined)}
        </Text>
      </Flex>
      <div style={{height: '200px'}}>
        <LineChart
          chart={{data: chart}}
          onHover={(x) => setHovered(x)}
        />
      </div>
    </Card>
  )
}

export function TopPlayers({creator, limit = 5}: {creator?: PublicKey | string, limit?: number}) {
  const [sortBy] = React.useState('usd_profit')
  const { data: players = [], isLoading } = useApi<TopPlayersResponse[]>(
    "/top-players",
    {creator: creator?.toString(), limit, sortBy}
  )

  if (isLoading) return <SkeletonCard />

  return (
    <Card>
      {/* <Tabs.Root defaultValue="mint">
        <Tabs.List>
          <Tabs.Trigger value="mint">Mint</Tabs.Trigger>
          <Tabs.Trigger value="create">Create</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="mint">
          <MintPreToken />
        </Tabs.Content>
        <Tabs.Content value="create">
          <Custom />
        </Tabs.Content>
      </Tabs.Root> */}
      <Flex direction="column" gap="2">
        <Text color="gray">Profit leaderboard</Text>
        {players.map((player, i) => (
          <UnstyledNavLink key={i} to={"/player/" + player.user}>
            <Card>
              <Flex gap="4">
                <Text color="gray" style={{opacity: .5}}>
                  {i + 1}
                </Text>
                <Flex gap="2" justify="between" grow="1">
                  <PlayerAccountItem avatarSize="1" address={player.user} />
                  <Text>
                    +${player.usd_profit.toLocaleString(undefined, {maximumFractionDigits: 2})}
                  </Text>
                </Flex>
              </Flex>
            </Card>
          </UnstyledNavLink>
        ))}
      </Flex>
    </Card>
  )
}

const SkeletonCard = styled(Card)`
  overflow: hidden;
  background-color: #DDDBDD;
  border-radius: var(--radius-4);
  height: 59px;
  animation: skeleton-shine 1s linear infinite;

  @keyframes skeleton-shine {
    0%, 100% {
      background-color: #DDDBDD33;
    }
    50% {
      background-color: #DDDBDD22;
    }
  }
`

function AllTimeStats() {
  const {data, isLoading} = useSWR('stats', () => fetchStatus())

  if (isLoading) return <SkeletonCard size="2" />

  return (
    <Card size="2">
      <Grid
        gap="9"
        columns={{initial: '2', sm: '2', md: '4'}}
        align="center"
        justify="center"
      >
        <Flex gap="2" justify="center">
          <Text color="gray">
            Volume
          </Text>
          <Text weight="bold">
            ${(data?.usd_volume ?? 0).toLocaleString(undefined, {maximumFractionDigits: 1})}
          </Text>
        </Flex>
        <Flex gap="2" justify="center">
          <Text color="gray">
            Players
          </Text>
          <Text weight="bold">
            {(data?.players ?? 0).toLocaleString(undefined)}
          </Text>
        </Flex>
        <Flex gap="2" justify="center">
          <Text color="gray">
            Plays
          </Text>
          <Text weight="bold">
            {(data?.plays ?? 0).toLocaleString(undefined)}
          </Text>
        </Flex>
        <Flex gap="2" justify="center">
          <Text color="gray">
            Platforms
          </Text>
          <Text weight="bold">
            {(data?.creators ?? 0).toLocaleString(undefined)}
          </Text>
        </Flex>
      </Grid>
    </Card>
  )
}
export default function Dashboard() {
  return (
    <Flex direction="column" gap="4">
      <AllTimeStats />
      <Grid gap="4" columns={{initial: '1', sm: '2'}}>
        <Flex direction="column" gap="4">
          <TotalVolume />
          {/* <TotalVolume2 /> */}
          <TopPlayers />
        </Flex>
        <TopPlatforms />
      </Grid>
      <Text color="gray">Top Pools</Text>
      <PoolList />
      <Text color="gray">Recent Plays</Text>
      <RecentPlays />
    </Flex>
  )
}