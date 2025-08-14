"use client";

import {
  Button,
  Card,
  Group,
  SimpleGrid,
  Text,
  Title,
  Stack,
  Badge,
  NumberInput,
  Paper,
  Divider,
  ScrollArea,
  ActionIcon,
  Grid,
  useMantineTheme,
} from "@mantine/core";
import {
  IconPlus,
  IconMinus,
  IconTrash,
  IconShoppingCart,
} from "@tabler/icons-react";
import { MenuItem, OrderItem } from "@/types/types";
import { useEffect, useState } from "react";
import { getMenu } from "../_actions/getMenu";
import { useContext } from "react";
import { LoadingContext } from "../_contexts/LoadingContext";
import { createOrder } from "../_actions/createOrder";
import { useRouter } from "next/navigation";

export default function OrderPage() {
  const { startLoading, stopLoading } = useContext(LoadingContext);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const theme = useMantineTheme();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        startLoading();
        const data = await getMenu();
        setMenuItems(data);
      } catch (error) {
        console.error(error);
      } finally {
        stopLoading();
      }
    })();
  }, [startLoading, stopLoading]);

  const handleAddItem = (menuItem: MenuItem) => {
    const existingItem = orderItems.find(
      (item) => item.menuItemId === menuItem.id
    );
    if (existingItem) {
      setOrderItems((prev) =>
        prev.map((item) =>
          item.menuItemId === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setOrderItems((prev) => [
        ...prev,
        {
          menuItemId: menuItem.id,
          quantity: 1,
          MenuItem: menuItem,
        },
      ]);
    }
  };

  const handleUpdateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setOrderItems((prev) =>
        prev.filter((item) => item.menuItemId !== menuItemId)
      );
    } else {
      setOrderItems((prev) =>
        prev.map((item) =>
          item.menuItemId === menuItemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleRemoveItem = (menuItemId: string) => {
    setOrderItems((prev) =>
      prev.filter((item) => item.menuItemId !== menuItemId)
    );
  };

  const totalAmount = orderItems.reduce(
    (acc, item) => acc + item.MenuItem.price * item.quantity,
    0
  );

  return (
    <Stack gap="xl">
      <Title order={1} size="h1" c={theme.primaryColor}>
        注文
      </Title>

      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="md">
            <Title order={2} size="h3">
              メニュー
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md" style={{ overflow: "visible" }}>
              {menuItems.map((menuItem) => {
                const cartItem = orderItems.find(
                  (item) => item.menuItemId === menuItem.id
                );
                const quantity = cartItem?.quantity || 0;
                
                return (
                  <Card
                    key={menuItem.id}
                    shadow="sm"
                    padding="md"
                    radius="md"
                    withBorder
                    style={{
                      cursor: "pointer",
                      transition: "transform 0.1s ease, box-shadow 0.1s ease",
                      WebkitTapHighlightColor: "transparent",
                      position: "relative",
                      overflow: "visible",
                    }}
                    onClick={() => handleAddItem(menuItem)}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = "scale(0.95)";
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                    onTouchStart={(e) => {
                      e.currentTarget.style.transform = "scale(0.95)";
                    }}
                    onTouchEnd={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    {quantity > 0 && (
                      <Badge
                        color="red"
                        size="lg"
                        circle
                        style={{
                          position: "absolute",
                          top: -10,
                          right: -10,
                          zIndex: 1,
                        }}
                      >
                        {quantity}
                      </Badge>
                    )}
                    <Stack gap="sm">
                      <Group justify="space-between">
                        <Text size="sm" fw={600}>
                          {menuItem.name}
                        </Text>
                        <Badge
                          color={theme.primaryColor}
                          size="xs"
                          variant="outline"
                        >
                          {menuItem.price}円
                        </Badge>
                      </Group>
                    </Stack>
                  </Card>
                );
              })}
            </SimpleGrid>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper shadow="md" p="lg" radius="md" withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={2} size="h3">
                  カート
                </Title>
                <Badge size="lg" variant="filled" color={theme.primaryColor}>
                  {orderItems.length} 品
                </Badge>
              </Group>

              <Divider />

              {orderItems.length === 0 ? (
                <Text c="dimmed" ta="center" py="xl">
                  カートは空です
                </Text>
              ) : (
                <ScrollArea h={300}>
                  <Stack gap="sm">
                    {orderItems.map((item) => (
                      <Paper key={item.menuItemId} p="sm" withBorder>
                        <Group justify="space-between" wrap="nowrap">
                          <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                            <Text fw={500} truncate>
                              {item.MenuItem.name}
                            </Text>
                            <Text size="sm" c="dimmed">
                              {item.MenuItem.price}円 × {item.quantity}
                            </Text>
                          </Stack>
                          <Group gap="xs" wrap="nowrap">
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              radius="md"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.menuItemId,
                                  item.quantity - 1
                                )
                              }
                            >
                              <IconMinus size={14} />
                            </ActionIcon>
                            <NumberInput
                              value={item.quantity}
                              onChange={(value) =>
                                handleUpdateQuantity(
                                  item.menuItemId,
                                  Number(value)
                                )
                              }
                              min={1}
                              max={99}
                              w={30}
                              size="xs"
                              hideControls
                            />
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              radius="md"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.menuItemId,
                                  item.quantity + 1
                                )
                              }
                            >
                              <IconPlus size={14} />
                            </ActionIcon>
                            <ActionIcon
                              size="sm"
                              color="red"
                              variant="subtle"
                              radius="md"
                              onClick={() => handleRemoveItem(item.menuItemId)}
                            >
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Group>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                </ScrollArea>
              )}

              <Divider />

              <Group justify="space-between">
                <Text size="lg" fw={600}>
                  合計金額
                </Text>
                <Text size="xl" fw={700} c={theme.primaryColor}>
                  {totalAmount.toLocaleString()}円
                </Text>
              </Group>

              <Button
                fullWidth
                size="lg"
                variant="filled"
                radius="md"
                leftSection={<IconShoppingCart size={20} />}
                onClick={async () => {
                  if (orderItems.length === 0) return;
                  startLoading();
                  try {
                    const orderData = orderItems.map((item) => ({
                      menuItemId: item.menuItemId,
                      quantity: item.quantity,
                    }));
                    await createOrder(orderData);
                    setOrderItems([]);
                    router.refresh();
                  } catch (error) {
                    console.error("Failed to create order:", error);
                  } finally {
                    stopLoading();
                  }
                }}
                disabled={orderItems.length === 0}
              >
                注文を確定する
              </Button>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
