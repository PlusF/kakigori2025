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
  Badge,
} from "@mantine/core";
import {
  IconCurrencyYen,
  IconShoppingCart,
  IconUsers,
} from "@tabler/icons-react";
import { getOrders } from "@/app/_actions/getOrders";
import { useEffect, useState, useContext } from "react";
import { LoadingContext } from "@/app/_contexts/LoadingContext";
import { SalesChart } from "@/app/_components/SalesChart";

export default function Home() {
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [popularItems, setPopularItems] = useState<
    { name: string; quantity: number }[]
  >([]);
  const theme = useMantineTheme();
  const { startLoading, stopLoading } = useContext(LoadingContext);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (isInitialLoad) {
        startLoading();
      }
      try {
        const orders = await getOrders();

        const itemSales: Record<string, { name: string; quantity: number }> =
          {};
        let totalSalesCalc = 0;
        let totalQuantityCalc = 0;

        orders.forEach((order) => {
          order.OrderItem.forEach((item) => {
            const menuItemId = item.menuItemId;
            if (!itemSales[menuItemId]) {
              itemSales[menuItemId] = {
                name: item.MenuItem.name,
                quantity: 0,
              };
            }
            itemSales[menuItemId].quantity += item.quantity;
            totalQuantityCalc += item.quantity;
            totalSalesCalc += item.MenuItem.price * item.quantity;
          });
        });

        const popularItemsCalc = Object.values(itemSales)
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 3);

        setTotalSales(totalSalesCalc);
        setTotalOrders(orders.length);
        setTotalQuantity(totalQuantityCalc);
        setPopularItems(popularItemsCalc);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        if (isInitialLoad) {
          stopLoading();
          setIsInitialLoad(false);
        }
      }
    };

    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, [startLoading, stopLoading, isInitialLoad]);

  const stats = [
    {
      title: "総売り上げ",
      value: `${totalSales.toLocaleString()}円`,
      icon: IconCurrencyYen,
      color: "teal",
      description: "累計売上高",
    },
    {
      title: "注文数",
      value: `${totalOrders}件`,
      icon: IconShoppingCart,
      color: "blue",
      description: "累計注文件数",
    },
    {
      title: "販売個数",
      value: `${totalQuantity || 0}個`,
      icon: IconUsers,
      color: "orange",
      description: "累計販売個数",
    },
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
                <Text size="xs" c="dimmed" tt="uppercase">
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

              <Text size="xl">{stat.value}</Text>

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
                <Badge
                  color={totalSales >= 500000 ? "green" : "blue"}
                  variant="light"
                >
                  {Math.min(Math.round((totalSales / 500000) * 100), 100)}%
                </Badge>
              </Group>
              <Progress
                value={Math.min(Math.round((totalSales / 500000) * 100), 100)}
                size="xl"
                radius="xl"
                color={theme.primaryColor}
              />
              <Text size="sm" c="dimmed">
                目標: 500,000円 / 現在: {totalSales.toLocaleString()}円
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
                {popularItems && popularItems.length > 0 ? (
                  popularItems.map((item, index) => (
                    <Group key={index} justify="space-between">
                      <Group gap="xs">
                        <Badge
                          color={
                            index === 0
                              ? "gold"
                              : index === 1
                              ? "gray"
                              : "orange"
                          }
                          variant="filled"
                          size="sm"
                        >
                          {index + 1}
                        </Badge>
                        <Text size="sm">{item.name}</Text>
                      </Group>
                      <Text size="sm">{item.quantity}杯</Text>
                    </Group>
                  ))
                ) : (
                  <Text size="sm" c="dimmed">
                    まだ注文がありません
                  </Text>
                )}
              </Stack>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      <SalesChart />
    </Stack>
  );
}
