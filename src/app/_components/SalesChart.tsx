"use client";

import { useState, useEffect } from "react";
import { Paper, Stack, Title, Text, Group, Select } from "@mantine/core";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getOrders } from "@/app/_actions/getOrders";
import dayjs from "dayjs";

interface ChartData {
  time: string;
  orderCount: number;
}

export function SalesChart() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2024, 8, 13));
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);
  
  const dateOptions = [
    { value: '2024-09-13', label: '9月13日' },
    { value: '2024-09-14', label: '9月14日' }
  ];

  useEffect(() => {
    if (!selectedDate) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const orders = await getOrders();

        const startOfDay = dayjs(selectedDate).startOf("day");
        const endOfDay = dayjs(selectedDate).endOf("day");

        const filteredOrders = orders.filter((order) => {
          const orderDate = dayjs(order.createdAt);
          return orderDate.isAfter(startOfDay) && orderDate.isBefore(endOfDay);
        });

        const intervals: Record<string, number> = {};

        for (let hour = 0; hour < 24; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const timeKey = `${hour.toString().padStart(2, "0")}:${minute
              .toString()
              .padStart(2, "0")}`;
            intervals[timeKey] = 0;
          }
        }

        filteredOrders.forEach((order) => {
          const orderDate = dayjs(order.createdAt);
          const hour = orderDate.hour();
          const minute = Math.floor(orderDate.minute() / 30) * 30;
          const timeKey = `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`;

          if (intervals[timeKey] !== undefined) {
            intervals[timeKey] += 1;
          }
        });

        const data: ChartData[] = Object.entries(intervals)
          .map(([time, orderCount]) => ({
            time,
            orderCount,
          }))
          .filter((interval) => {
            const [hour] = interval.time.split(":").map(Number);
            return hour >= 8 && hour < 23;
          });

        setChartData(data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  const formatTooltip = (value: number) => {
    return [`${value}件`, "注文数"];
  };

  return (
    <Paper shadow="sm" p="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={3} size="h4">
            売上推移グラフ
          </Title>
          <Select
            value={selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : null}
            onChange={(value) => setSelectedDate(value ? new Date(value) : null)}
            data={dateOptions}
            placeholder="日付を選択"
          />
        </Group>

        {loading ? (
          <Text c="dimmed" ta="center" py="xl">
            データを読み込み中...
          </Text>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={1}
              />
              <YAxis
                label={{
                  value: "注文数",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                formatter={formatTooltip}
                labelFormatter={(label) => `時間: ${label}`}
              />
              <Bar
                dataKey="orderCount"
                fill="#339af0"
                name="注文数"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Text c="dimmed" ta="center" py="xl">
            選択された日付のデータがありません
          </Text>
        )}

        <Text size="xs" c="dimmed" ta="center">
          30分ごとの注文数を表示 (営業時間: 8:00 - 23:00)
        </Text>
      </Stack>
    </Paper>
  );
}
