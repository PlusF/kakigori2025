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
  ActionIcon,
  Button,
  Modal,
  NumberInput,
} from "@mantine/core";
import { SocketContext } from "../_contexts/SocketContext";
import { useContext, useState } from "react";
import { IconShoppingCart, IconReceipt, IconEdit, IconTrash } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { Prisma } from "@prisma/client";

type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    OrderItem: {
      include: {
        MenuItem: true;
      };
    };
  };
}>;

type OrderItemWithMenuItem = Prisma.OrderItemGetPayload<{
  include: {
    MenuItem: true;
  };
}>;

export default function OrderHistory() {
  const { orders, socket } = useContext(SocketContext);
  const theme = useMantineTheme();
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [editedItems, setEditedItems] = useState<OrderItemWithMenuItem[]>([]);

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

  const handleEditClick = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setEditedItems(order.OrderItem.map((item) => ({
      ...item,
      quantity: item.quantity
    })));
    setEditModalOpened(true);
  };

  const handleDeleteClick = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setDeleteModalOpened(true);
  };

  const handleUpdateOrder = () => {
    if (!socket || !selectedOrder) return;

    const updatedOrder = {
      ...selectedOrder,
      OrderItem: editedItems,
      total: editedItems.reduce((acc, item) => 
        acc + item.MenuItem.price * item.quantity, 0)
    };

    socket.emit("updateOrder", updatedOrder);
    setEditModalOpened(false);
    notifications.show({
      title: "更新完了",
      message: "注文が更新されました",
      color: "green",
    });
  };

  const handleDeleteOrder = () => {
    if (!socket || !selectedOrder) return;

    socket.emit("deleteOrder", { orderId: selectedOrder.id });
    setDeleteModalOpened(false);
    notifications.show({
      title: "削除完了",
      message: "注文が削除されました",
      color: "red",
    });
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    setEditedItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ).filter(item => item.quantity > 0));
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
                  <Group gap="xs">
                    <Badge variant="light" color="blue">
                      {formatDate(order.createdAt)}
                    </Badge>
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => handleEditClick(order)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => handleDeleteClick(order)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
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

      <Modal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        title="注文を編集"
        size="lg"
      >
        {selectedOrder && editedItems.length > 0 && (
          <Stack gap="md">
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
                {editedItems.map((item) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>{item.MenuItem.name}</Table.Td>
                    <Table.Td>{item.MenuItem.price}円</Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={item.quantity}
                        onChange={(value) => updateItemQuantity(item.id, Number(value) || 0)}
                        min={0}
                        max={99}
                        style={{ width: 80 }}
                      />
                    </Table.Td>
                    <Table.Td fw={500}>
                      {(item.MenuItem.price * item.quantity).toLocaleString()}円
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
            
            <Divider />
            
            <Group justify="space-between">
              <Text size="lg" fw={600}>
                合計金額
              </Text>
              <Text size="xl" fw={700} c={theme.primaryColor}>
                {editedItems.reduce((acc, item) => 
                  acc + item.MenuItem.price * item.quantity, 0).toLocaleString()}円
              </Text>
            </Group>
            
            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={() => setEditModalOpened(false)}>
                キャンセル
              </Button>
              <Button onClick={handleUpdateOrder}>
                更新
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title="注文を削除"
      >
        <Stack gap="md">
          <Text>
            この注文を削除してもよろしいですか？この操作は取り消せません。
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setDeleteModalOpened(false)}>
              キャンセル
            </Button>
            <Button color="red" onClick={handleDeleteOrder}>
              削除
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
