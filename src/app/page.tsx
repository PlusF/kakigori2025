"use client";

import { 
  Text, 
  Title, 
  Stack, 
  Grid, 
  Paper, 
  Group, 
  useMantineTheme,
  Progress,
  ThemeIcon,
  Badge
} from "@mantine/core";
import { useContext } from "react";
import { SocketContext } from "./_contexts/SocketContext";
import { 
  IconCurrencyYen, 
  IconShoppingCart, 
  IconPackage, 
  IconUsers 
} from "@tabler/icons-react";

export default function Home() {
  const { summary } = useContext(SocketContext);
  const theme = useMantineTheme();

  const stats = [
    {
      title: "総売り上げ",
      value: `${summary.totalSales.toLocaleString()}円`,
      icon: IconCurrencyYen,
      color: "teal",
      description: "本日の売上高"
    },
    {
      title: "注文数",
      value: `${summary.totalOrders}件`,
      icon: IconShoppingCart,
      color: "blue",
      description: "本日の注文件数"
    },
    {
      title: "在庫",
      value: "1,000,000個",
      icon: IconPackage,
      color: "grape",
      description: "現在の在庫数"
    },
    {
      title: "スタッフ",
      value: "8人",
      icon: IconUsers,
      color: "orange",
      description: "本日のシフト人数"
    }
  ];

  return (
    <Stack gap="xl">
      <Title order={1} size="h1" c={theme.primaryColor}>
        ダッシュボード
      </Title>

      <Grid gutter="md">
        {stats.map((stat, index) => (
          <Grid.Col key={index} span={{ base: 12, sm: 6, md: 3 }}>
            <Paper shadow="sm" p="md" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  {stat.title}
                </Text>
                <ThemeIcon 
                  color={stat.color} 
                  variant="light" 
                  size="lg"
                  radius="md"
                >
                  <stat.icon size={20} />
                </ThemeIcon>
              </Group>

              <Text size="xl" fw={700} mb="xs">
                {stat.value}
              </Text>

              <Text size="xs" c="dimmed">
                {stat.description}
              </Text>
            </Paper>
          </Grid.Col>
        ))}
      </Grid>

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper shadow="sm" p="lg" radius="md" withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={3} size="h4">
                  売上目標達成率
                </Title>
                <Badge color="green" variant="light">
                  85%
                </Badge>
              </Group>
              <Progress 
                value={85} 
                size="xl" 
                radius="xl" 
                color={theme.primaryColor}
              />
              <Text size="sm" c="dimmed">
                目標: 500,000円 / 現在: 425,000円
              </Text>
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper shadow="sm" p="lg" radius="md" withBorder>
            <Stack gap="md">
              <Title order={3} size="h4">
                人気メニュー TOP3
              </Title>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Group gap="xs">
                    <Badge color="gold" variant="filled" size="sm">1</Badge>
                    <Text size="sm">いちご氷</Text>
                  </Group>
                  <Text size="sm" fw={600}>120杯</Text>
                </Group>
                <Group justify="space-between">
                  <Group gap="xs">
                    <Badge color="gray" variant="filled" size="sm">2</Badge>
                    <Text size="sm">宇治金時</Text>
                  </Group>
                  <Text size="sm" fw={600}>98杯</Text>
                </Group>
                <Group justify="space-between">
                  <Group gap="xs">
                    <Badge color="orange" variant="filled" size="sm">3</Badge>
                    <Text size="sm">マンゴー氷</Text>
                  </Group>
                  <Text size="sm" fw={600}>76杯</Text>
                </Group>
              </Stack>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      <Paper shadow="sm" p="lg" radius="md" withBorder>
        <Stack gap="md">
          <Title order={3} size="h4">
            本日のシフト
          </Title>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Group gap="xs">
                <Badge color="green" variant="dot">営業中</Badge>
                <Text size="sm">10:00 - 18:00</Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Group gap="xs">
                <Text size="sm" fw={500}>店長:</Text>
                <Text size="sm">山田太郎</Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Group gap="xs">
                <Text size="sm" fw={500}>スタッフ:</Text>
                <Text size="sm">8名</Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Group gap="xs">
                <Text size="sm" fw={500}>次の休憩:</Text>
                <Text size="sm">14:00</Text>
              </Group>
            </Grid.Col>
          </Grid>
        </Stack>
      </Paper>
    </Stack>
  );
}
