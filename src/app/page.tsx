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
      description: "累計売上高"
    },
    {
      title: "注文数",
      value: `${summary.totalOrders}件`,
      icon: IconShoppingCart,
      color: "blue",
      description: "累計注文件数"
    },
    {
      title: "平均単価",
      value: summary.totalOrders > 0 
        ? `${Math.round(summary.totalSales / summary.totalOrders).toLocaleString()}円`
        : "0円",
      icon: IconPackage,
      color: "grape",
      description: "注文あたりの平均金額"
    },
    {
      title: "販売個数",
      value: `${summary.totalQuantity || 0}個`,
      icon: IconUsers,
      color: "orange",
      description: "累計販売個数"
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
                <Badge color={summary.totalSales >= 500000 ? "green" : "blue"} variant="light">
                  {Math.min(Math.round((summary.totalSales / 500000) * 100), 100)}%
                </Badge>
              </Group>
              <Progress 
                value={Math.min(Math.round((summary.totalSales / 500000) * 100), 100)} 
                size="xl" 
                radius="xl" 
                color={theme.primaryColor}
              />
              <Text size="sm" c="dimmed">
                目標: 500,000円 / 現在: {summary.totalSales.toLocaleString()}円
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
                {summary.popularItems && summary.popularItems.length > 0 ? (
                  summary.popularItems.map((item, index) => (
                    <Group key={index} justify="space-between">
                      <Group gap="xs">
                        <Badge 
                          color={index === 0 ? "gold" : index === 1 ? "gray" : "orange"} 
                          variant="filled" 
                          size="sm"
                        >
                          {index + 1}
                        </Badge>
                        <Text size="sm">{item.name}</Text>
                      </Group>
                      <Text size="sm" fw={600}>{item.quantity}杯</Text>
                    </Group>
                  ))
                ) : (
                  <Text size="sm" c="dimmed">まだ注文がありません</Text>
                )}
              </Stack>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

    </Stack>
  );
}
