"use client";

import {
  Title,
  Stack,
  SimpleGrid,
  Card,
  Text,
  Badge,
  Image,
  useMantineTheme,
  Paper,
  Group,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { getMenu } from "../_actions/getMenu";
import { MenuItem } from "@/types/types";
import { useContext } from "react";
import { LoadingContext } from "../_contexts/LoadingContext";

export default function Menu() {
  const theme = useMantineTheme();
  const { startLoading, stopLoading } = useContext(LoadingContext);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

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

  return (
    <Stack gap="xl">
      <Title order={1} size="h1" c={theme.primaryColor}>
        メニュー
      </Title>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
        {menuItems.map((menuItem) => (
          <Card
            key={menuItem.id}
            shadow="sm"
            padding="md"
            radius="md"
            withBorder
          >
            {menuItem.image && (
              <Card.Section>
                <Image
                  src={menuItem.image}
                  height={160}
                  alt={menuItem.name}
                  fallbackSrc={`/images/${menuItem.image}`}
                />
              </Card.Section>
            )}

            <Stack gap="sm" mt={menuItem.image ? "md" : 0}>
              <Group justify="space-between">
                <Text size="sm">{menuItem.name}</Text>

                <Badge color={theme.primaryColor} size="xs">
                  {menuItem.price}円
                </Badge>
              </Group>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      {menuItems.length === 0 && (
        <Paper p="xl" withBorder>
          <Text ta="center" c="dimmed">
            メニューアイテムがありません
          </Text>
        </Paper>
      )}
    </Stack>
  );
}
