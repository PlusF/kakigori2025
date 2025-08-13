"use client";

import {
  Text,
  Title,
  Stack,
  Paper,
  Group,
  Badge,
  useMantineTheme,
  Card,
  Divider,
  Table,
} from "@mantine/core";
import { SocketContext } from "../_contexts/SocketContext";
import { useContext } from "react";
import { IconShoppingCart, IconReceipt } from "@tabler/icons-react";

export default function OrderHistory() {
  const { orders } = useContext(SocketContext);
  const theme = useMantineTheme();

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Stack gap="xl">
      <Title order={1} size="h1" c={theme.primaryColor}>
        注文履歴
      </Title>

      {orders.length === 0 ? (
        <Paper p="xl" withBorder>
          <Stack align="center" gap="md">
            <IconShoppingCart size={48} color={theme.colors.gray[5]} />
            <Text c="dimmed" size="lg">
              まだ注文履歴がありません
            </Text>
          </Stack>
        </Paper>
      ) : (
        <Stack gap="md">
          {orders.map((order, index) => (
            <Card
              key={order.id}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
            >
              <Stack gap="sm">
                <Group justify="space-between">
                  <Group gap="xs">
                    <IconReceipt
                      size={20}
                      color={theme.colors[theme.primaryColor][6]}
                    />
                    <Text fw={600} size="lg">
                      注文 #{orders.length - index}
                    </Text>
                  </Group>
                  <Badge variant="light" color="blue">
                    {formatDate(order.createdAt)}
                  </Badge>
                </Group>

                <Divider />

                {order.OrderItem && order.OrderItem.length > 0 && (
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>商品名</Table.Th>
                        <Table.Th>単価</Table.Th>
                        <Table.Th>数量</Table.Th>
                        <Table.Th>小計</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {order.OrderItem.map((item) => (
                        <Table.Tr key={item.id}>
                          <Table.Td>{item.MenuItem.name}</Table.Td>
                          <Table.Td>{item.MenuItem.price}円</Table.Td>
                          <Table.Td>{item.quantity}</Table.Td>
                          <Table.Td fw={500}>
                            {(
                              item.MenuItem.price * item.quantity
                            ).toLocaleString()}
                            円
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                )}

                <Divider />

                <Group justify="space-between">
                  <Text size="lg" fw={600}>
                    合計金額
                  </Text>
                  <Text size="xl" fw={700} c={theme.primaryColor}>
                    {order.total.toLocaleString()}円
                  </Text>
                </Group>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
