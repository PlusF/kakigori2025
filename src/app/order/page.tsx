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
  useMantineTheme
} from "@mantine/core";
import { IconPlus, IconMinus, IconTrash, IconShoppingCart } from "@tabler/icons-react";
import { MenuItem, OrderItem } from "@/types/types";
import { useEffect, useState } from "react";
import { getMenu } from "../_actions/getMenu";
import { useContext } from "react";
import { SocketContext } from "../_contexts/SocketContext";
import { LoadingContext } from "../_contexts/LoadingContext";

export default function OrderPage() {
  const { socket } = useContext(SocketContext);
  const { setLoading } = useContext(LoadingContext);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const theme = useMantineTheme();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getMenu();
        setMenuItems(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [setLoading]);

  const handleAddItem = (menuItem: MenuItem) => {
    const existingItem = orderItems.find(item => item.menuItemId === menuItem.id);
    if (existingItem) {
      setOrderItems(prev => 
        prev.map(item => 
          item.menuItemId === menuItem.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setOrderItems(prev => [
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
      setOrderItems(prev => prev.filter(item => item.menuItemId !== menuItemId));
    } else {
      setOrderItems(prev => 
        prev.map(item => 
          item.menuItemId === menuItemId 
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const handleRemoveItem = (menuItemId: string) => {
    setOrderItems(prev => prev.filter(item => item.menuItemId !== menuItemId));
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
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
              {menuItems.map((menuItem) => (
                <Card 
                  key={menuItem.id} 
                  shadow="sm" 
                  padding="lg" 
                  radius="md" 
                  withBorder
                >
                  <Stack gap="sm">
                    <Text size="lg" fw={600}>
                      {menuItem.name}
                    </Text>
                    <Badge 
                      size="lg" 
                      variant="light" 
                      color={theme.primaryColor}
                    >
                      {menuItem.price}円
                    </Badge>
                    <Button
                      fullWidth
                      leftSection={<IconPlus size={18} />}
                      onClick={() => handleAddItem(menuItem)}
                      variant="filled"
                    >
                      カートに追加
                    </Button>
                  </Stack>
                </Card>
              ))}
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
                        <Group justify="space-between">
                          <Stack gap={4}>
                            <Text fw={500}>{item.MenuItem.name}</Text>
                            <Text size="sm" c="dimmed">
                              {item.MenuItem.price}円 × {item.quantity}
                            </Text>
                          </Stack>
                          <Group gap="xs">
                            <ActionIcon 
                              size="sm" 
                              variant="light"
                              onClick={() => handleUpdateQuantity(item.menuItemId, item.quantity - 1)}
                            >
                              <IconMinus size={14} />
                            </ActionIcon>
                            <NumberInput
                              value={item.quantity}
                              onChange={(value) => handleUpdateQuantity(item.menuItemId, Number(value))}
                              min={1}
                              max={99}
                              w={60}
                              size="sm"
                              hideControls
                            />
                            <ActionIcon 
                              size="sm" 
                              variant="light"
                              onClick={() => handleUpdateQuantity(item.menuItemId, item.quantity + 1)}
                            >
                              <IconPlus size={14} />
                            </ActionIcon>
                            <ActionIcon 
                              size="sm" 
                              color="red" 
                              variant="light"
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
                leftSection={<IconShoppingCart size={20} />}
                onClick={() => {
                  if (orderItems.length === 0) return;
                  setLoading(true);
                  socket?.emit("order", { orderItems });
                  setLoading(false);
                  setOrderItems([]);
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
